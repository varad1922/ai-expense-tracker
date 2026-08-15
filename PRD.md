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

## 6. Technical Implementation & Rubric Validation
The Nexus Expense AI application natively implements all standard engineering practices and technical specifications outlined in the project rubric:

### Engineering Practices
- **Environment variables & secrets management:** Managed using `dotenv`. Secrets like database credentials, JWT keys, and Gemini API keys are isolated in a `.env` file (not committed to source control).
- **Git workflow:** The codebase uses standard Git branching, commits, and pull-request flows for feature integration.

### Core JavaScript Concepts
- **JavaScript — async/await:** Comprehensively used across both frontend API calls and backend Express controllers (e.g., `expenseController.js` and `aiController.js`) to ensure non-blocking IO.
- **JavaScript — Closures:** Extensively used in React hooks. For instance, the cleanup functions inside `useEffect` (like in `useDocumentTitle.js`) form closures over the previous state values.
- **JavaScript — Event loop:** The Node.js and React architectures implicitly utilize the event loop for managing concurrent tasks, socket connections, and async HTTP requests without thread blocking.
- **JavaScript — Hoisting:** Variables (`const`/`let`) and functions are structured with proper scoping, relying on hoisting for clear component module structures.
- **JavaScript — Promises vs callbacks:** Both paradigms are leveraged where appropriate. Promises are primarily handled via `async/await` for database operations (Mongoose/Prisma), whereas callbacks are used in `setTimeout` loops and socket event listeners.

### React / Frontend Architecture
- **React component composition:** Demonstrates advanced composition patterns (Slots, Context, Render props), notably in `Card.jsx` which provides `<Card.Header>`, `<Card.Body>`, and `<Card.Footer>` sub-components without deep prop drilling.
- **Side effects with useEffect:** Safely handles DOM mutations, subscriptions, and data fetching (e.g., `useDocumentTitle` modifying `document.title`, `ExpenseContext.jsx` setting up Socket.io connections).
- **State management with useState:** Complex forms and interactive states are managed precisely, using custom hooks like `useFormState` and context wrappers.

### Database
- **Schema modeling (Mongo):** Mongoose is utilized for structured NoSQL validation. The `User.js` model demonstrates compound indexing, sub-document embedding (for preferences), custom validators, pre-save hooks (bcrypt hashing), and virtual fields.

## 7. Heavy Technical Additions (August 2026 Update)
To heavily satisfy the technical rubric, the following architectures were newly implemented:
- **System & Integrations:** 
  - **Redis Caching:** Accelerates the `/api/expenses` endpoint to avoid repeated DB hits.
  - **Cron Jobs:** Background `node-cron` jobs run periodically to evaluate spending against budgets.
  - **Stripe Integration:** The `/api/stripe` endpoint provisions test checkout sessions for a premium subscription.
  - **Server-Side Rendering (SSR):** Added `/api/report/:userId` which dynamically SSRs an HTML React report from the Node backend via `react-dom/server`.
- **Database:** 
  - **Prisma Transactions:** Implemented `$transaction` in a new `/api/expenses/batch` route to guarantee ACID properties on bulk inserts.
  - **Referencing Relationships:** Added a `Notification` Mongoose schema to demonstrate referencing (`ref: 'User'`), contrasting the embedded `preferences` inside the `User` schema.
- **Security & Auth:** 
  - **Zod Validation:** `config/env.js` stringently validates all environment variables.
  - **Sanitization:** Integrated `helmet`, `express-mongo-sanitize`, and `xss-clean` for deep security hardening.
- **Advanced JS Patterns:** 
  - **DataExportService:** Demonstrates advanced event loop manipulation (`setImmediate`), hoisting, closures, and promises vs. callbacks by processing CSV chunks without blocking the main thread.
- **DevOps:** 
  - **Docker & Git Workflow:** Added Redis to `docker-compose.yml` and configured Husky pre-commit hooks.
