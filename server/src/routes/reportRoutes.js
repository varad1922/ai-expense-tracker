import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// A simple React Component rendered on the Server
const ReportView = ({ expenses, total }) => {
  return React.createElement(
    'div',
    { style: { padding: '20px', fontFamily: 'sans-serif' } },
    React.createElement('h1', null, 'Nexus Expense Report'),
    React.createElement('h2', null, `Total Spent: $${total}`),
    React.createElement(
      'ul',
      null,
      expenses.map((exp) =>
        React.createElement('li', { key: exp.id }, `${exp.title} - $${exp.amount}`)
      )
    )
  );
};

// @desc    Server-Side Rendered Report
// @route   GET /api/report/:userId
// @access  Public (for demo purposes)
router.get('/:userId', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.params.userId },
      take: 50,
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    const reactHtml = renderToString(
      React.createElement(ReportView, { expenses, total })
    );

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expense Report</title>
      </head>
      <body>
        <div id="root">${reactHtml}</div>
      </body>
      </html>
    `;

    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Error generating report</h1>');
  }
});

export default router;
