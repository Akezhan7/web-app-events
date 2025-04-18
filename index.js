// This file is a wrapper that loads the server's index.js
try {
  // Check if server/index.js exists and load it
  require('./server/index.js');
} catch (error) {
  console.error('Failed to load server/index.js:', error.message);
  
  // If server/index.js doesn't exist, we assume the code is directly in this directory
  const express = require('express');
  const cors = require('cors');
  const sqlite3 = require('sqlite3').verbose();
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const path = require('path');

  const app = express();
  const PORT = process.env.PORT || 3001;
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  app.use(cors());
  app.use(express.json());

  // Log current directory and files for debugging
  console.log('Current directory:', __dirname);
  console.log('Files in directory:', require('fs').readdirSync(__dirname));

  // Initialize database
  const dbPath = './events.db';
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
    } else {
      console.log(`Connected to the SQLite database at ${dbPath}`);
      // Create tables function would be here 
      // (copied from server/index.js if available)
    }
  });

  // Simple API endpoint for testing
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
