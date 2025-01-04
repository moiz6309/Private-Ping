const socket = io(); // Initialize socket connection

let username = "";
let roomCode = "";

// Join Room Function
function joinRoom() {
    username = document.getElementById('username').value;
    roomCode = document.getElementById('roomCode').value;

    if (username && roomCode) {
        // Emit the join room event with roomCode and username
        socket.emit('joinRoom', { username, roomCode });

        // Switch to chat room page
        document.getElementById('room-entry').classList.remove('active');
        document.getElementById('chat-container').classList.add('active');
    } else {
        alert("Please enter a username and room code.");
    }
}

// Send Message Function
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    if (message) {
        socket.emit('chatMessage', { message, username, roomCode });
        messageInput.value = ""; // Clear the input field
    }
}

// Listen for incoming messages
socket.on('chatMessage', (data) => {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    messageContainer.classList.add(data.username === username ? 'my-message' : 'other-message');

    const usernameElem = document.createElement('span');
    usernameElem.classList.add('username');
    usernameElem.innerText = data.username;

    const messageElem = document.createElement('p');
    messageElem.innerText = data.message;

    messageContainer.appendChild(usernameElem);
    messageContainer.appendChild(messageElem);
    
    document.getElementById('messages').appendChild(messageContainer);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; // Auto-scroll to bottom
});

// Handle file upload
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const fileContainer = document.createElement('div');
            fileContainer.classList.add('file-container');
            const fileInfo = document.createElement('div');
            fileInfo.classList.add('file-info');
            fileInfo.innerHTML = `<strong>${file.name}</strong><br>Size: ${file.size} bytes`;

            const fileLink = document.createElement('a');
            fileLink.href = reader.result;
            fileLink.download = file.name;
            fileLink.innerText = "Download";

            fileContainer.appendChild(fileInfo);
            fileContainer.appendChild(fileLink);
            
            // Emit file to server (optional: could add file type handling)
            socket.emit('fileMessage', { username, file: reader.result, fileName: file.name, roomCode });
        };
        reader.readAsDataURL(file);
    }
});

// Listen for file messages
socket.on('fileMessage', (data) => {
    const fileMessage = document.createElement('div');
    fileMessage.classList.add('message');
    fileMessage.classList.add(data.username === username ? 'my-message' : 'other-message');

    const fileContainer = document.createElement('div');
    fileContainer.classList.add('file-container');

    const fileInfo = document.createElement('div');
    fileInfo.classList.add('file-info');
    fileInfo.innerHTML = `<strong>${data.fileName}</strong><br>`;

    const downloadLink = document.createElement('a');
    downloadLink.href = data.file;
    downloadLink.download = data.fileName;
    downloadLink.innerText = "Download";

    fileContainer.appendChild(fileInfo);
    fileContainer.appendChild(downloadLink);
    fileMessage.appendChild(fileContainer);

    document.getElementById('messages').appendChild(fileMessage);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; // Auto-scroll to bottom
});

