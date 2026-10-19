
import { pool } from '../database.js';

export class JogoRepository {
  async listar() {
    const resultado = await pool.query(`
      SELECT
        j.id_jogo, j.titulo, j.descricao, j.data_lancamento,
        j.desenvolvedora, j.capa, j.id_administrador,
        COALESCE(
          ARRAY_AGG(g.nome) FILTER (WHERE g.id_genero IS NOT NULL),
          ARRAY[]::VARCHAR[]
        ) AS generos
      FROM jogo j
      LEFT JOIN jogo_genero jg ON jg.id_jogo = j.id_jogo
      LEFT JOIN genero g ON g.id_genero = jg.id_genero
      GROUP BY j.id_jogo
      ORDER BY j.id_jogo;
    `);

    return resultado.rows;
  }

  async buscarPorId(id: number) {
    const resultado = await pool.query(`
      SELECT
        j.id_jogo, j.titulo, j.descricao, j.data_lancamento,
        j.desenvolvedora, j.capa, j.id_administrador,
        COALESCE(
          ARRAY_AGG(g.nome) FILTER (WHERE g.id_genero IS NOT NULL),
          ARRAY[]::VARCHAR[]
        ) AS generos
      FROM jogo j
      LEFT JOIN jogo_genero jg ON jg.id_jogo = j.id_jogo
      LEFT JOIN genero g ON g.id_genero = jg.id_genero
      WHERE j.id_jogo = $1
      GROUP BY j.id_jogo;
    `, [id]);

    return resultado.rows[0] ?? null;
  }

  
  async criar(dados: {
    titulo: string;
    descricao?: string | null;
    data_lancamento?: string | null;
    desenvolvedora?: string | null;
    capa?: string | null;
    id_administrador: number;
    generos?: number[];
  }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insercao = await client.query(`
        INSERT INTO jogo
          (titulo, descricao, data_lancamento, desenvolvedora, capa, id_administrador)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `, [
        dados.titulo.trim(),
        dados.descricao ?? null,
        dados.data_lancamento ?? null,
        dados.desenvolvedora ?? null,
        dados.capa ?? null,
        dados.id_administrador
      ]);

      const jogo = insercao.rows[0];
      const generos = dados.generos ?? [];

      for (const idGenero of generos) {
        await client.query(
          'INSERT INTO jogo_genero (id_jogo, id_genero) VALUES ($1, $2)',
          [jogo.id_jogo, idGenero]
        );
      }

      await client.query('COMMIT');

      return { ...jogo, generos };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  
async atualizar(id: number, dados: {
  titulo: string;
  descricao?: string | null;
  data_lancamento?: string | null;
  desenvolvedora?: string | null;
  capa?: string | null;
  id_administrador: number;
  generos?: number[];
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const resultado = await client.query(`
      UPDATE jogo
      SET titulo = $1, descricao = $2, data_lancamento = $3,
          desenvolvedora = $4, capa = $5, id_administrador = $6
      WHERE id_jogo = $7
      RETURNING *;
    `, [
      dados.titulo.trim(), dados.descricao ?? null,
      dados.data_lancamento ?? null, dados.desenvolvedora ?? null,
      dados.capa ?? null, dados.id_administrador, id
    ]);

    if (resultado.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    if (dados.generos !== undefined) {
      await client.query('DELETE FROM jogo_genero WHERE id_jogo = $1', [id]);

      for (const idGenero of dados.generos) {
        await client.query(
          'INSERT INTO jogo_genero (id_jogo, id_genero) VALUES ($1, $2)',
          [id, idGenero]
        );
      }
    }

    await client.query('COMMIT');
    return resultado.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
    async excluir(id: number): Promise<boolean> {
  const resultado = await pool.query(
    'DELETE FROM jogo WHERE id_jogo = $1',
    [id]
  );

  return (resultado.rowCount ?? 0) > 0;
}

    async estatisticas(id: number) {
  const resultado = await pool.query(`
    SELECT
      COUNT(a.id_avaliacao)::int AS quantidade_avaliacoes,
      COALESCE(ROUND(AVG(a.nota)::numeric, 2), 0) AS media_notas
    FROM jogo j
    LEFT JOIN avaliacao a ON a.id_jogo = j.id_jogo
    WHERE j.id_jogo = $1
  `, [id]);

  const existe = await pool.query(
    'SELECT 1 FROM jogo WHERE id_jogo = $1',
    [id]
  );

  if (existe.rowCount === 0) {
    return null;
  }

  return resultado.rows[0];
}

  async atualizarCapa(id: number, capa: string) {
  const resultado = await pool.query(
    `UPDATE jogo
     SET capa = $1
     WHERE id_jogo = $2
     RETURNING id_jogo, titulo, capa`,
    [capa, id]
  );

  return resultado.rows[0] ?? null;
}


}
