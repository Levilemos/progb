import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();
const controller = new AuthController();

// Rota pública
router.post('/login', controller.login);

// Rota protegida
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    usuario: res.locals.usuario
  });
});

export default router;
