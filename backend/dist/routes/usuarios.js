import { Router } from 'express';
import { pool } from '../database.js';
const router = Router();
// READ: listar usuários sem expor senha_hash
router.get('/', async (_req, res) => {
    try {
        const resultado = await pool.query(`
      SELECT id_usuario, nome, email, data_cadastro,
             foto_perfil, biografia
      FROM usuario
      ORDER BY id_usuario;
    `);
        res.json(resultado.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao listar usuários.' });
    }
});
// READ: buscar usuário por ID
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }
        const resultado = await pool.query(`
      SELECT id_usuario, nome, email, data_cadastro,
             foto_perfil, biografia
      FROM usuario
      WHERE id_usuario = $1;
    `, [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        res.json(resultado.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao buscar usuário.' });
    }
});
// CREATE: criar usuário
router.post('/', async (req, res) => {
    const { nome, email, senha_hash, foto_perfil, biografia } = req.body;
    if (typeof nome !== 'string' || !nome.trim() ||
        typeof email !== 'string' || !email.trim() ||
        typeof senha_hash !== 'string' || !senha_hash.trim()) {
        return res.status(400).json({
            mensagem: 'Nome, e-mail e senha_hash são obrigatórios.'
        });
    }
    try {
        const resultado = await pool.query(`
      INSERT INTO usuario (nome, email, senha_hash, foto_perfil, biografia)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_usuario, nome, email, data_cadastro,
                foto_perfil, biografia;
    `, [
            nome.trim(),
            email.trim(),
            senha_hash,
            foto_perfil ?? null,
            biografia ?? null
        ]);
        res.status(201).json(resultado.rows[0]);
    }
    catch (error) {
        const codigo = error.code;
        if (codigo === '23505') {
            return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
        }
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao criar usuário.' });
    }
});
// UPDATE: atualizar usuário
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { nome, email, senha_hash, foto_perfil, biografia } = req.body;
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }
    if (typeof nome !== 'string' || !nome.trim() ||
        typeof email !== 'string' || !email.trim() ||
        typeof senha_hash !== 'string' || !senha_hash.trim()) {
        return res.status(400).json({
            mensagem: 'Nome, e-mail e senha_hash são obrigatórios.'
        });
    }
    try {
        const resultado = await pool.query(`
      UPDATE usuario
      SET nome = $1, email = $2, senha_hash = $3,
          foto_perfil = $4, biografia = $5
      WHERE id_usuario = $6
      RETURNING id_usuario, nome, email, data_cadastro,
                foto_perfil, biografia;
    `, [
            nome.trim(),
            email.trim(),
            senha_hash,
            foto_perfil ?? null,
            biografia ?? null,
            id
        ]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        res.json(resultado.rows[0]);
    }
    catch (error) {
        const codigo = error.code;
        if (codigo === '23505') {
            return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
        }
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' });
    }
});
// DELETE: excluir usuário
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }
        const resultado = await pool.query('DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            mensagem: 'Erro ao excluir usuário. Verifique as dependências desse usuário.'
        });
    }
});
export default router;
