import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const prisma = new PrismaClient();

// Task 6: Scheduled Jobs & WebSockets
// Runs every hour (or set to * * * * * for every minute during demo)
export const startCronJobs = (io) => {
  cron.schedule('* * * * *', async () => {
    console.log('⏳ Running scheduled budget check...');
    try {
      const users = await User.find({ isActive: true });
      
      for (const user of users) {
        // Find total expenses this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const expenses = await prisma.expense.findMany({
          where: {
            userId: user._id.toString(),
            date: { gte: startOfMonth },
          },
        });

        const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
        const budget = user.monthlyBudget || 50000;

        if (totalSpent > budget * 0.9) {
          // Check if we already notified today to prevent spam
          // Skipping that check here for simplicity in demonstrating the cron & websocket
          
          const msg = `⚠️ You have spent ${totalSpent} which is over 90% of your ${budget} budget!`;
          
          // Save Notification (Demonstrating Mongo referencing)
          const notification = await Notification.create({
            user: user._id,
            message: msg,
          });

          // Real-time communication via WebSocket
          if (io) {
            io.to(user._id.toString()).emit('notification', notification);
          }
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};
