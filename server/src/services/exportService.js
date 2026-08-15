import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Task 7: Advanced JS Patterns (Event Loop, Closures, Promises, Callbacks, Async/Await)
 */
export const exportExpensesData = async (userId) => {
  // 1. Async/Await and Promises
  return new Promise(async (resolve, reject) => {
    try {
      const expenses = await prisma.expense.findMany({
        where: { userId },
      });

      // 2. Closures: `processedCount` and `csvLines` are enclosed in the scope
      // accessed by the `processChunk` callback.
      let processedCount = 0;
      const csvLines = ['Title,Amount,Category,Date'];

      // 3. Callback function to process data in chunks to avoid blocking the event loop
      const processChunk = (chunk) => {
        chunk.forEach(exp => {
          csvLines.push(`${exp.title},${exp.amount},${exp.category},${exp.date.toISOString()}`);
          processedCount++;
        });
      };

      // 4. Event loop manipulation (setImmediate)
      // Simulating a heavy CPU-bound task by splitting it into chunks
      const chunkSize = 100;
      let currentIndex = 0;

      const processNext = () => {
        if (currentIndex < expenses.length) {
          const chunk = expenses.slice(currentIndex, currentIndex + chunkSize);
          processChunk(chunk);
          currentIndex += chunkSize;
          
          // Yield to event loop
          setImmediate(processNext);
        } else {
          // Done
          resolve(csvLines.join('\n'));
        }
      };

      processNext();

    } catch (error) {
      reject(error);
    }
  });
};

// 5. Hoisting demonstration:
// `calculateTotal` is hoisted because it's declared with `function`.
// So we can use it before its physical placement in the code.
export const getExportSummary = async (userId) => {
  const expenses = await prisma.expense.findMany({ where: { userId } });
  const total = calculateTotal(expenses); 
  return { count: expenses.length, total };
}

function calculateTotal(items) {
  return items.reduce((acc, curr) => acc + curr.amount, 0);
}
