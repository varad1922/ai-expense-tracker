import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { startCronJobs } from './services/cronService.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Connect to database and redis
connectDB();
connectRedis().catch(err => console.error('Redis init error:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Pass io to request object so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Security Middleware (Input sanitization & injection awareness)
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent Cross-Site Scripting (XSS)

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Optionally, rooms based on user ID can be added here
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start scheduled jobs
startCronJobs(io);

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/report', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
