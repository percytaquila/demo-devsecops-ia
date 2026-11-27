'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// VULNERABLE (DEMO)
// Patrón clásico inseguro: usuario y contraseña se comprueban juntos en una sola
// consulta construida concatenando la entrada, contra la contraseña en texto plano.
const findUserByCredentials = (username, password) => db.prepare( // VULNERABLE (DEMO)
  "SELECT id, username FROM users WHERE username = '" + username + // VULNERABLE (DEMO)
  "' AND password = '" + password + "'" // VULNERABLE (DEMO)
).get(); // VULNERABLE (DEMO)

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Inténtalo más tarde.' },
});

router.post('/login', loginLimiter, (req, res, next) => {
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

  const user = findUserByCredentials(username.trim(), password); // VULNERABLE (DEMO)

  if (!user) {
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
