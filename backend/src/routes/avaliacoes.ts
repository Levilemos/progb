import { Router } from 'express';
import { pool } from '../database.js';

const router = Router();

// READ: listar avaliações
router.get('/', async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT a.*, u.nome AS usuario, j.titulo AS jogo
      FROM avaliacao a
      JOIN usuario u ON u.id_usuario = a.id_usuario
      JOIN jogo j ON j.id_jogo = a.id_jogo
      ORDER BY a.id_avaliacao;
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar avaliações.' });
  }
});

// READ: buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await pool.query(
      'SELECT * FROM avaliacao WHERE id_avaliacao = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar avaliação.' });
  }
});

// CREATE: criar avaliação
router.post('/', async (req, res) => {
  const { id_usuario, id_jogo, nota, comentario } = req.body;

  if (!Number.isInteger(id_usuario) || id_usuario < 1 ||
      !Number.isInteger(id_jogo) || id_jogo < 1 ||
      !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return res.status(400).json({
      mensagem: 'Informe IDs válidos e uma nota de 1 a 5.'
    });
  }

  if (comentario != null && typeof comentario !== 'string') {
    return res.status(400).json({ mensagem: 'Comentário inválido.' });
  }

  try {
    const resultado = await pool.query(`
      INSERT INTO avaliacao (id_usuario, id_jogo, nota, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [id_usuario, id_jogo, nota, comentario ?? null]);

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    const codigo = (error as { code?: string }).code;

    if (codigo === '23505') {
      return res.status(409).json({
        mensagem: 'Este usuário já avaliou este jogo.'
      });
    }
    if (codigo === '23503') {
      return res.status(400).json({
        mensagem: 'Usuário ou jogo não encontrado.'
      });
    }

    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao criar avaliação.' });
  }
});

// UPDATE: atualizar avaliação
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { id_usuario, id_jogo, nota, comentario } = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mensagem: 'ID inválido.' });
  }

  if (!Number.isInteger(id_usuario) || id_usuario < 1 ||
      !Number.isInteger(id_jogo) || id_jogo < 1 ||
      !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return res.status(400).json({
      mensagem: 'Informe IDs válidos e uma nota de 1 a 5.'
    });
  }

  if (comentario != null && typeof comentario !== 'string') {
    return res.status(400).json({ mensagem: 'Comentário inválido.' });
  }

  try {
    const resultado = await pool.query(`
      UPDATE avaliacao
      SET id_usuario = $1, id_jogo = $2, nota = $3, comentario = $4
      WHERE id_avaliacao = $5
      RETURNING *;
    `, [id_usuario, id_jogo, nota, comentario ?? null, id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    const codigo = (error as { code?: string }).code;

    if (codigo === '23505') {
      return res.status(409).json({
        mensagem: 'Este usuário já avaliou este jogo.'
      });
    }
    if (codigo === '23503') {
      return res.status(400).json({
        mensagem: 'Usuário ou jogo não encontrado.'
      });
    }

    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar avaliação.' });
  }
});

// DELETE: excluir avaliação
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await pool.query(
      'DELETE FROM avaliacao WHERE id_avaliacao = $1 RETURNING id_avaliacao',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao excluir avaliação.' });
  }
});

export default router;