import express from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  batchImportExpenses,
  exportExpenses
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/export', protect, exportExpenses);
router.post('/batch', protect, batchImportExpenses);

router.route('/')
  .get(protect, getExpenses)
  .post(protect, createExpense);

router.post('/batch', protect, batchImportExpenses);

router.route('/:id')
  .get(protect, getExpenseById)
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

export default router;
