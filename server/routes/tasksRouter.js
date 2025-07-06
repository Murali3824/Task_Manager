import express from 'express';
import { createTask, getTasks, updateTask, resolveConflict, deleteTask, smartAssign} from '../controllers/taskController.js';
import { getActionLogs } from '../controllers/actionController.js';
import authMiddleware from '../middleware/auth.js';
const tasksRouter = express.Router();

tasksRouter.use(authMiddleware);

tasksRouter.post('/', (req, res) => createTask(req, res, req.io));
tasksRouter.get('/', getTasks);
tasksRouter.put('/:id', (req, res) => updateTask(req, res, req.io));
tasksRouter.post('/:id/resolve', (req, res) => resolveConflict(req, res, req.io));
tasksRouter.delete('/:id', (req, res) => deleteTask(req, res, req.io));
tasksRouter.post('/:id/smart-assign', (req, res) => smartAssign(req, res, req.io));
tasksRouter.get('/logs', getActionLogs); 


export default tasksRouter;