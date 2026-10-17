
import { Router } from 'express';
import { pool } from '../database.js';

const router = Router();

// Listar todos os gêneros
router.get('/', async (_req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id_genero, nome, descricao FROM genero ORDER BY id_genero'
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar gêneros.' });
  }
});

// Buscar um gênero pelo ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await pool.query(
      'SELECT id_genero, nome, descricao FROM genero WHERE id_genero = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Gênero não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar gênero.' });
  }
});

// Criar gênero
router.post('/', async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({ mensagem: 'O nome é obrigatório.' });
    }

    const resultado = await pool.query(
      'INSERT INTO genero (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome.trim(), descricao ?? null]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return res.status(409).json({ mensagem: 'Já existe um gênero com esse nome.' });
    }

    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao criar gênero.' });
  }
});

// Atualizar gênero
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, descricao } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    if (typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({ mensagem: 'O nome é obrigatório.' });
    }

    const resultado = await pool.query(
      `UPDATE genero
       SET nome = $1, descricao = $2
       WHERE id_genero = $3
       RETURNING *`,
      [nome.trim(), descricao ?? null, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Gênero não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return res.status(409).json({ mensagem: 'Já existe um gênero com esse nome.' });
    }

    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar gênero.' });
  }
});

// Excluir gênero
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await pool.query(
      'DELETE FROM genero WHERE id_genero = $1 RETURNING id_genero',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Gênero não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao excluir gênero.' });
  }
});

export default router;
