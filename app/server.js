'use strict';

const config = require('./src/config');
const { db } = require('./src/db');
const { seed } = require('./src/seed');
const { createApp } = require('./src/app');

seed(db);

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`TiendaDemo escuchando en el puerto ${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
