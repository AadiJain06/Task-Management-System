import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    IconButton,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Event as EventIcon,
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { tasksAPI } from '../services/api'; // Ensure this matches your API service path
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';

const PRIORITY_COLORS = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    urgent: '#d50000'
};

const STATUS_COLORS = {
    pending: 'default',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error'
};

const TaskList = () => {
    const { user } = useAuth();

    // State
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
    });

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 9, // Grid 3x3
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

            const res = await tasksAPI.getTasks(params);
            setTasks(res.data.tasks);
            setTotalPages(res.data.pagination.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load tasks. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreate = () => {
        setCurrentTask(null);
        setOpenModal(true);
    };

    const handleEdit = (task) => {
        setCurrentTask(task);
        setOpenModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await tasksAPI.deleteTask(id);
                fetchTasks();
            } catch (err) {
                console.error('Delete failed', err);
                setError('Failed to delete task.');
            }
        }
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (currentTask) {
                await tasksAPI.updateTask(currentTask.id, taskData);
            } else {
                await tasksAPI.createTask(taskData);
            }
            setOpenModal(false);
            fetchTasks();
        } catch (err) {
            console.error('Save failed', err);
            alert(err.response?.data?.message || 'Failed to save task');
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        // Optimistic update
        const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);

        try {
            await tasksAPI.updateTaskStatus(task.id, newStatus);
        } catch (err) {
            console.error("Status update failed", err);
            fetchTasks(); // Revert
        }
    };

    return (
        <Box>
            {/* Header & Controls */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    My Tasks
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={filters.priority}
                            label="Priority"
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{ borderRadius: '20px', textTransform: 'none', px: 3 }}
                    >
                        New Task
                    </Button>
                </Box>
            </Box>

            {/* Error Message */}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Loading State */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Task Grid */}
                    {tasks.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.7 }}>
                            <Typography variant="h5">No tasks found</Typography>
                            <Typography variant="body1">Create a new task to get started!</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {tasks.map((task) => (
                                <Grid item xs={12} md={6} lg={4} key={task.id}>
                                    <Card sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderTop: `4px solid ${PRIORITY_COLORS[task.priority] || '#ccc'}`,
                                        position: 'relative'
                                    }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Chip
                                                    label={task.priority.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${PRIORITY_COLORS[task.priority]}22`,
                                                        color: PRIORITY_COLORS[task.priority],
                                                        fontWeight: 'bold',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                                <Chip
                                                    label={task.status.replace('_', ' ')}
                                                    size="small"
                                                    color={STATUS_COLORS[task.status]}
                                                    variant={task.status === 'completed' ? 'filled' : 'outlined'}
                                                />
                                            </Box>

                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                {task.title}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {task.description}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                <EventIcon fontSize="small" />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </Box>

                                            {(user.role === 'admin' && task.assignee) && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                    <PersonIcon fontSize="small" />
                                                    Assigned to: {task.assignee.username}
                                                </Box>
                                            )}
                                        </CardContent>

                                        <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                            {task.status !== 'completed' && (
                                                <Tooltip title="Mark Complete">
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleStatusChange(task, 'completed')}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            <Box>
                                                <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(task)}>
                                                    Edit
                                                </Button>
                                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(task.id)}>
                                                    Delete
                                                </Button>
                                            </Box>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size="large"
                        />
                    </Box>
                </>
            )}

            {/* Task Form Modal */}
            <TaskForm
                open={openModal}
                handleClose={() => setOpenModal(false)}
                handleSave={handleSaveTask}
                task={currentTask}
                isEdit={!!currentTask}
            />
        </Box>
    );
};

export default TaskList;
