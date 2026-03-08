require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const { initializeDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const clientRoutes = require('./routes/clientRoutes');
const followupRoutes = require('./routes/followupRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN
      ? [process.env.FRONTEND_ORIGIN, 'http://localhost:5000', 'http://127.0.0.1:5000']
      : true,
    credentials: true
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(express.static(path.resolve(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'index.html'));
});

app.use(errorHandler);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`CRM backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
