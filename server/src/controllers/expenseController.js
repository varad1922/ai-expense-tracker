import Expense from '../models/Expense.js';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Public
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error');
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Public
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
      res.status(200).json(expense);
    } else {
      res.status(404);
      throw new Error('Expense not found');
    }
  } catch (error) {
    res.status(404);
    throw new Error('Expense not found');
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Public
export const createExpense = async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !amount || !category || !date) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  try {
    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category,
      date
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500);
    throw new Error('Error creating expense');
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Public
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(200).json(updatedExpense);
    } else {
      res.status(404);
      throw new Error('Expense not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error('Error updating expense');
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Public
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      await expense.deleteOne();
      res.status(200).json({ message: 'Expense removed' });
    } else {
      res.status(404);
      throw new Error('Expense not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error('Error deleting expense');
  }
};
