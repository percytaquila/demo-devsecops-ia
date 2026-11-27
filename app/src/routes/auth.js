'use strict';

const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { BCRYPT_ROUNDS } = require('../seed');

const router = express.Router();

// Hash ficticio: si el usuario no existe se compara igualmente,
// para que el tiempo de respuesta no revele qué usuarios existen.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), BCRYPT_ROUNDS);

const findUserByUsername = db.prepare(
  'SELECT id, username, password_hash FROM users WHERE username = ?'
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Inténtalo más tarde.' },
});

router.post('/login', loginLimiter, async (req, res, next) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length === 0 ||
    username.length > 50 ||
    password.length === 0 ||
    password.length > 100
  ) {
    return res.status(400).json({ error: 'Usuario y contraseña obligatorios' });
  }

  const sql = // VULNERABLE (DEMO)
    "SELECT id, username FROM users WHERE username = '" + username.trim() + // VULNERABLE (DEMO)
    "' AND password = '" + password + "'"; // VULNERABLE (DEMO)
  const user = db.prepare(sql).get(); // VULNERABLE (DEMO)

  if (!user) { // VULNERABLE (DEMO)
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  // Regenerar la sesión evita la fijación de sesión.
  return req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.userId = user.id;
    req.session.username = user.username;
    return res.json({ id: user.id, username: user.username });
  });
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('tienda.sid');
    return res.json({ ok: true });
  });
});

// Usuario de la sesión actual (lo usa el menú y la página de perfil).
router.get('/api/me', requireAuth, (req, res) => {
  res.json({ id: req.session.userId, username: req.session.username });
});

module.exports = router;
