
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JogoController } from '../controllers/JogoController.js';

const router = Router();
const controller = new JogoController();

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(process.cwd(), 'uploads'),
    filename: (_req, file, callback) => {
      const extensao = path.extname(file.originalname).toLowerCase();
      callback(null, `${randomUUID()}${extensao}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(
        new Error('Envie uma imagem JPG, PNG, WEBP ou GIF.')
      );
    }

    callback(null, true);
  },
});

// Enviar capa de um jogo
router.post('/:id/capa', (req, res, next) => {
  upload.single('capa')(req, res, (error) => {
    if (error) {
      const mensagem =
        error instanceof multer.MulterError &&
        error.code === 'LIMIT_FILE_SIZE'
          ? 'A imagem deve ter no máximo 5 MB.'
          : error.message;

      return res.status(400).json({ mensagem });
    }

    next();
  });
}, controller.atualizarCapa);

// Listar todos os jogos
router.get('/', controller.listar);

// Consultar estatísticas
router.get('/:id/estatisticas', controller.estatisticas);

// Buscar jogo por ID
router.get('/:id', controller.buscarPorId);

// Cadastrar jogo
router.post('/', controller.criar);

// Atualizar jogo
router.put('/:id', controller.atualizar);

// Excluir jogo
router.delete('/:id', controller.excluir);

export default router;
