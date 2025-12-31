import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Pagination,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayArrow as InProgressIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, usersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  urgent: '#9c27b0'
};

const statusColors = {
  pending: '#ff9800',
  in_progress: '#2196f3',
  completed: '#4caf50',
  cancelled: '#9e9e9e'
};

const statusIcons = {
  pending: <PendingIcon />,
  in_progress: <InProgressIcon />,
  completed: <CheckCircleIcon />,
  cancelled: <CancelledIcon />
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: ''
  });

  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    if (isAdmin) {
      loadUsers();
    }
  }, [page, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12, ...filters };
      const response = await tasksAPI.getTasks(params);
      setTasks(response.data.tasks);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...formData,
        assignedTo: formData.assignedTo || user.id
      };
      await tasksAPI.createTask(taskData);
      setOpenCreateDialog(false);
      resetForm();
      loadTasks();
    } catch (error) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    try {
      await tasksAPI.updateTask(selectedTask._id, formData);
      setOpenEditDialog(false);
      setSelectedTask(null);
      resetForm();
      loadTasks();
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        loadTasks();
      } catch (error) {
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await tasksAPI.updateTaskStatus(taskId, status);
      loadTasks();
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const handlePriorityChange = async (taskId, priority) => {
    try {
      await tasksAPI.updateTaskPriority(taskId, priority);
      loadTasks();
    } catch (error) {
      setError('Failed to update task priority');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: ''
    });
  };

  const openEditDialogForTask = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      assignedTo: task.assignedTo._id
    });
    setOpenEditDialog(true);
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.priority]) {
      acc[task.priority] = [];
    }
    acc[task.priority].push(task);
    return acc;
  }, {});

  if (loading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Task Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            New Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Priority Lists */}
        <Grid container spacing={3}>
          {['urgent', 'high', 'medium', 'low'].map(priority => (
            <Grid item xs={12} md={6} lg={3} key={priority}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: `${priorityColors[priority]}15`,
                  border: `2px solid ${priorityColors[priority]}`,
                  minHeight: '400px'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: priorityColors[priority],
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  {priority} Priority ({groupedTasks[priority]?.length || 0})
                </Typography>

                <Box sx={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {groupedTasks[priority]?.map(task => (
                    <Card key={task.id} sx={{ mb: 1 }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.description.length > 50
                            ? `${task.description.substring(0, 50)}...`
                            : task.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            icon={statusIcons[task.status]}
                            label={task.status.replace('_', ' ')}
                            size="small"
                            sx={{ backgroundColor: statusColors[task.status], color: 'white' }}
                          />
                          <Typography variant="caption">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ pt: 0 }}>
                        <Tooltip title="Change Status">
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              size="small"
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="in_progress">In Progress</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                              <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                          </FormControl>
                        </Tooltip>
                        <Tooltip title="Change Priority">
                          <FormControl size="small" sx={{ minWidth: 100, ml: 1 }}>
                            <Select
                              value={task.priority}
                              onChange={(e) => handlePriorityChange(task._id, e.target.value)}
                              size="small"
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                              <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                          </FormControl>
                        </Tooltip>
                        <Box sx={{ flexGrow: 1 }} />
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditDialogForTask(task)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteTask(task._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  )) || (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                      No tasks in this priority
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {/* Create Task Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            {isAdmin && (
              <FormControl fullWidth margin="dense">
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <MenuItem value="">Assign to me</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            {isAdmin && (
              <FormControl fullWidth margin="dense">
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  {users.map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateTask} variant="contained">Update</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Dashboard;
