const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // index.html burada olmalı

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/rooms', require('./routes/rooms'));

// Socket.IO bağlantısı
io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);
    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
    });
});

// Hata yönetimi
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
});

async function connectToDatabase() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.warn('MONGODB_URI is not set. Please configure it in .env');
        return;
    }
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('Connected to MongoDB');
}

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
    connectToDatabase()
        .then(() => {
            server.listen(PORT, () => console.log(`Server listening on :${PORT}`));
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1);
        });
}

module.exports = { app, io };
