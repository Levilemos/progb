import { pool } from '../database.js';

export class GeneroRepository {
  async listar() {
    const resultado = await pool.query(
      'SELECT id_genero, nome, descricao FROM genero ORDER BY id_genero'
    );

    return resultado.rows;
  }

  async buscarPorId(id: number) {
    const resultado = await pool.query(
      'SELECT id_genero, nome, descricao FROM genero WHERE id_genero = $1',
      [id]
    );

    return resultado.rows[0] ?? null;
  }

  async criar(dados: { nome: string; descricao?: string | null }) {
    const resultado = await pool.query(
      'INSERT INTO genero (nome, descricao) VALUES ($1, $2) RETURNING *',
      [dados.nome.trim(), dados.descricao ?? null]
    );

    return resultado.rows[0];
  }

  async atualizar(
    id: number,
    dados: { nome: string; descricao?: string | null }
  ) {
    const resultado = await pool.query(
      `UPDATE genero
       SET nome = $1, descricao = $2
       WHERE id_genero = $3
       RETURNING *`,
      [dados.nome.trim(), dados.descricao ?? null, id]
    );

    return resultado.rows[0] ?? null;
  }

  async excluir(id: number): Promise<boolean> {
    const resultado = await pool.query(
      'DELETE FROM genero WHERE id_genero = $1 RETURNING id_genero',
      [id]
    );

    return (resultado.rowCount ?? 0) > 0;
  }
}