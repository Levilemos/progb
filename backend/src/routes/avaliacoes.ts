
import { Router } from 'express';
import { AvaliacaoController } from '../controllers/AvaliacaoController.js';

const router = Router();
const controller = new AvaliacaoController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export default router;
