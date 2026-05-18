const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

const roomUsers = new Map();

const getOnlineUsers = (roomId) => {
  const users = roomUsers.get(roomId);
  return users ? Array.from(users.values()) : [];
};

const addUserToRoom = (roomId, socketId, user) => {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Map());
  }
  roomUsers.get(roomId).set(socketId, user);
};

const removeUserFromRoom = (roomId, socketId) => {
  const users = roomUsers.get(roomId);
  if (!users) return null;

  const user = users.get(socketId);
  users.delete(socketId);
  if (users.size === 0) {
    roomUsers.delete(roomId);
  }
  return user;
};

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    socket.on('join_room', async (data) => {
      try {
        const { roomId, userId } = data;

        if (!roomId || !userId) {
          socket.emit('error', { message: 'roomId and userId are required' });
          return;
        }

        const [room, user] = await Promise.all([
          Room.findById(roomId),
          User.findById(userId),
        ]);

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        if (currentRoom) {
          socket.leave(currentRoom);
          removeUserFromRoom(currentRoom, socket.id);
        }

        currentRoom = roomId.toString();
        currentUser = { id: user._id.toString(), name: user.name };

        socket.join(currentRoom);
        addUserToRoom(currentRoom, socket.id, currentUser);

        const onlineUsers = getOnlineUsers(currentRoom);
        io.to(currentRoom).emit('online_users', onlineUsers);
        socket.emit('joined_room', { roomId: currentRoom, onlineUsers });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const { roomId, userId, text } = data;

        if (!roomId || !userId || !text?.trim()) {
          socket.emit('error', { message: 'roomId, userId and text are required' });
          return;
        }

        const user = await User.findById(userId);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const message = await Message.create({
          roomId,
          userId,
          userName: user.name,
          text: text.trim(),
        });

        const payload = {
          id: message._id,
          roomId: message.roomId,
          userId: message.userId,
          userName: message.userName,
          text: message.text,
          createdAt: message.createdAt,
        };

        io.to(roomId.toString()).emit('receive_message', payload);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        removeUserFromRoom(currentRoom, socket.id);
        const onlineUsers = getOnlineUsers(currentRoom);
        io.to(currentRoom).emit('online_users', onlineUsers);
        console.log(`User ${currentUser?.name || socket.id} disconnected from room ${currentRoom}`);
      } else {
        console.log(`Socket ${socket.id} disconnected`);
      }
    });
  });
};

module.exports = setupChatSocket;
