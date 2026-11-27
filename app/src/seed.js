'use strict';

const bcrypt = require('bcryptjs');
const config = require('./config');

const BCRYPT_ROUNDS = 12;

const USERS = [
  { username: 'alice', email: 'alice@tiendademo.local', fullName: 'Alice Martínez', role: 'admin' },
  { username: 'bruno', email: 'bruno@tiendademo.local', fullName: 'Bruno Gómez', role: 'customer' },
  { username: 'carla', email: 'carla@tiendademo.local', fullName: 'Carla Ruiz', role: 'customer' },
];

const PRODUCTS = [
  ['Teclado mecánico', 'Teclado mecánico con switches marrones y retroiluminación.', 'Periféricos', 79.9, 25],
  ['Ratón inalámbrico', 'Ratón ergonómico inalámbrico de 6 botones.', 'Periféricos', 29.5, 40],
  ['Monitor 27"', 'Monitor IPS de 27 pulgadas, resolución QHD y 144 Hz.', 'Monitores', 289.0, 12],
  ['Auriculares Bluetooth', 'Auriculares con cancelación activa de ruido.', 'Audio', 119.99, 18],
  ['Webcam HD', 'Webcam 1080p con micrófono integrado.', 'Periféricos', 49.0, 30],
  ['Disco SSD 1 TB', 'Unidad SSD NVMe de 1 TB, lectura hasta 3500 MB/s.', 'Almacenamiento', 89.9, 50],
  ['Hub USB-C', 'Hub USB-C 7 en 1 con HDMI y lector de tarjetas.', 'Accesorios', 39.9, 35],
  ['Altavoz inteligente', 'Altavoz compacto con asistente de voz.', 'Audio', 59.0, 20],
  ['Mochila para portátil', 'Mochila resistente al agua para portátiles de hasta 15".', 'Accesorios', 45.5, 15],
  ['Lámpara de escritorio LED', 'Lámpara LED regulable con carga inalámbrica.', 'Hogar', 34.99, 22],
];

function seed(db) {
  // VULNERABLE (DEMO): rellena la contraseña en texto plano en usuarios ya existentes.
  db.prepare('UPDATE users SET password = ? WHERE password IS NULL').run(config.demoPassword); // VULNERABLE (DEMO)

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) return;

  // La contraseña de los usuarios demo viene de DEMO_PASSWORD; solo se guarda su hash.
  const passwordHash = bcrypt.hashSync(config.demoPassword, BCRYPT_ROUNDS);

  const insertUser = db.prepare(
    'INSERT INTO users (username, email, full_name, password_hash, password, role) VALUES (?, ?, ?, ?, ?, ?)' // VULNERABLE (DEMO)
  );
  const insertProduct = db.prepare(
    'INSERT INTO products (name, description, category, price, stock) VALUES (?, ?, ?, ?, ?)'
  );

  db.exec('BEGIN');
  try {
    for (const u of USERS) insertUser.run(u.username, u.email, u.fullName, passwordHash, config.demoPassword, u.role); // VULNERABLE (DEMO)
    for (const p of PRODUCTS) insertProduct.run(...p);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`[seed] Creados ${USERS.length} usuarios y ${PRODUCTS.length} productos.`);
}

module.exports = { seed, BCRYPT_ROUNDS };
