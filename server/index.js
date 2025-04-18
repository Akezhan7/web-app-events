const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key'; // В реальном проекте используйте переменную окружения

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация базы данных
const db = new sqlite3.Database('./events.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
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

// AUTH ROUTES
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }
  
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (user) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [name, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ 
          message: 'Пользователь зарегистрирован', 
          token,
          user: { id: this.lastID, name, email, role: 'user' }
        });
    });
  });
});

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

// EVENT ROUTES
// Получить все мероприятия
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date', [], (err, events) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(events);
  });
});

// Получить одно мероприятие
app.get('/api/events/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, event) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }
    res.json(event);
  });
});

// Создать мероприятие (только админ)
app.post('/api/events', authenticateToken, isAdmin, (req, res) => {
  const { title, description, date, location, image_url } = req.body;
  
  if (!title || !date) {
    return res.status(400).json({ message: 'Название и дата обязательны' });
  }
  
  db.run('INSERT INTO events (title, description, date, location, image_url) VALUES (?, ?, ?, ?, ?)',
    [title, description, date, location, image_url], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({ id: this.lastID, title, description, date, location, image_url });
  });
});

// Обновить мероприятие (только админ)
app.put('/api/events/:id', authenticateToken, isAdmin, (req, res) => {
  const { title, description, date, location, image_url } = req.body;
  
  if (!title || !date) {
    return res.status(400).json({ message: 'Название и дата обязательны' });
  }
  
  db.run(`UPDATE events SET 
    title = ?, 
    description = ?, 
    date = ?, 
    location = ?, 
    image_url = ? 
    WHERE id = ?`,
    [title, description, date, location, image_url, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Мероприятие не найдено' });
      }
      res.json({ id: req.params.id, title, description, date, location, image_url });
  });
});

// Удалить мероприятие (только админ)
app.delete('/api/events/:id', authenticateToken, isAdmin, (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }
    res.json({ message: 'Мероприятие удалено' });
  });
});

// REGISTRATION ROUTES
// Зарегистрироваться на мероприятие
app.post('/api/registration', authenticateToken, (req, res) => {
  const { event_id } = req.body;
  const user_id = req.user.id;
  
  if (!event_id) {
    return res.status(400).json({ message: 'ID мероприятия обязательно' });
  }
  
  // Проверка существования мероприятия
  db.get('SELECT * FROM events WHERE id = ?', [event_id], (err, event) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }
    
    // Проверка, не зарегистрирован ли пользователь уже на это мероприятие
    db.get('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?', [user_id, event_id], (err, registration) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (registration) {
        return res.status(400).json({ message: 'Вы уже зарегистрированы на это мероприятие' });
      }
      
      db.run('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)', [user_id, event_id], function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.status(201).json({ id: this.lastID, user_id, event_id });
      });
    });
  });
});

// Отменить регистрацию
app.delete('/api/registration/:event_id', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const event_id = req.params.event_id;
  
  db.run('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [user_id, event_id], function(err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Регистрация не найдена' });
    }
    res.json({ message: 'Регистрация отменена' });
  });
});

// Получить все мероприятия пользователя
app.get('/api/user/events', authenticateToken, (req, res) => {
  db.all(`SELECT e.* FROM events e 
          JOIN registrations r ON e.id = r.event_id 
          WHERE r.user_id = ?
          ORDER BY e.date`, 
    [req.user.id], (err, events) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(events);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});