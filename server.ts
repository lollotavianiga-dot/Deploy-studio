import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import sqlite from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Setup database
const db = new sqlite('app.db', { verbose: console.log });
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    username TEXT,
    lastLogin TEXT
  );
`);

try {
  db.exec('ALTER TABLE users ADD COLUMN phoneNumber TEXT;');
} catch(e) {}
try {
  db.exec('ALTER TABLE users ADD COLUMN firstName TEXT;');
} catch(e) {}
try {
  db.exec('ALTER TABLE users ADD COLUMN lastName TEXT;');
} catch(e) {}

const startServer = async () => {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, username, phoneNumber, firstName, lastName } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (email, password, username, phoneNumber, firstName, lastName, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const lastLogin = new Date().toISOString();
      
      const info = stmt.run(email, hash, username || email.split('@')[0], phoneNumber || '', firstName || '', lastName || '', lastLogin);
      
      const userStmt = db.prepare('SELECT id, email, username, phoneNumber, firstName, lastName, lastLogin FROM users WHERE id = ?');
      const user = userStmt.get(info.lastInsertRowid);
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user, token });
    } catch (error) {
      if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const updateStmt = db.prepare('UPDATE users SET lastLogin = ? WHERE id = ?');
      const lastLogin = new Date().toISOString();
      updateStmt.run(lastLogin, user.id);
      user.lastLogin = lastLogin;

      delete user.password; // Do not send password back
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/anonymous', async (req, res) => {
    try {
      const { email, password, username } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (email, password, username, lastLogin) VALUES (?, ?, ?, ?)');
      const lastLogin = new Date().toISOString();
      
      const info = stmt.run(email, hash, username, lastLogin);
      
      const userStmt = db.prepare('SELECT id, email, username, phoneNumber, firstName, lastName, lastLogin FROM users WHERE id = ?');
      const user = userStmt.get(info.lastInsertRowid);
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Anonymous login failed' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const stmt = db.prepare('SELECT id, email, username, phoneNumber, firstName, lastName, lastLogin FROM users WHERE id = ?');
      const user = stmt.get(decoded.id);
      
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
