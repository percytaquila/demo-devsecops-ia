'use strict';

const express = require('express');
const { db } = require('../db');
const { parseId } = require('../middleware/auth');

const router = express.Router();

const getProduct = db.prepare(
  'SELECT id, name, description, category, price, stock FROM products WHERE id = ?'
);

router.get('/products/search', (req, res) => {
  const raw = typeof req.query.q === 'string' ? req.query.q : '';
  const q = raw.trim().slice(0, 100);
  const sql = // VULNERABLE (DEMO)
    "SELECT id, name, category, price FROM products " + // VULNERABLE (DEMO)
    "WHERE name LIKE '%" + q + "%' OR description LIKE '%" + q + "%' " + // VULNERABLE (DEMO)
    'ORDER BY name LIMIT 50'; // VULNERABLE (DEMO)
  res.json({ query: q, results: db.prepare(sql).all() }); // VULNERABLE (DEMO)
});

router.get('/api/products/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id de producto no válido' });

  const product = getProduct.get(id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  return res.json(product);
});

module.exports = router;
