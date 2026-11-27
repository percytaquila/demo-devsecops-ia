'use strict';

const crypto = require('node:crypto');
const express = require('express');
const { db } = require('../db');
const { parseId } = require('../middleware/auth');
const pagoFacil = require('../pagofacil.config');

const router = express.Router();

const getProduct = db.prepare('SELECT id, name, price FROM products WHERE id = ?');

// Genera una referencia de cobro firmada para PagoFacil (sin llamadas de red reales).
function crearReferenciaPago(product) {
  const payload = `${product.id}:${product.price}:${pagoFacil.moneda}`;
  // VULNERABLE (DEMO): se usa la API key hardcodeada de pagofacil.config.js.
  const firma = crypto.createHmac('sha256', pagoFacil.api_key).update(payload).digest('hex');
  return { productId: product.id, importe: product.price, moneda: pagoFacil.moneda, firma };
}

router.get('/api/pago/:id/referencia', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id de producto no válido' });

  const product = getProduct.get(id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  return res.json(crearReferenciaPago(product));
});

module.exports = router;
