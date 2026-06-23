const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./sockets/socketHandler');

// Load environment variables
dotenv.config();

// Connect database
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// HTTP API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/messages', require('./routes/messages'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chat service is running' });
});

// Fallback 404
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Wrap express app with HTTP server for WebSockets
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    credentials: true
  }
});

// Setup sockets
socketHandler(io);

server.listen(PORT, () => {
  console.log(`\n🚀 Chat backend running on http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
});
