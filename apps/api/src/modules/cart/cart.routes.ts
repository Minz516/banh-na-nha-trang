import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.patch('/items/:itemId', CartController.updateItem);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
