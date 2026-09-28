import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/Auth.js';

const router = express.Router();

// Non-protected for public customer menu (uses ?adminId=xxx), protected for logged-in users
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getCategories);

router.post('/', protect, authorize('admin'), createCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;