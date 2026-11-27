'use strict';

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  return next();
}

// Valida que un parámetro sea un id entero positivo.
function parseId(value) {
  if (typeof value !== 'string' || !/^\d{1,10}$/.test(value)) return null;
  const id = Number.parseInt(value, 10);
  return id > 0 ? id : null;
}

module.exports = { requireAuth, parseId };
