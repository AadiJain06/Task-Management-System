import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const TaskForm = ({ open, handleClose, handleSave, task, isEdit }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignedTo: '',
        status: 'pending'
    });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                priority: task.priority,
                assignedTo: task.assignedTo,
                status: task.status
            });
        } else {
            // Reset form for new task
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                assignedTo: user ? user.id : '',
                status: 'pending'
            });
        }
    }, [task, user, open]);

    useEffect(() => {
        // Fetch users for assignment if admin
        if (user?.role === 'admin') {
            const fetchUsers = async () => {
                try {
                    const res = await usersAPI.getUsers();
                    setUsers(res.data);
                } catch (err) {
                    console.error('Failed to fetch users', err);
                }
            };
            fetchUsers();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave(formData);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {isEdit ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            name="title"
                            label="Task Title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                            variant="outlined"
                        />

                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            required
                            variant="outlined"
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                name="dueDate"
                                label="Due Date"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="urgent">Urgent</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {isEdit && (
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Status"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        {user?.role === 'admin' && (
                            <FormControl fullWidth>
                                <InputLabel>Assign To</InputLabel>
                                <Select
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    label="Assign To"
                                    onChange={handleChange}
                                    required
                                >
                                    {users.map((u) => (
                                        <MenuItem key={u.id} value={u.id}>
                                            {u.username} ({u.email})
                                        </MenuItem>
                                    ))}
                                    {/* Current user fallback if list empty */}
                                    {users.length === 0 && <MenuItem value={user.id}>{user.username} (Me)</MenuItem>}
                                </Select>
                            </FormControl>
                        )}

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        {isEdit ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TaskForm;
