CREATE TABLE barbeiro(
	id serial primary key,
	nome varchar(255) NOT NULL,
	email varchar(255) NOT NULL UNIQUE,
	cpf varchar(255) NOT NULL,
	senha varchar(255)NOT NULL
);

CREATE TABLE cliente(
	id serial primary key,
	nome varchar(255) NOT NULL,
	cpf varchar(255) NOT NULL,
	barbeiro_id integer NOT NULL references barbeiro(id) ON DELETE CASCADE
	
);

CREATE TABLE agendamento(
	id serial primary key,
	data_hora timestamp NOT NULL,
	barbeiro_id integer NOT NULL references barbeiro(id) ON DELETE CASCADE,
	cliente_id integer NOT NULL references cliente(id) ON DELETE CASCADE
);

INSERT INTO barbeiro (nome, email, cpf, senha) VALUES
('João', 'joao@gmail', '444.555.666-77', 'senha123'),
('Rafaelo', 'rafaelo@gmail', '555.666.777-88', 'senha456'),
('Juliana', 'juliana@gmail', '666.777.888-99', 'senha789');

INSERT INTO cliente(nome, cpf, barbeiro_id) VALUES
('Edson', '433.551.666-87', 2),
('Marcos', '885.606.775-81', 2),
('Wellington', '666.377.128-09', 1);

INSERT INTO agendamento(data_hora, barbeiro_id, cliente_id) VALUES
('2026-11-24T18:30:00', 2, 1),
('2026-11-26T14:00:00', 3, 1),
('2026-12-02T16:00:00', 2, 2);

SELECT * FROM barbeiro;
SELECT * FROM cliente;
SELECT * FROM agendamento ORDER BY data_hora ASC;