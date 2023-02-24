const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
            methods: ["GET", "POST"],
            transports: ['websocket', 'polling'],
            credentials: true
    },
    allowEIO3: true
});
const {  spawn } = require('node:child_process');

// const {  spawn } = require('node:child_process');

// chromium --disable-web-security --disable-features=IsolateOrigins,site-per-process 

spawn('opera', [
    '--disable-web-security',
    "--user-agent=\"Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1\"",
    '--allow-running-insecure-content',
    '--start-maximized',
    '--auto-open-devtools-for-tabs',
    '--nosession',
    '--no-sandbox',
    '--window-size=1280,960',
    '--disable-features=IsolateOrigins,site-per-process',
    '--user-data-dir="/home/idr/Projects/social-robot"'
]);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

setTimeout(() => {
    console.log('go to fb');
    io.emit('navigateUrl', 'https://www.facebook.com/groups/2341676709406322/members');
}, 4000);