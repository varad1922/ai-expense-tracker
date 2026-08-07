# Product Requirements Document (PRD)
**Project Name:** Nexus Expense AI  
**Version:** 1.0.0  
**Date:** August 2026

## 1. Project Overview
Nexus Expense AI is a next-generation, full-stack personal finance application. It goes beyond simple expense tracking by integrating real-time data synchronization across devices and an AI-powered financial assistant capable of providing actionable insights based on the user's spending habits. 

## 2. Target Audience
- Individuals looking for a modern, aesthetically pleasing way to track daily expenses.
- Users who desire intelligent, data-driven financial advice without consulting a human advisor.
- Users who need seamless, real-time synchronization across multiple devices.

## 3. Core Features
### 3.1 Hybrid Database Architecture
- **MongoDB (NoSQL):** Handles user profiles, authentication (JWT), and personalized settings (e.g., Theme preferences, Custom Monthly Budgets).
- **SQLite via Prisma ORM (SQL):** Manages relational transaction data (expenses) ensuring ACID compliance and fast local queries.

### 3.2 Real-Time Synchronization (Socket.io)
- **Live Updates:** Expenses added, edited, or deleted on one device instantly reflect across all other connected clients.
- **Budget Tracking:** The sidebar budget progress bar dynamically recalculates and animates in real-time as transactions occur.

### 3.3 AI Assistant (Google Gemini)
- **Context-Aware Chat:** Users can interact with an LLM via the `/api/ai/chat` endpoint.
- **Data Injection:** The assistant is fed the user's recent expense data (last 20 transactions) in the system prompt, allowing it to provide highly personalized advice.

### 3.4 Premium UI/UX
- **Animations:** Powered by Framer Motion, featuring smooth page transitions, staggered list rendering, and micro-interactions (hover/click feedback).
- **Glassmorphism:** A modern, frosted-glass design aesthetic tailored for both Light and Dark modes.
- **Dynamic Analytics:** Real-time Bar and Pie charts (via Recharts) displaying categorical spending, with graceful empty states.

## 4. Technical Stack
- **Frontend:** React, React Router, Framer Motion, Recharts, Vite.
- **Backend:** Node.js, Express.js, Socket.io, Google Gen AI SDK.
- **Databases:** MongoDB (Mongoose), SQLite (Prisma 6).

## 5. Future Roadmap
- Implementation of recurring expenses and automated categorization.
- Exporting financial reports to PDF/CSV.
- Integrating plaid/bank APIs for automated transaction syncing.
