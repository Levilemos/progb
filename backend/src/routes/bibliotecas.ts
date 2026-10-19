
import { Router } from 'express';
import { BibliotecaController } from '../controllers/BibliotecaControllers.js';

const router = Router();
const controller = new BibliotecaController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export default router;
