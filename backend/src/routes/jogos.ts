
import { Router } from 'express';
import { pool } from '../database.js';

const router = Router();

// Listar todos os jogos
router.get('/', async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        j.id_jogo,
        j.titulo,
        j.descricao,
        j.data_lancamento,
        j.desenvolvedora,
        j.capa,
        j.id_administrador,
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

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar jogos.' });
  }
});

// Buscar um jogo pelo ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await pool.query(`
      SELECT
        j.id_jogo,
        j.titulo,
        j.descricao,
        j.data_lancamento,
        j.desenvolvedora,
        j.capa,
        j.id_administrador,
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

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar jogo.' });
  }
});

// Cadastrar um jogo
router.post('/', async (req, res) => {
  const { titulo, descricao, data_lancamento, desenvolvedora, capa, id_administrador, generos } = req.body;

  if (typeof titulo !== 'string' || !titulo.trim()) {
    return res.status(400).json({ mensagem: 'O título é obrigatório.' });
  }

  if (!Number.isInteger(id_administrador) || id_administrador < 1) {
    return res.status(400).json({ mensagem: 'Informe um ID de administrador válido.' });
  }

  if (generos !== undefined &&
      (!Array.isArray(generos) ||
       !generos.every((id: unknown) => Number.isInteger(id) && Number(id) > 0))) {
    return res.status(400).json({ mensagem: 'Generos deve ser uma lista de IDs válidos.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insercao = await client.query(`
      INSERT INTO jogo
        (titulo, descricao, data_lancamento, desenvolvedora, capa, id_administrador)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      titulo.trim(),
      descricao ?? null,
      data_lancamento ?? null,
      desenvolvedora ?? null,
      capa ?? null,
      id_administrador
    ]);

    const jogo = insercao.rows[0];
    const idsGeneros: number[] = generos ?? [];

    for (const idGenero of idsGeneros) {
      await client.query(
        'INSERT INTO jogo_genero (id_jogo, id_genero) VALUES ($1, $2)',
        [jogo.id_jogo, idGenero]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...jogo,
      generos: idsGeneros
    });
  } catch (error) {
    await client.query('ROLLBACK');
    const codigo = (error as { code?: string }).code;

    if (codigo === '23503') {
      return res.status(400).json({
        mensagem: 'O administrador ou algum gênero informado não existe.'
      });
    }

    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar jogo.' });
  } finally {
    client.release();
  }
});

// Atualizar um jogo
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, descricao, data_lancamento, desenvolvedora, capa, id_administrador, generos } = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  if (typeof titulo !== 'string' || !titulo.trim()) {
    return res.status(400).json({ mensagem: 'O título é obrigatório.' });
  }

  if (!Number.isInteger(id_administrador) || id_administrador < 1) {
    return res.status(400).json({ mensagem: 'Informe um ID de administrador válido.' });
  }

  if (generos !== undefined &&
      (!Array.isArray(generos) ||
       !generos.every((id: unknown) => Number.isInteger(id) && Number(id) > 0))) {
    return res.status(400).json({ mensagem: 'Generos deve ser uma lista de IDs válidos.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const atualizacao = await client.query(`
      UPDATE jogo
      SET titulo = $1,
          descricao = $2,
          data_lancamento = $3,
          desenvolvedora = $4,
          capa = $5,
          id_administrador = $6
      WHERE id_jogo = $7
      RETURNING *;
    `, [
      titulo.trim(),
      descricao ?? null,
      data_lancamento ?? null,
      desenvolvedora ?? null,
      capa ?? null,
      id_administrador,
      id
    ]);

    if (atualizacao.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    if (generos !== undefined) {
      await client.query('DELETE FROM jogo_genero WHERE id_jogo = $1', [id]);

      for (const idGenero of generos as number[]) {
        await client.query(
          'INSERT INTO jogo_genero (id_jogo, id_genero) VALUES ($1, $2)',
          [id, idGenero]
        );
      }
    }

    await client.query('COMMIT');
    res.json(atualizacao.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    const codigo = (error as { code?: string }).code;

    if (codigo === '23503') {
      return res.status(400).json({
        mensagem: 'O administrador ou algum gênero informado não existe.'
      });
    }

    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar jogo.' });
  } finally {
    client.release();
  }
});

// Excluir um jogo
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await pool.query(
      'DELETE FROM jogo WHERE id_jogo = $1 RETURNING id_jogo',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao excluir jogo.' });
  }
});

export default router;
