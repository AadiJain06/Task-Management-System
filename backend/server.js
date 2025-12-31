const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = require('./database');

// Import models to ensure they are registered
const User = require('./models/User');
const Task = require('./models/Task');

// Define relationships
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Sync database - use force: true to reset schema (drops existing data)
// Change to { force: false } or remove options after first successful run
sequelize.sync({ force: true })
  .then(() => console.log('Database synced successfully'))
  .catch(err => console.log('Database sync error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
