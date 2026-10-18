
CREATE TABLE usuario (
    id_usuario      SERIAL        PRIMARY KEY,
    nome            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    senha_hash      VARCHAR(255)  NOT NULL,
    data_cadastro   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    foto_perfil     VARCHAR(255),
    biografia       TEXT
);


CREATE TABLE jogador (
    id_usuario  INT  PRIMARY KEY
                     REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    nivel       INT  NOT NULL DEFAULT 1 CHECK (nivel >= 1)
);


CREATE TABLE administrador (
    id_usuario      INT           PRIMARY KEY
                                  REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    cargo           VARCHAR(100)  NOT NULL,
    data_promocao   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permissoes      VARCHAR(255)
);


CREATE TABLE genero (
    id_genero   SERIAL        PRIMARY KEY,
    nome        VARCHAR(50)   NOT NULL UNIQUE,
    descricao   TEXT
);


CREATE TABLE jogo (
    id_jogo           SERIAL        PRIMARY KEY,
    titulo            VARCHAR(150)  NOT NULL,
    descricao         TEXT,
    data_lancamento   DATE,
    desenvolvedora    VARCHAR(100),
    capa              VARCHAR(255),
    id_administrador  INT           NOT NULL
                                    REFERENCES administrador (id_usuario)
                                    ON DELETE RESTRICT
);


CREATE TABLE jogo_genero (
    id_jogo     INT  NOT NULL REFERENCES jogo   (id_jogo)   ON DELETE CASCADE,
    id_genero   INT  NOT NULL REFERENCES genero (id_genero) ON DELETE CASCADE,
    PRIMARY KEY (id_jogo, id_genero)
);


CREATE TABLE biblioteca (
    id_biblioteca  SERIAL       PRIMARY KEY,
    id_jogador     INT          NOT NULL UNIQUE
                                REFERENCES jogador (id_usuario) ON DELETE CASCADE,
    descricao      TEXT,
    privacidade    VARCHAR(10)  NOT NULL DEFAULT 'PUBLICA'
                                CHECK (privacidade IN ('PUBLICA', 'PRIVADA')),
    data_criacao   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE item_biblioteca (
    id_item        SERIAL       PRIMARY KEY,
    id_biblioteca  INT          NOT NULL
                                REFERENCES biblioteca (id_biblioteca) ON DELETE CASCADE,
    id_jogo        INT          NOT NULL
                                REFERENCES jogo (id_jogo) ON DELETE CASCADE,
    status         VARCHAR(15)  NOT NULL DEFAULT 'QUERO_JOGAR'
                                CHECK (status IN ('QUERO_JOGAR', 'JOGANDO', 'ZERADO', 'ABANDONADO')),
    data_adicao    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_biblioteca, id_jogo)
);


CREATE TABLE avaliacao (
    id_avaliacao   SERIAL     PRIMARY KEY,
    id_usuario     INT        NOT NULL
                              REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    id_jogo        INT        NOT NULL
                              REFERENCES jogo (id_jogo) ON DELETE CASCADE,
    nota           INT        NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario     TEXT,
    data_criacao   TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_usuario, id_jogo)
);


INSERT INTO usuario (nome, email, senha_hash) VALUES
    ('Ana Admin',  'ana@exemplo.com',   'hash_exemplo_1'),
    ('Bruno Jogador', 'bruno@exemplo.com', 'hash_exemplo_2'),
    ('Carla Jogadora', 'carla@exemplo.com', 'hash_exemplo_3');

INSERT INTO administrador (id_usuario, cargo, permissoes) VALUES
    (1, 'Moderadora', 'cadastrar_jogos');

INSERT INTO jogador (id_usuario, nivel) VALUES
    (2, 1),
    (3, 5);

INSERT INTO genero (nome, descricao) VALUES
    ('Acao', 'Jogos de combate e reflexos'),
    ('RPG',  'Jogos de interpretacao de personagens');

INSERT INTO jogo (titulo, descricao, data_lancamento, desenvolvedora, id_administrador) VALUES
    ('Jogo Exemplo A', 'Descricao do jogo A', '2020-05-10', 'Estudio X', 1),
    ('Jogo Exemplo B', 'Descricao do jogo B', '2022-11-03', 'Estudio Y', 1);

INSERT INTO jogo_genero (id_jogo, id_genero) VALUES
    (1, 1), (1, 2), (2, 2);

INSERT INTO biblioteca (id_jogador, descricao, privacidade) VALUES
    (2, 'Minha colecao', 'PUBLICA'),
    (3, 'Favoritos da Carla', 'PRIVADA');

INSERT INTO item_biblioteca (id_biblioteca, id_jogo, status) VALUES
    (1, 1, 'JOGANDO'),
    (1, 2, 'QUERO_JOGAR'),
    (2, 1, 'ZERADO');

INSERT INTO avaliacao (id_usuario, id_jogo, nota, comentario) VALUES
    (2, 1, 4, 'Muito bom!'),
    (3, 1, 5, 'Um dos melhores'),
    (2, 2, 3, 'Razoavel');


