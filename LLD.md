# Low-Level Design (LLD)
**Project Name:** Nexus Expense AI
**Version:** 1.0.0

## 1. Database Schemas

### 1.1 MongoDB - `User` Schema (Mongoose)
- `_id`: ObjectId (Primary Key)
- `name`: String, required
- `email`: String, required, unique
- `password`: String (Hashed), required
- `theme`: String, enum: ['light', 'dark'], default: 'dark'
- `monthlyBudget`: Number, default: 0
- `createdAt`: Date
- `updatedAt`: Date

### 1.2 SQLite - `Expense` Model (Prisma)
- `id`: Int, autoincrement (Primary Key)
- `userId`: String (References MongoDB `User._id`)
- `amount`: Float, required
- `category`: String, required
- `description`: String, optional
- `date`: DateTime, default: now()
- `createdAt`: DateTime
- `updatedAt`: DateTime

## 2. API Endpoints (REST)

### 2.1 Authentication (`/api/auth`)
- `POST /register`: Registers a new user, hashes password, returns JWT.
- `POST /login`: Authenticates user, returns JWT and user profile.
- `GET /me`: Returns current user details (requires JWT).
- `PUT /profile`: Updates user settings like theme and budget.

### 2.2 Expenses (`/api/expenses`)
- `GET /`: Retrieves all expenses for the authenticated user.
- `POST /`: Creates a new expense record.
- `PUT /:id`: Updates an existing expense.
- `DELETE /:id`: Deletes an expense.

### 2.3 AI Assistant (`/api/ai`)
- `POST /chat`: Accepts user prompt, retrieves recent expenses for context, queries Google Gemini API, and returns the AI's response.

## 3. Real-Time Events (Socket.io)

- **Connection:** Client establishes WebSocket connection, optionally joining a user-specific room.
- **Events Emitted (Server -> Client):**
  - `expense_added`: Broadcasts the newly created expense object.
  - `expense_updated`: Broadcasts the updated expense object.
  - `expense_deleted`: Broadcasts the ID of the deleted expense.
- **Events Received (Client -> Server):**
  - Standard HTTP requests are typically used for mutations, triggering the server to emit the above broadcast events.

## 4. Frontend Component Structure (React)

- `App.jsx`: Main entry point, sets up routing and global context/providers (Theme, Auth, Socket).
- `Navbar.jsx`: Application navigation, user profile summary, theme toggle.
- `Dashboard.jsx`: Main view aggregating charts, budget progress, and the AI chat interface.
- `ExpenseForm.jsx`: Component for adding and editing expense entries.
- `ExpenseList.jsx`: Displays a paginated or scrollable list of recent transactions.
- `AIChat.jsx`: Interface for interacting with the Gemini AI assistant.
- `Charts/`: Directory containing Recharts wrapper components (e.g., `CategoryPieChart`, `MonthlyBarChart`).
