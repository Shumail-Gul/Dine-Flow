import express from 'express';
import { getItems, createItem, updateItem, toggleAvailability, deleteItem } from '../controllers/itemController.js';
import { protect, authorize } from '../middleware/Auth.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getItems);

router.post('/', protect, authorize('admin'), createItem);
router.put('/:id', protect, authorize('admin'), updateItem);
router.patch('/:id/toggle-availability', protect, authorize('admin', 'kitchen'), toggleAvailability);
router.delete('/:id', protect, authorize('admin'), deleteItem);

export default router;