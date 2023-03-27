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
const {setTimeout} = require("timers");

// const {  spawn } = require('node:child_process');

// chromium --disable-web-security --disable-features=IsolateOrigins,site-per-process
// '/Applications/Opera.app/Contents/MacOS/Opera'

spawn('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome', [
     '--disable-web-security',
    // "--user-agent=\"Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1\"",
     '--allow-running-insecure-content',
    // '--start-maximized',
    //  '--auto-open-devtools-for-tabs',
    '--nosession',
     '--no-sandbox',
     // '--window-size=1280,960',
    // '--disable-features=IsolateOrigins,site-per-process',
    '--user-data-dir="/home/idr/Projects/social-robot-chrome-1"'
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
let fbUser = {
    username: 'contact@wallprinter.bg',
    password: 'wallprinter2020'
}

let cookie = [
    {
        "domain": ".addmefast.com",
        "expirationDate": 1679719021.297727,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cf_bm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "waiqZMdgCBZHk1fA5x54S8MXfh7PQk43TTgcShnG4X4-1679717221-0-AUGBkyRyLPomV+DUr4l8QzqVagqy2yCi8GPZYcEmLSTIC2UeJPZFF4U9dAibT58G2Ybz8W2LKUJ5otFnK3HTthwRkH7mWcoCR1eVJ63iXwMhBJsZJcWy+c/5XzMN3EN+1O0/TlEMc6rUrbawy2t+hMmu7CS+zVJgQj/rPXZiqjWn",
        "id": 1
    },
    {
        "domain": ".addmefast.com",
        "expirationDate": 1714277236.281744,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "GA1.2.57266253.1679717221",
        "id": 2
    },
    {
        "domain": ".addmefast.com",
        "expirationDate": 1714277236.277766,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga_CV6K1X2PY4",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "GS1.1.1679717221.1.1.1679717236.0.0.0",
        "id": 3
    },
    {
        "domain": ".addmefast.com",
        "expirationDate": 1679717281,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_gat",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "1",
        "id": 4
    },
    {
        "domain": ".addmefast.com",
        "expirationDate": 1679803636,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_gid",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "GA1.2.891400274.1679717221",
        "id": 5
    },
    {
        "domain": ".addmefast.com",
        "expirationDate": 1711253220.607631,
        "hostOnly": false,
        "httpOnly": true,
        "name": "cf_clearance",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "qb6KJ_1fyllV7XBcoYa6ozVptTFCeR.7nMVjXPKZy2E-1679717218-0-150",
        "id": 6
    },
    {
        "domain": ".addmefast.com",
        "hostOnly": false,
        "httpOnly": false,
        "name": "PHPSESSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": true,
        "storeId": "1",
        "value": "ef3aqgs0q0g2c7rcpncmpt0bkf",
        "id": 7
    },
    {
        "domain": "addmefast.com",
        "expirationDate": 1680322020.607777,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__cflb",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "02DiuFDduG7MeSqVpoP7K2jxhQ1RFGVBH7hZC5vdBwH5m",
        "id": 8
    },
    {
        "domain": "addmefast.com",
        "expirationDate": 1711253220.607734,
        "hostOnly": true,
        "httpOnly": false,
        "name": "airdropnote",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "show",
        "id": 9
    },
    {
        "domain": "addmefast.com",
        "expirationDate": 1711253220.607714,
        "hostOnly": true,
        "httpOnly": false,
        "name": "amfrefnota",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "show",
        "id": 10
    },
    {
        "domain": "addmefast.com",
        "expirationDate": 1711253220.607726,
        "hostOnly": true,
        "httpOnly": false,
        "name": "profunamenota",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "show",
        "id": 11
    }
]

setTimeout(() => {
    console.log('emit click Class');
    io.emit('clickClass', {
        className: 'single_like_button'
    });

    socket.on('clickClassRes', (data) => {
        console.log('clickClassRes', data);

    });

}, 10000);