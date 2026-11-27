'use strict';

// Configuración del servicio de pagos PagoFacil (servicio ficticio de la demo).

// VULNERABLE (DEMO): API key escrita directamente en el código fuente.
// Debería llegar por variable de entorno o gestor de secretos, nunca versionarse.
// La clave es inventada y no pertenece a ningún proveedor real.
const api_key = 'zJMSNcVQQnyWGmasYQBvUB8b9uNRQNudkhzpAgwPinCvgmKF';

module.exports = {
  baseUrl: 'https://api.pagofacil.invalid/v1',
  moneda: 'EUR',
  api_key,
};
