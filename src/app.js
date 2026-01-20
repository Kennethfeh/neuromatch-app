// simple express API - like NeuroMatch backend 
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Health check endpoint - CRITICAL for kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'neuromatch-api',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Status endpoint for liveness probe 
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'neuromatch-api',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Sample API endpoint
app.get('/api/data', (req, res) => {
  res.json({
    message: 'API is working',
    data: [
      { id: 1, name: 'Sample EEG Data 1' },
      { id: 2, name: 'Sample EEG Data 2' }
    ]
  });
});

//Error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
    });

// start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Graceful shutdown - IMPORTANT for kubernetes 
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
