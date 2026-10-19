
import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController.js';

const router = Router();
const controller = new UsuarioController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export default router;
