import { Router } from 'express';
import { GeneroController } from '../controllers/GeneroController.js';

const router = Router();
const controller = new GeneroController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export default router;
