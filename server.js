import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Pool } from 'pg'

const servidor = Fastify()

servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})

const sql = new Pool({
    user: 'postgres',      
    password: 'senai',     
    host: 'localhost',
    port: 5432,
    database: 'barbearia_saep_simulado'
})

//ROTAS

//Cadastrar barbeiro

servidor.post('/barbeiros', async (request, reply) => {
    const body = request.body

    await sql.query(
        'INSERT INTO barbeiro (nome, email, cpf, senha) VALUES ($1, $2, $3, $4)',
        [body.nome, body.email, body.cpf, body.senha]
    )

    reply.status(201).send({ message: 'barbeiro cadastrado!' })
})


//Buscar barbeiro
servidor.get('/barbeiros', async (request, reply) => {
    const busca = request.query.busca

    if (busca) {
        const barbeiros = await sql.query(
            'SELECT id, nome FROM barbeiro WHERE nome ILIKE $1 ORDER BY id',
            [`%${busca}%`]
        )
        return reply.send(barbeiros.rows)
    }

    const barbeiros = await sql.query('SELECT id, nome FROM barbeiro ORDER BY id')
    reply.send(barbeiros.rows)
})


//Editar barbeiro 

servidor.put('/barbeiros/:id', async (request, reply) => {
    const body = request.body
    const id = request.params.id

    const barbeiro = await sql.query('SELECT id FROM barbeiro WHERE id = $1', [id])
    if (barbeiro.rows.length === 0) {
        return reply.status(404).send({ message: 'Barbeiro não existe!' })
    }

    await sql.query('UPDATE barbeiro SET nome = $2 WHERE id = $1', [id, body.nome])

    if (body.cpf) {
        await sql.query('UPDATE barbeiro SET cpf = $2 WHERE id = $1', [id, body.cpf])
    }
    if (body.senha) {
        await sql.query('UPDATE barbeiro SET senha = $2 WHERE id = $1', [id, body.senha])
    }

    reply.status(200).send({ message: `barbeiro ${body.nome} alterado!` })
})

//Deletar barbeiro

servidor.delete('/barbeiros/:id', async (request, reply) => {
    const id = request.params.id
    await sql.query('DELETE FROM barbeiro WHERE id = $1', [id])
    reply.status(200).send({ message: 'Barbeiro Deletado!' })
})




//Cadastrar cliente

servidor.post('/clientes', async (request, reply) => {
    const body = request.body

    // antes de gravar, confere se o barbeiro existe
    const barbeiro = await sql.query('SELECT id FROM barbeiro WHERE id = $1', [body.barbeiro_id])
    if (barbeiro.rows.length === 0) {
        return reply.status(400).send({ message: 'Barbeiro informado não existe!' })
    }

    await sql.query(
        'INSERT INTO cliente (nome, cpf, barbeiro_id) VALUES ($1, $2, $3)',
        [body.nome, body.cpf, body.barbeiro_id]
    )

    reply.status(201).send({ message: 'cliente cadastrado!' })
})


//Listar clientes

servidor.get('/clientes', async (request, reply) => {
    const clientes = await sql.query(`
        SELECT cliente.*, barbeiro.nome AS barbeiro_nome
        FROM cliente
        INNER JOIN barbeiro ON cliente.barbeiro_id = barbeiro.id
        ORDER BY cliente.id
    `)
    reply.send(clientes.rows)
})



//Cadastrar agendamentos

servidor.post('/agendamentos', async (request, reply) => {
    const body = request.body

    if (!body.barbeiro_id || !body.cliente_id || !body.data_hora) {
        return reply.status(400).send({ message: 'Preencha todos os campos' })
    }

     const barbeiro = await sql.query('SELECT id FROM barbeiro WHERE id = $1', [body.barbeiro_id])
    if (barbeiro.rows.length === 0) {
        return reply.status(400).send({ message: 'Barbeiro informado não existe!' })
    }

     const cliente = await sql.query('SELECT id FROM cliente WHERE id = $1', [body.cliente_id])
    if (cliente.rows.length === 0) {
        return reply.status(400).send({ message: 'Cliente informado não existe!' })
    }

    await sql.query(
        'INSERT INTO agendamento (cliente_id, barbeiro_id, data_hora) VALUES ($1, $2, $3)',
        [body.cliente_id, body.barbeiro_id, body.data_hora]
    )

    reply.status(201).send({ message: 'agendamento cadastrado!' })
})

// Listar agendamentos por ordem de data

servidor.get('/agendamentos', async (request, reply) => {
    const agendamentos = await sql.query(`
        SELECT
            agendamento.id,
            agendamento.data_hora,
            barbeiro.id AS barbeiro_id,
            barbeiro.nome AS barbeiro_nome,
            cliente.id AS cliente_id,
            cliente.nome AS cliente_nome,
            cliente.cpf AS cliente_cpf
        FROM agendamento
        INNER JOIN barbeiro ON agendamento.barbeiro_id = barbeiro.id
        INNER JOIN cliente ON agendamento.cliente_id = cliente.id
        ORDER BY agendamento.data_hora ASC
    `)
    reply.send(agendamentos.rows)
})


//Editar data de agendamento

servidor.put('/agendamentos/:id', async (request, reply) => {
    const body = request.body
    const id = request.params.id

    const resultado = await sql.query(
        'UPDATE agendamento SET data_hora = $2 WHERE id = $1',
        [id, body.data_hora]
    )

    if (resultado.rowCount === 0) {
        return reply.status(404).send({ message: 'Agendamento não existe!' })
    }

    reply.status(200).send({ message: 'Data do agendamento atualizada!' })
})


//LOGIN barbeiro

servidor.post('/login', async (request, reply) => {
    const body = request.body

    if (!body || !body.email || !body.senha) {
        return reply.status(400).send({ message: 'E-mail e senha são obrigatórios!' })
    }

    const resultado = await sql.query('SELECT * FROM barbeiro WHERE email = $1', [body.email])

    if (resultado.rows.length === 0) {
        return reply.status(401).send({ message: 'Usuário ou senha inválidos!' })
    }

    const barbeiro = resultado.rows[0]

    if (body.senha !== barbeiro.senha) {
        return reply.status(401).send({ message: 'Usuário ou senha inválidos!' })
    }

    return reply.status(200).send({
        message: 'Login realizado com sucesso!',
        usuario: { id: barbeiro.id, nome: barbeiro.nome }
    })
})



servidor.listen({
    port: 3000
})