'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const config = require('./config');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');

function createApp() {
  const app = express();

  if (config.trustProxy) app.set('trust proxy', 1);

  // Cabeceras de seguridad (CSP, X-Content-Type-Options, X-Frame-Options, etc.).
  // La CSP solo permite scripts propios, por eso no hay JS inline en el HTML.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // La demo corre por HTTP en local; no forzar la subida a HTTPS.
          upgradeInsecureRequests: null,
        },
      },
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(express.json({ limit: '10kb' }));

  app.use(
    session({
      name: 'tienda.sid',
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // SameSite=strict + API solo JSON mitigan CSRF.
        sameSite: 'strict',
        secure: config.cookieSecure,
        maxAge: 60 * 60 * 1000,
      },
    })
  );

  app.use(authRoutes);
  app.use(productRoutes);
  app.use(commentRoutes);
  app.use(userRoutes);

  app.get('/', (req, res) => res.redirect('/products'));

  // Páginas HTML: /login, /products, /product?id=N, /profile
  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

  app.use((req, res) => {
    res.status(404).json({ error: 'No encontrado' });
  });

  // Manejador de errores: no se exponen trazas ni detalles internos al cliente.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
      return res.status(400).json({ error: 'Petición no válida' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  });

  return app;
}

module.exports = { createApp };
