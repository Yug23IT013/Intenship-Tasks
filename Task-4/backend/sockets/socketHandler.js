const User = require('../models/User');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Set up user
    socket.on('setup', async (userData) => {
      if (!userData || !userData._id) return;
      socket.join(userData._id);
      socket.userId = userData._id;
      
      console.log(`👤 User registered in socket room: ${userData._id}`);

      // Set user to online in database
      try {
        await User.findByIdAndUpdate(userData._id, { status: 'online' });
        socket.broadcast.emit('userStatusChanged', {
          userId: userData._id,
          status: 'online'
        });
      } catch (err) {
        console.error('Socket setup status error:', err.message);
      }
      
      socket.emit('connected');
    });

    // Join a chat room
    socket.on('joinChat', (room) => {
      socket.join(room);
      console.log(`📦 User joined chat room: ${room}`);
    });

    // Typing status
    socket.on('typing', (room) => {
      socket.in(room).emit('typing', room);
    });

    socket.on('stopTyping', (room) => {
      socket.in(room).emit('stopTyping', room);
    });

    // Send a new message
    socket.on('newMessage', (newMessageReceived) => {
      const chat = newMessageReceived.chat;

      if (!chat || !chat.members) return console.log('chat.members not defined');

      // Broadcast to all members of the chat
      chat.members.forEach((member) => {
        // Exclude sender
        const memberId = typeof member === 'object' ? member._id : member;
        if (memberId === newMessageReceived.sender._id) return;

        socket.in(memberId).emit('messageReceived', newMessageReceived);
      });
    });

    // Manual status change
    socket.on('changeStatus', async ({ userId, status }) => {
      if (!userId || !status) return;
      try {
        await User.findByIdAndUpdate(userId, { status });
        io.emit('userStatusChanged', { userId, status });
        console.log(`Presence update: user ${userId} status set to ${status}`);
      } catch (err) {
        console.error('Change status socket error:', err.message);
      }
    });

    // Clean up on disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        try {
          const lastSeen = new Date();
          await User.findByIdAndUpdate(socket.userId, {
            status: 'offline',
            lastSeen
          });
          io.emit('userStatusChanged', {
            userId: socket.userId,
            status: 'offline',
            lastSeen
          });
          console.log(`👤 User offline: ${socket.userId}`);
        } catch (err) {
          console.error('Socket disconnect status error:', err.message);
        }
      }
    });
  });
};

module.exports = socketHandler;
