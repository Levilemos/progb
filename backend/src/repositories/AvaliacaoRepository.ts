
import { pool } from '../database.js';

export class AvaliacaoRepository {
  async listar() {
    const resultado = await pool.query(`
      SELECT a.*, u.nome AS usuario, j.titulo AS jogo
      FROM avaliacao a
      JOIN usuario u ON u.id_usuario = a.id_usuario
      JOIN jogo j ON j.id_jogo = a.id_jogo
      ORDER BY a.id_avaliacao;
    `);

    return resultado.rows;
  }

  async buscarPorId(id: number) {
    const resultado = await pool.query(
      'SELECT * FROM avaliacao WHERE id_avaliacao = $1',
      [id]
    );

    return resultado.rows[0] ?? null;
  }

  async criar(dados: {
    id_usuario: number;
    id_jogo: number;
    nota: number;
    comentario?: string | null;
  }) {
    const resultado = await pool.query(`
      INSERT INTO avaliacao (id_usuario, id_jogo, nota, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [
      dados.id_usuario,
      dados.id_jogo,
      dados.nota,
      dados.comentario ?? null
    ]);

    return resultado.rows[0];
  }

  async atualizar(id: number, dados: {
    id_usuario: number;
    id_jogo: number;
    nota: number;
    comentario?: string | null;
  }) {
    const resultado = await pool.query(`
      UPDATE avaliacao
      SET id_usuario = $1,
          id_jogo = $2,
          nota = $3,
          comentario = $4
      WHERE id_avaliacao = $5
      RETURNING *;
    `, [
      dados.id_usuario,
      dados.id_jogo,
      dados.nota,
      dados.comentario ?? null,
      id
    ]);

    return resultado.rows[0] ?? null;
  }

  async excluir(id: number): Promise<boolean> {
    const resultado = await pool.query(
      'DELETE FROM avaliacao WHERE id_avaliacao = $1 RETURNING id_avaliacao',
      [id]
    );

    return (resultado.rowCount ?? 0) > 0;
  }
}
