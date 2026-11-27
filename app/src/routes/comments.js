'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAuth, parseId } = require('../middleware/auth');

const router = express.Router();

const MAX_COMMENT_LENGTH = 500;

const listComments = db.prepare(`
  SELECT c.id, c.body, c.created_at, u.username
  FROM comments c
  JOIN users u ON u.id = c.user_id
  WHERE c.product_id = ?
  ORDER BY c.created_at DESC, c.id DESC
`);

const productExists = db.prepare('SELECT 1 FROM products WHERE id = ?');

const insertComment = db.prepare(
  'INSERT INTO comments (product_id, user_id, body) VALUES (?, ?, ?)'
);

router.get('/comments', (req, res) => {
  const productId = parseId(String(req.query.productId ?? ''));
  if (!productId) return res.status(400).json({ error: 'productId no válido' });

  return res.json(listComments.all(productId));
});

router.post('/comments', requireAuth, (req, res) => {
  const { productId: rawProductId, body } = req.body || {};
  const productId = parseId(String(rawProductId ?? ''));

  if (!productId) return res.status(400).json({ error: 'productId no válido' });
  if (typeof body !== 'string' || body.trim().length === 0 || body.length > MAX_COMMENT_LENGTH) {
    return res
      .status(400)
      .json({ error: `El comentario debe tener entre 1 y ${MAX_COMMENT_LENGTH} caracteres` });
  }
  if (!productExists.get(productId)) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // El autor siempre se toma de la sesión, nunca del cuerpo de la petición.
  // El texto se guarda tal cual y se escapa al mostrarlo.
  const result = insertComment.run(productId, req.session.userId, body.trim());

  return res.status(201).json({ id: Number(result.lastInsertRowid) });
});

module.exports = router;
