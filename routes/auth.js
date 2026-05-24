// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey-anapa-smeta';
const TOKEN_EXPIRY = '7d';

// Регистрация
router.post('/register', async (req, res) => {
  const { fullname, username, password, role } = req.body;

  // Проверка заполнения полей
  if (!fullname || !username || !password) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
  }
  const allowedRoles = ['estimator', 'viewer'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Недопустимая роль' });
  }

  try {
    // Проверка уникальности логина
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Пользователь с таким логином уже существует' });
    }

    // Хеширование пароля
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Добавление пользователя
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, fullname, role]
    );

    const userId = result.insertId;

    // Генерация JWT
    const token = jwt.sign(
      { id: userId, username, full_name: fullname, role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Установка httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      sameSite: 'lax'
    });

    return res.json({ success: true, redirect: '/dashboard' });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Введите логин и пароль' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, full_name, role FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.json({ success: true, redirect: '/dashboard' });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Выход
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Получить данные текущего пользователя (для проверки)
router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Не авторизован' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch {
    return res.status(401).json({ message: 'Неверный токен' });
  }
});

module.exports = router;