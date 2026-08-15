import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../config/redis.js';
import { exportExpensesData } from '../services/exportService.js';

const prisma = new PrismaClient();

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const cacheKey = `expenses:${req.user.id}`;

    // 1. Check cache
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      include: {
        categoryRel: true // This acts as a SQL JOIN under the hood
      }
    });

    // 2. Set cache
    if (redisClient) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(expenses)); // 1 hour cache
    }

    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Server Error');
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        categoryRel: true // This acts as a SQL JOIN under the hood
      }
    });
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }
    if (expense.userId !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error(error);
    res.status(404);
    throw new Error('Expense not found');
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !amount || !category || !date) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        date: new Date(date),
        userId: req.user.id,
      },
    });

    if (req.io) {
      req.io.to(req.user.id).emit('newExpense', expense);
    }

    const redisClient = getRedisClient();
    if (redisClient) await redisClient.del(`expenses:${req.user.id}`);

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error creating expense');
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.userId !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const { title, amount, category, date } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (amount) updateData.amount = Number(amount);
    if (category) updateData.category = category;
    if (date) updateData.date = new Date(date);

    const updatedExpense = await prisma.expense.update({
      where: { id: req.params.id },
      data: updateData,
    });

    if (req.io) {
      req.io.to(req.user.id).emit('updateExpense', updatedExpense);
    }

    const redisClient = getRedisClient();
    if (redisClient) await redisClient.del(`expenses:${req.user.id}`);

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(400);
    throw new Error('Error updating expense');
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.userId !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await prisma.expense.delete({
      where: { id: req.params.id },
    });

    if (req.io) {
      req.io.to(req.user.id).emit('deleteExpense', req.params.id);
    }

    const redisClient = getRedisClient();
    if (redisClient) await redisClient.del(`expenses:${req.user.id}`);

    res.status(200).json({ message: 'Expense removed' });
  } catch (error) {
    console.error(error);
    res.status(400);
    throw new Error('Error deleting expense');
  }
};

// @desc    Batch import expenses (Demonstrates SQL Transactions)
// @route   POST /api/expenses/batch
// @access  Private
export const batchImportExpenses = async (req, res) => {
  const { expenses } = req.body;
  if (!Array.isArray(expenses) || expenses.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of expenses');
  }

  try {
    // Demonstrates Prisma Transactions (ACID compliance)
    const result = await prisma.$transaction(
      expenses.map((exp) => 
        prisma.expense.create({
          data: {
            title: exp.title,
            amount: Number(exp.amount),
            category: exp.category,
            date: new Date(exp.date),
            userId: req.user.id,
          }
        })
      )
    );

    const redisClient = getRedisClient();
    if (redisClient) await redisClient.del(`expenses:${req.user.id}`);

    res.status(201).json({ message: `${result.length} expenses imported successfully`, count: result.length });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Transaction failed. No expenses were imported.');
  }
};

// @desc    Export expenses as CSV
// @route   GET /api/expenses/export
// @access  Private
export const exportExpenses = async (req, res) => {
  try {
    const csvData = await exportExpensesData(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.status(200).send(csvData);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error exporting data');
  }
};
