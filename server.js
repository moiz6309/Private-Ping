const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // For resolving file paths

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store users in each room
const rooms = {};

// Serve 'chat.html' when accessing the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Serve static files from the 'public' directory for other routes
app.use(express.static('public'));

io.on('connection', (socket) => {
    let currentRoom = '';
    let username = '';

    // Handle user joining a room
    socket.on('join-room', ({ roomCode, username: user }) => {
        username = user;
        currentRoom = roomCode;

        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }

        // Add user to room
        rooms[roomCode].push(username);

        // Join the room
        socket.join(roomCode);

        // Notify all clients in the room that a user has joined
        io.to(roomCode).emit('chat-message', {
            username: 'Server',
            message: `${username} has joined the room.`,
            sender: 'Server'
        });

        // Send updated user list to all clients
        io.to(roomCode).emit('update-users', rooms[roomCode]);

        console.log(`${username} joined room ${roomCode}`);
    });

    // Handle user sending a message
    socket.on('chat-message', (roomCode, data) => {
        io.to(roomCode).emit('chat-message', data);
    });

    // Handle file sharing
    socket.on('file-message', (roomCode, data) => {
        io.to(roomCode).emit('chat-message', data);
    });

    // Handle user leaving the room
    socket.on('disconnect', () => {
        if (currentRoom && username) {
            // Remove the user from the room
            const roomUsers = rooms[currentRoom];
            const index = roomUsers.indexOf(username);
            if (index !== -1) {
                roomUsers.splice(index, 1);
            }

            // Notify all clients in the room that a user has left
            io.to(currentRoom).emit('chat-message', {
                username: 'Server',
                message: `${username} has left the room.`,
                sender: 'Server'
            });

            // Send updated user list to all clients
            io.to(currentRoom).emit('update-users', roomUsers);
        }

        console.log(`${username} left room ${currentRoom}`);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
