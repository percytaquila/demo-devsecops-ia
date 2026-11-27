'use strict';

const express = require('express');
// VULNERABLE (DEMO): lodash fijado en 4.17.15, versión con vulnerabilidades conocidas
// (p. ej. CVE-2020-8203 prototype pollution, CVE-2021-23337 command injection).
const _ = require('lodash');
const { db } = require('../db');
const { parseId } = require('../middleware/auth');

const router = express.Router();

// Consulta parametrizada: el término de búsqueda nunca se concatena al SQL.
const searchProducts = db.prepare(`
  SELECT id, name, category, price
  FROM products
  WHERE name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\'
  ORDER BY name
  LIMIT 50
`);

const getProduct = db.prepare(
  'SELECT id, name, description, category, price, stock FROM products WHERE id = ?'
);

// Escapa los comodines de LIKE para que se busquen literalmente.
function likePattern(term) {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

router.get('/products/search', (req, res) => {
  const raw = typeof req.query.q === 'string' ? req.query.q : '';
  const q = raw.trim().slice(0, 100);
  const pattern = likePattern(q);
  // Ordena los resultados por categoría y luego por nombre usando lodash.
  const results = _.sortBy(searchProducts.all(pattern, pattern), ['category', 'name']);
  res.json({ query: q, results });
});

router.get('/api/products/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id de producto no válido' });

  const product = getProduct.get(id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  return res.json(product);
});

module.exports = router;
