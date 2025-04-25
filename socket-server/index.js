const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());

let waitingQueue = [];
let matchedUsers = new Map();
let typingTimeouts = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('findStranger', () => {
    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift();

      matchedUsers.set(socket.id, partner);
      matchedUsers.set(partner, socket.id);

      io.to(socket.id).emit('matched', partner);
      io.to(partner).emit('matched', socket.id);
    } else {
      waitingQueue.push(socket.id);
    }
  });

  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  socket.on('chatMessage', ({ to, message }) => {
    io.to(to).emit('chatMessage', { from: socket.id, message });
  });

  socket.on('skip', () => {
    const partner = matchedUsers.get(socket.id);
    if (partner) {
      matchedUsers.delete(socket.id);
      matchedUsers.delete(partner);

      io.to(socket.id).emit('skipped');
      io.to(partner).emit('skipped');

      // Ensure both are removed from queue
      waitingQueue = waitingQueue.filter(id => id !== socket.id && id !== partner);

      // Allow both to choose manually when to find a new stranger
      io.to(socket.id).emit('showFindStrangerButton');
      io.to(partner).emit('showFindStrangerButton');
    }
  });

  socket.on('typing', ({ to }) => {
    clearTimeout(typingTimeouts.get(to));
    io.to(to).emit('typing');

    const timeout = setTimeout(() => {
      io.to(to).emit('stopTyping');
    }, 2000);

    typingTimeouts.set(to, timeout);
  });

  socket.on('stopTyping', ({ to }) => {
    clearTimeout(typingTimeouts.get(to));
    io.to(to).emit('stopTyping');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    waitingQueue = waitingQueue.filter(id => id !== socket.id);

    const partner = matchedUsers.get(socket.id);
    if (partner) {
      matchedUsers.delete(socket.id);
      matchedUsers.delete(partner);
      io.to(partner).emit('strangerDisconnected');
    }
  });
});

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});