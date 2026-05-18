require('dotenv').config();
const { io } = require('socket.io-client');

const roomId = process.argv[2];
const userId = process.argv[3];
const label = process.argv[4] || 'user';
const port = process.env.PORT || 3000;

if (!roomId || !userId) {
  console.log('Usage: node test-chat.js <roomId> <userId> [label]');
  process.exit(1);
}

const socket = io(`http://localhost:${port}`);

socket.on('connect', () => {
  console.log(`${label} connected`);
  socket.emit('join_room', { roomId, userId });
});

socket.on('joined_room', (data) => console.log('joined:', data));
socket.on('online_users', (users) => console.log('online:', users));
socket.on('receive_message', (msg) => console.log('received:', msg));
socket.on('error', (err) => console.error('error:', err));

setTimeout(() => {
  socket.emit('send_message', {
    roomId,
    userId,
    text: `Message from ${label}`,
  });
}, 1000);
