import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({ token, user: { id: user._id, username } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token, user: { id: user._id, username } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'username _id');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, 'username _id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: { id: user._id, username: user.username } });
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

