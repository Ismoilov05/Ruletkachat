const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Path modulini qo'shdik

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- MANA SHU YERGA QO'SHASIZ ---
// Bu qator "public" papkasidagi index.html va boshqa fayllarni brauzerga ko'rsatadi
app.use(express.static(path.join(__dirname, 'public')));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('Foydalanuvchi kirdi:', socket.id);

    if (waitingUser) {
        socket.emit('chatStart', { partnerId: waitingUser.id });
        waitingUser.emit('chatStart', { partnerId: socket.id });

        // Xabarlarni bir-biriga yo'naltirish
        socket.on('privateMessage', (msg) => {
            waitingUser.emit('message', msg);
        });
        waitingUser.on('privateMessage', (msg) => {
            socket.emit('message', msg);
        });

        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit('waiting', 'Sherik qidirilmoqda...');
    }

    socket.on('disconnect', () => {
        if (waitingUser === socket) waitingUser = null;
        console.log('Foydalanuvchi chiqib ketdi');
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server 3000-portda muvaffaqiyatli ishga tushdi');
});