import Action from "../models/Action.js";


export const getActionLogs = async (req, res) => {
    try {
        const logs = await Action.find()
            .populate('userId', 'username')
            .populate('taskId', 'title')
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
