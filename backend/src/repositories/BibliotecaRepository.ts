
import { pool } from '../database.js';

export class BibliotecaRepository {
  async listar() {
    const resultado = await pool.query(`
      SELECT b.*, u.nome AS jogador
      FROM biblioteca b
      JOIN jogador j ON j.id_usuario = b.id_jogador
      JOIN usuario u ON u.id_usuario = j.id_usuario
      ORDER BY b.id_biblioteca;
    `);

    return resultado.rows;
  }

  async buscarPorId(id: number) {
    const resultado = await pool.query(
      'SELECT * FROM biblioteca WHERE id_biblioteca = $1',
      [id]
    );

    return resultado.rows[0] ?? null;
  }

  async criar(dados: {
    id_jogador: number;
    descricao?: string | null;
    privacidade?: 'PUBLICA' | 'PRIVADA';
  }) {
    const resultado = await pool.query(`
      INSERT INTO biblioteca (id_jogador, descricao, privacidade)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [
      dados.id_jogador,
      dados.descricao ?? null,
      dados.privacidade ?? 'PUBLICA'
    ]);

    return resultado.rows[0];
  }

  async atualizar(id: number, dados: {
    id_jogador: number;
    descricao?: string | null;
    privacidade?: 'PUBLICA' | 'PRIVADA';
  }) {
    const resultado = await pool.query(`
      UPDATE biblioteca
      SET id_jogador = $1,
          descricao = $2,
          privacidade = $3
      WHERE id_biblioteca = $4
      RETURNING *;
    `, [
      dados.id_jogador,
      dados.descricao ?? null,
      dados.privacidade ?? 'PUBLICA',
      id
    ]);

    return resultado.rows[0] ?? null;
  }

  async excluir(id: number): Promise<boolean> {
    const resultado = await pool.query(
      'DELETE FROM biblioteca WHERE id_biblioteca = $1 RETURNING id_biblioteca',
      [id]
    );

    return (resultado.rowCount ?? 0) > 0;
  }
}
