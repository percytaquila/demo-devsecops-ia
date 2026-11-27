'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAuth, parseId } = require('../middleware/auth');

const router = express.Router();

// Nunca se selecciona password_hash.
const getUser = db.prepare(
  'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?'
);

router.get('/api/users/:id', requireAuth, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id de usuario no válido' });

  // Control de acceso: cada usuario solo puede consultar su propio perfil (evita IDOR).
  if (id !== req.session.userId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const user = getUser.get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  return res.json(user);
});

module.exports = router;
