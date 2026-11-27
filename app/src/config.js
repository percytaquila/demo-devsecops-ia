'use strict';

// Toda la configuración sensible llega por variables de entorno.
// No hay secretos por defecto en el código: si faltan, la app no arranca.

function requireEnv(name, minLength) {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    console.error(
      `[config] Falta la variable de entorno ${name} (mínimo ${minLength} caracteres). ` +
        'Consulta app/.env.example.'
    );
    process.exit(1);
  }
  return value;
}

module.exports = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  sessionSecret: requireEnv('SESSION_SECRET', 32),
  demoPassword: requireEnv('DEMO_PASSWORD', 8),
  dbPath: process.env.DB_PATH || './data/tienda.sqlite',
  // Activar (true) cuando la app se sirva por HTTPS.
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  // Activar (true) solo si hay un proxy inverso de confianza delante.
  trustProxy: process.env.TRUST_PROXY === 'true',
};
