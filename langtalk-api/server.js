const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/rooms', require('./routes/rooms'));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    // In dev, warn instead of crashing to allow front-end to boot
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
      app.listen(PORT, () => console.log(`API listening on :${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

module.exports = app;
