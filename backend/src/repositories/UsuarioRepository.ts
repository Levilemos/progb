import { pool } from '../database.js';

export class UsuarioRepository {
  async listar() {
    const resultado = await pool.query(`
      SELECT id_usuario, nome, email, data_cadastro,
             foto_perfil, biografia
      FROM usuario
      ORDER BY id_usuario;
    `);

    return resultado.rows;
  }

  async buscarPorId(id: number) {
    const resultado = await pool.query(`
      SELECT id_usuario, nome, email, data_cadastro,
             foto_perfil, biografia
      FROM usuario
      WHERE id_usuario = $1;
    `, [id]);

    return resultado.rows[0] ?? null;
  }

  async criar(dados: {
    nome: string;
    email: string;
    senha_hash: string;
    foto_perfil?: string | null;
    biografia?: string | null;
  }) {
    const resultado = await pool.query(`
      INSERT INTO usuario (nome, email, senha_hash, foto_perfil, biografia)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_usuario, nome, email, data_cadastro,
                foto_perfil, biografia;
    `, [
      dados.nome.trim(),
      dados.email.trim(),
      dados.senha_hash,
      dados.foto_perfil ?? null,
      dados.biografia ?? null
    ]);

    return resultado.rows[0];
  }

  
async atualizar(id: number, dados: {
  nome: string;
  email: string;
  senha_hash?: string;
  foto_perfil?: string | null;
  biografia?: string | null;
}) {
  const resultado = await pool.query(`
    UPDATE usuario
    SET nome = $1,
        email = $2,
        senha_hash = COALESCE($3, senha_hash),
        foto_perfil = $4,
        biografia = $5
    WHERE id_usuario = $6
    RETURNING id_usuario, nome, email, data_cadastro,
              foto_perfil, biografia;
  `, [
    dados.nome.trim(),
    dados.email.trim(),
    dados.senha_hash ?? null,
    dados.foto_perfil ?? null,
    dados.biografia ?? null,
    id
  ]);

  return resultado.rows[0] ?? null;
}


  async excluir(id: number): Promise<boolean> {
    const resultado = await pool.query(
      'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario',
      [id]
    );

    return (resultado.rowCount ?? 0) > 0;
  }

  
async buscarPorEmail(email: string) {
  const resultado = await pool.query(`
    SELECT id_usuario, nome, email, senha_hash
    FROM usuario
    WHERE email = $1;
  `, [email]);

  return resultado.rows[0] ?? null;
}

}