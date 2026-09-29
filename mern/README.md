# RecallOps MERN Stack

Full MERN (MongoDB + Express + React + Node.js) implementation of RecallOps with JWT authentication.

## Structure

```
mern/
├── server/          # Express + Node.js backend
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/User.js        # Mongoose User schema
│   │   ├── controllers/authController.js
│   │   ├── middleware/auth.js    # JWT protect + authorize
│   │   ├── routes/authRoutes.js
│   │   └── index.js             # Express entry point
│   └── .env
└── client/          # React + Vite frontend
    └── src/
        ├── api/index.js          # Axios client
        ├── context/AuthContext.jsx
        ├── components/PrivateRoute.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── DashboardPage.jsx
        └── App.jsx
```

## Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally at `mongodb://localhost:27017/`

### Start MongoDB (if not running)

```bash
# Windows: Start the MongoDB service
net start MongoDB

# Or run mongod directly
mongod --dbpath C:\data\db
```

## Running the app

### 1. Start the backend server

```bash
cd mern/server
npm run dev
# Runs on http://localhost:5000
```

### 2. Start the React client (new terminal)

```bash
cd mern/client
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Method | Endpoint              | Access    | Description        |
|--------|-----------------------|-----------|--------------------|
| POST   | `/api/auth/register`  | Public    | Create account     |
| POST   | `/api/auth/login`     | Public    | Sign in            |
| POST   | `/api/auth/logout`    | Public    | Clear session      |
| GET    | `/api/auth/me`        | Protected | Get current user   |
| GET    | `/health`             | Public    | Server health      |

## Environment Variables (server/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/recallops
JWT_SECRET=recallops_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
