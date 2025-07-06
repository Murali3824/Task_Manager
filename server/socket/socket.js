const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    // Middleware to attach io to req object
    return (req, res, next) => {
        req.io = io;
        next();
    };
};


export default initializeSocket;