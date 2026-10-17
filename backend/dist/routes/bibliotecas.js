import { Router } from 'express';
import { pool } from '../database.js';
const router = Router();
// READ: listar bibliotecas
router.get('/', async (_req, res) => {
    try {
        const resultado = await pool.query(`
      SELECT b.*, u.nome AS jogador
      FROM biblioteca b
      JOIN jogador j ON j.id_usuario = b.id_jogador
      JOIN usuario u ON u.id_usuario = j.id_usuario
      ORDER BY b.id_biblioteca;
    `);
        res.json(resultado.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao listar bibliotecas.' });
    }
});
// READ: buscar biblioteca por ID
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }
        const resultado = await pool.query('SELECT * FROM biblioteca WHERE id_biblioteca = $1', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Biblioteca não encontrada.' });
        }
        res.json(resultado.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao buscar biblioteca.' });
    }
});
// CREATE: criar biblioteca
router.post('/', async (req, res) => {
    const { id_jogador, descricao, privacidade } = req.body;
    if (!Number.isInteger(id_jogador) || id_jogador < 1) {
        return res.status(400).json({ mensagem: 'ID de jogador inválido.' });
    }
    if (descricao != null && typeof descricao !== 'string') {
        return res.status(400).json({ mensagem: 'Descrição inválida.' });
    }
    const nivelPrivacidade = privacidade ?? 'PUBLICA';
    if (!['PUBLICA', 'PRIVADA'].includes(nivelPrivacidade)) {
        return res.status(400).json({
            mensagem: 'A privacidade deve ser PUBLICA ou PRIVADA.'
        });
    }
    try {
        const resultado = await pool.query(`
      INSERT INTO biblioteca (id_jogador, descricao, privacidade)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [id_jogador, descricao ?? null, nivelPrivacidade]);
        res.status(201).json(resultado.rows[0]);
    }
    catch (error) {
        const codigo = error.code;
        if (codigo === '23505') {
            return res.status(409).json({
                mensagem: 'Este jogador já possui uma biblioteca.'
            });
        }
        if (codigo === '23503') {
            return res.status(400).json({ mensagem: 'Jogador não encontrado.' });
        }
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao criar biblioteca.' });
    }
});
// UPDATE: atualizar biblioteca
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { id_jogador, descricao, privacidade } = req.body;
    if (!Number.isInteger(id) || id < 1 ||
        !Number.isInteger(id_jogador) || id_jogador < 1) {
        return res.status(400).json({ mensagem: 'IDs inválidos.' });
    }
    if (descricao != null && typeof descricao !== 'string') {
        return res.status(400).json({ mensagem: 'Descrição inválida.' });
    }
    const nivelPrivacidade = privacidade ?? 'PUBLICA';
    if (!['PUBLICA', 'PRIVADA'].includes(nivelPrivacidade)) {
        return res.status(400).json({
            mensagem: 'A privacidade deve ser PUBLICA ou PRIVADA.'
        });
    }
    try {
        const resultado = await pool.query(`
      UPDATE biblioteca
      SET id_jogador = $1, descricao = $2, privacidade = $3
      WHERE id_biblioteca = $4
      RETURNING *;
    `, [id_jogador, descricao ?? null, nivelPrivacidade, id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Biblioteca não encontrada.' });
        }
        res.json(resultado.rows[0]);
    }
    catch (error) {
        const codigo = error.code;
        if (codigo === '23505') {
            return res.status(409).json({
                mensagem: 'Este jogador já possui uma biblioteca.'
            });
        }
        if (codigo === '23503') {
            return res.status(400).json({ mensagem: 'Jogador não encontrado.' });
        }
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao atualizar biblioteca.' });
    }
});
// DELETE: excluir biblioteca
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }
        const resultado = await pool.query('DELETE FROM biblioteca WHERE id_biblioteca = $1 RETURNING id_biblioteca', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Biblioteca não encontrada.' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao excluir biblioteca.' });
    }
});
export default router;
