import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
