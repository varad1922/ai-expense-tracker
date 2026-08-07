# High-Level Design (HLD)
**Project Name:** Nexus Expense AI
**Version:** 1.0.0

## 1. System Architecture
Nexus Expense AI follows a modern Client-Server architecture enriched with real-time bidirectional communication.

### 1.1 Components Overview
- **Client Application (Frontend):** A React-based Single Page Application (SPA) built with Vite. It handles user interactions, data visualization (Recharts), and complex animations (Framer Motion).
- **Application Server (Backend):** A Node.js server running Express. It serves as the central hub, processing RESTful API requests, managing real-time WebSocket connections, and interacting with external services (Google Gemini AI).
- **Primary Database (NoSQL):** MongoDB is used for flexible, document-based storage of user profiles, authentication credentials, and user-specific application settings.
- **Transactional Database (SQL):** SQLite, managed via Prisma ORM, provides strict, relational storage for transactional data (expenses), ensuring data integrity.
- **AI Service:** Google Gemini LLM API integration for providing personalized financial insights.

## 2. Data Flow
1. **User Interaction:** The user interacts with the React frontend (e.g., adds an expense).
2. **API Request:** The frontend sends an HTTP request to the Express backend (or emits a WebSocket event).
3. **Data Persistence:** The backend processes the request and persists the data in the appropriate database (MongoDB for users, SQLite for expenses).
4. **Real-time Broadcast:** Upon successful data mutation, the backend emits an event via Socket.io to all connected clients (except the sender) to synchronize state.
5. **UI Update:** Connected clients receive the event and seamlessly update their UI using React state.

## 3. Deployment Strategy (Containerization)
The application is designed to be containerized using Docker and orchestrated with Docker Compose, encapsulating the frontend, backend, and necessary database services (if applicable) into isolated, reproducible environments.

## 4. Security
- **Authentication:** JSON Web Tokens (JWT) for secure, stateless user sessions.
- **Data Protection:** Passwords securely hashed before storage (e.g., using bcrypt).
- **CORS:** Configured to restrict unauthorized cross-origin requests.
