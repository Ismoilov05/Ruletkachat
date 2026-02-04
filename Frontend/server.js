const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname,  'public')));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('Foydalanuvchi kirdi:', socket.id);

    if (waitingUser) {
        socket.emit('chatStart', { partnerId: waitingUser.id });
        waitingUser.emit('chatStart', { partnerId: socket.id });

        
        socket.on('privateMessage', (msg) => {
            waitingUser.emit('message', msg);
        });
        waitingUser.on('privateMessage', (msg) => {
            socket.emit('message', msg);
        });

        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit('waiting', 'shlyuxa/yobircha qidirilmoqda...');
    }

    socket.on('disconnect', () => {
        if (waitingUser === socket) waitingUser = null;
        console.log('gandon  chisat  qildi');
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server 3000-portda  ishga tushdi');
});
