import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value) => !['Todo', 'In Progress', 'Done'].includes(value),
            message: 'Task title cannot be Todo, In Progress, or Done',
        },
    },
    description: { type: String, default: '' },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
        type: String,
        enum: ['Todo', 'In Progress', 'Done'],
        default: 'Todo',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    version: { type: Number, default: 0 }, // For conflict detection
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    this.version += 1;
    next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;