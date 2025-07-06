
import Task from '../models/Task.js';
import User from '../models/User.js';
import ActionLog from '../models/Action.js';

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedUser', 'username _id');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTask = async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            assignedUser: req.body.assignedUser || null,
        });
        await task.save();
        await ActionLog.create({
            taskId: { _id: task._id, title: task.title },
            userId: { _id: req.user.id, username: req.user.username },
            action: 'create',
            details: `Task "${task.title}" created`,
        });
        req.io.emit('taskUpdate', { action: 'create', task });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.version !== req.body.version) {
            return res.status(409).json({
                message: 'Conflict detected',
                currentTask: task,
                clientTask: req.body,
            });
        }

        task.title = req.body.title;
        task.description = req.body.description;
        task.status = req.body.status;
        task.priority = req.body.priority;
        task.assignedUser = req.body.assignedUser || null;
        task.version += 1;

        await task.save();
        await ActionLog.create({
            taskId: { _id: task._id, title: task.title },
            userId: { _id: req.user.id, username: req.user.username },
            action: 'update',
            details: `Task "${task.title}" updated`,
        });

        const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username _id');
        req.io.emit('taskUpdate', { action: 'update', task: populatedTask });
        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.deleteOne();
        await ActionLog.create({
            taskId: { _id: task._id, title: task.title },
            userId: { _id: req.user.id, username: req.user.username },
            action: 'delete',
            details: `Task "${task.title}" deleted`,
        });
        req.io.emit('taskUpdate', { action: 'delete', taskId: task._id });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const resolveConflict = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { action, mergeData } = req.body;
        if (action === 'merge') {
            task.title = mergeData.title || task.title;
            task.description = mergeData.description || task.description;
            task.status = mergeData.status || task.status;
            task.priority = mergeData.priority || task.priority;
            task.assignedUser = mergeData.assignedUser || task.assignedUser;
        } else if (action === 'overwrite') {
            task.title = mergeData.title;
            task.description = mergeData.description;
            task.status = mergeData.status;
            task.priority = mergeData.priority;
            task.assignedUser = mergeData.assignedUser || null;
        }
        task.version += 1;

        await task.save();
        await ActionLog.create({
            taskId: { _id: task._id, title: task.title },
            userId: { _id: req.user.id, username: req.user.username },
            action: 'update',
            details: `Conflict resolved for task "${task.title}"`,
        });

        const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username _id');
        req.io.emit('taskUpdate', { action: 'update', task: populatedTask });
        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const smartAssign = async (req, res) => {
    try {
        // Fetch task
        const task = await Task.findById(req.params.id).populate('assignedUser', 'username _id');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Fetch all users
        const users = await User.find({}, 'username _id');
        if (users.length === 0) {
            return res.status(400).json({ message: 'No users available for assignment' });
        }

        // Find user with fewest active tasks
        let minTasks = Infinity;
        let selectedUser = null;
        for (const user of users) {
            const taskCount = await Task.countDocuments({
                assignedUser: user._id,
                status: { $in: ['Todo', 'In Progress'] },
            });
            if (taskCount < minTasks) {
                minTasks = taskCount;
                selectedUser = user;
            }
        }

        if (!selectedUser) {
            return res.status(400).json({ message: 'No suitable user found' });
        }

        // Update task
        task.assignedUser = selectedUser._id;
        task.version += 1;
        await task.save();

        // Log action
        await ActionLog.create({
            taskId: task._id,
            userId: req.user.id,
            action: 'assign',
            details: `Task "${task.title}" smart-assigned to ${selectedUser.username}`,
        });

        // Populate task for response
        const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username _id');
        req.io.emit('taskUpdate', { action: 'update', task: populatedTask });
        res.json(populatedTask);
    } catch (error) {
        console.error('Smart Assign Error:', error.message); // Log error for debugging
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};