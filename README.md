# Task Management System

A comprehensive task management system built with React frontend and Node.js/Express backend with MongoDB database.

## Features

- ✅ User Authentication & Authorization
- ✅ Task Creation, Editing, Deletion
- ✅ Task Status Management (Pending, In Progress, Completed, Cancelled)
- ✅ Priority Management (Low, Medium, High, Urgent) with Color Coding
- ✅ Task Assignment to Users
- ✅ Role-based Access Control (Admin/User)
- ✅ Pagination and AJAX Updates
- ✅ Responsive Design
- ✅ Confirmation Dialogs for Deletion

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite with Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19
- Material-UI (MUI)
- React Router DOM
- Axios for API calls

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite (automatically included via sqlite3 package)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-system
```

2. Install all dependencies:
```bash
npm run install-all
```

Or install manually:
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# Root dependencies (concurrently)
cd .. && npm install
```

3. Set up environment variables (optional):

Create a `.env` file in the backend directory:
```env
DATABASE_URL=./database.sqlite
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

4. Create environment file (optional - SQLite database will be created automatically)

5. Start the development servers:
```bash
# From the root directory
npm run dev
```

This will start both the backend (http://localhost:5000) and frontend (http://localhost:3000) servers concurrently.

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Create tasks with different priorities
4. Manage task status and assignments
5. Admins can manage users and assign tasks to others

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks (with pagination and filters)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id/priority` - Update task priority

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/tasks` - Get user's tasks

## Project Structure

```
task-management-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## Features Overview

### User Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/User)

### Task Management
- Create, read, update, delete tasks
- Priority levels: Low, Medium, High, Urgent
- Status tracking: Pending, In Progress, Completed, Cancelled
- Task assignment to users
- Due date management

### Priority Visualization
- Color-coded priority lists:
  - 🔴 Urgent (Purple)
  - 🔴 High (Red)
  - 🟡 Medium (Orange)
  - 🟢 Low (Green)

### Admin Features
- User management (create, update, delete users)
- Task assignment to any user
- View all tasks across the system

## Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Build frontend
npm run build

# The built files will be in frontend/build/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
