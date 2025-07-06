import express from 'express';
import { register, login, getUsers, getCurrentUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/users', authMiddleware, getUsers);
authRouter.get('/me', authMiddleware, getCurrentUser); // New endpoint

export default  authRouter;