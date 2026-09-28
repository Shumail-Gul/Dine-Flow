import express from "express"
import { getOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/Auth.js';

const router = express.Router();

// Admins & Kitchen staff can see orders
router.get('/', protect, authorize('admin', 'kitchen', 'staff'), getOrders);

// Customers place orders publicly
router.post('/', createOrder);

// Kitchen staff & Admins can update status (e.g. pending -> preparing -> ready)
router.patch('/:id/status', protect, authorize('admin', 'kitchen'), updateOrderStatus);

export default router