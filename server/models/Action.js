import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        enum: ['create', 'update', 'delete', 'assign', 'move'],
        required: true,
    },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const ActionLog = mongoose.model('ActionLog', actionLogSchema);

export default ActionLog;