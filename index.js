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
  const fs = require('fs');

  const app = express();
  const PORT = process.env.PORT || 3001;
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  app.use(cors());
  app.use(express.json());

  // Log current directory and files for debugging
  console.log('Current directory:', __dirname);
  console.log('Files in directory:', fs.readdirSync(__dirname));

  // Initialize database
  const dbPath = './events.db';
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
    } else {
      console.log(`Connected to the SQLite database at ${dbPath}`);
      createTables();
    }
  });

  // Создание таблиц в БД
  function createTables() {
    db.serialize(() => {
      // Таблица пользователей
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )`);

      // Таблица мероприятий
      db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        location TEXT,
        image_url TEXT
      )`);

      // Таблица регистраций на мероприятия
      db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_id INTEGER,
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (event_id) REFERENCES events (id)
      )`);

      // Создаем админа по умолчанию
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      
      db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, user) => {
        if (err) {
          console.error(err.message);
        }
        if (!user) {
          db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            ['Admin', 'admin@example.com', hashedPassword, 'admin']);
        }
      });
    });
  }

  // Middleware для проверки токена
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Требуется авторизация' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Недействительный токен' });
      req.user = user;
      next();
    });
  };

  // Middleware для проверки прав администратора
  const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Требуются права администратора' });
    }
    next();
  };

  // API endpoints
  // Получить все мероприятия
  app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events ORDER BY date', [], (err, events) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(events);
    });
  });

  // AUTH ROUTES
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }
      
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Неверный пароль' });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        message: 'Успешный вход',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Default HTML page
  const defaultHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Events Management API</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 10px;
      }
      .container {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .endpoint {
        background-color: #fff;
        padding: 15px;
        margin-bottom: 15px;
        border-left: 4px solid #3498db;
        border-radius: 4px;
      }
      code {
        background-color: #f1f1f1;
        padding: 2px 5px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
      .method {
        font-weight: bold;
        color: #2980b9;
      }
      .url {
        color: #27ae60;
      }
      .status {
        display: inline-block;
        padding: 10px 15px;
        background-color: #2ecc71;
        color: white;
        border-radius: 4px;
        margin-bottom: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Events Management API</h1>
      <p class="status">API Status: Running</p>
      
      <p>The frontend part of this application is not yet deployed. Here are the available API endpoints:</p>
      
      <h2>Authentication</h2>
      <div class="endpoint">
        <p><span class="method">POST</span> <span class="url">/api/login</span> - Login with email and password</p>
        <p><span class="method">POST</span> <span class="url">/api/register</span> - Register a new user</p>
      </div>
      
      <h2>Events</h2>
      <div class="endpoint">
        <p><span class="method">GET</span> <span class="url">/api/events</span> - Get all events</p>
        <p><span class="method">GET</span> <span class="url">/api/events/:id</span> - Get a specific event</p>
        <p><span class="method">POST</span> <span class="url">/api/events</span> - Create a new event (admin only)</p>
        <p><span class="method">PUT</span> <span class="url">/api/events/:id</span> - Update an event (admin only)</p>
        <p><span class="method">DELETE</span> <span class="url">/api/events/:id</span> - Delete an event (admin only)</p>
      </div>
      
      <h2>Registrations</h2>
      <div class="endpoint">
        <p><span class="method">POST</span> <span class="url">/api/registration</span> - Register for an event</p>
        <p><span class="method">DELETE</span> <span class="url">/api/registration/:event_id</span> - Cancel registration</p>
        <p><span class="method">GET</span> <span class="url">/api/user/events</span> - Get all events a user is registered for</p>
        <p><span class="method">GET</span> <span class="url">/api/registration/check/:event_id</span> - Check if user is registered for an event</p>
      </div>
      
      <h2>Admin</h2>
      <div class="endpoint">
        <p><span class="method">GET</span> <span class="url">/api/events/:id/participants</span> - Get all participants for an event (admin only)</p>
      </div>
      
      <p>Default admin account: <code>admin@example.com</code> / <code>admin123</code></p>
    </div>
  </body>
  </html>
  `;

  // Serve default HTML page
  app.get('/', (req, res) => {
    res.send(defaultHtml);
  });

  // Handle other API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next();
    } else {
      res.send(defaultHtml);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
