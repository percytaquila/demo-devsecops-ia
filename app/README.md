# TiendaDemo

Tienda web de ejemplo para la **demo de DevSecOps con IA**.
Esta es la **versión segura** (rama `main`).

Stack: Node.js 22 + Express 5 + SQLite (`node:sqlite`, integrado en Node) + HTML/JS sin frameworks.

## Ejecutar con Docker

```bash
cd app
cp .env.example .env        # rellena SESSION_SECRET y DEMO_PASSWORD
docker build -t tienda-demo .
docker run --rm -p 3000:3000 --env-file .env tienda-demo
```

Abre <http://localhost:3000>. Comprobación de salud:

```bash
curl http://localhost:3000/health   # {"status":"ok"}
```

> La base de datos se crea en `/app/data` dentro del contenedor y se rellena con datos de
> prueba al arrancar. Para conservarla entre ejecuciones: `-v tienda-data:/app/data`.

## Ejecutar en local (sin Docker)

Requiere Node.js 22.13 o superior.

```bash
cd app
cp .env.example .env
npm install
npm run dev
```

## Variables de entorno

| Variable         | Obligatoria | Descripción                                                  |
|------------------|-------------|--------------------------------------------------------------|
| `SESSION_SECRET` | Sí          | Secreto de la cookie de sesión (mín. 32 caracteres)          |
| `DEMO_PASSWORD`  | Sí          | Contraseña de los usuarios de prueba (mín. 8 caracteres)     |
| `PORT`           | No          | Puerto HTTP (por defecto `3000`)                             |
| `DB_PATH`        | No          | Ruta del archivo SQLite (por defecto `./data/tienda.sqlite`) |
| `COOKIE_SECURE`  | No          | `true` si se sirve por HTTPS                                 |
| `TRUST_PROXY`    | No          | `true` si hay un proxy inverso de confianza delante          |

Si falta una variable obligatoria, la app no arranca: no hay secretos por defecto en el código.

## Datos de prueba

Se crean al iniciar si la base de datos está vacía:

- **Usuarios:** `alice` (admin), `bruno` y `carla`, todos con la contraseña `DEMO_PASSWORD`.
- **Productos:** 10 productos de electrónica y accesorios.

## Páginas

| Ruta              | Descripción                                 |
|-------------------|---------------------------------------------|
| `/login`          | Inicio de sesión                            |
| `/products`       | Lista de productos con buscador             |
| `/product?id=N`   | Detalle de producto con comentarios         |
| `/profile`        | Mi perfil (requiere sesión)                 |

## API

| Método | Ruta                       | Auth | Descripción                                     |
|--------|----------------------------|------|-------------------------------------------------|
| POST   | `/login`                   | No   | `{username, password}` → inicia sesión          |
| POST   | `/logout`                  | No   | Cierra la sesión                                |
| GET    | `/api/me`                  | Sí   | Usuario de la sesión actual                     |
| GET    | `/products/search?q=`      | No   | Busca productos por nombre o descripción        |
| GET    | `/api/products/:id`        | No   | Detalle de un producto                          |
| GET    | `/comments?productId=`     | No   | Comentarios de un producto                      |
| POST   | `/comments`                | Sí   | `{productId, body}` → publica un comentario     |
| GET    | `/api/users/:id`           | Sí   | Perfil, **solo del propio usuario** (si no, 403) |
| GET    | `/health`                  | No   | `{"status":"ok"}`                               |

## Controles de seguridad

| Riesgo                       | Control                                                                          | Dónde                          |
|------------------------------|----------------------------------------------------------------------------------|--------------------------------|
| Inyección SQL                | Consultas parametrizadas (`db.prepare(...)` con `?`) y comodines de `LIKE` escapados | `src/routes/*.js`          |
| XSS                          | `escapeHtml()` en todo dato insertado en HTML + CSP `script-src 'self'`          | `public/js/*.js`, `src/app.js` |
| IDOR / control de acceso     | `requireAuth` y comprobación `id === session.userId`                             | `src/routes/users.js`          |
| Suplantación en comentarios  | El autor se toma de la sesión, nunca del cuerpo                                  | `src/routes/comments.js`       |
| Contraseñas                  | Hash bcrypt (coste 12, `bcryptjs`); el hash nunca se devuelve en la API          | `src/seed.js`, `src/routes/auth.js` |
| Fuerza bruta                 | Límite de 10 intentos de login cada 15 min por IP                                | `src/routes/auth.js`           |
| Enumeración de usuarios      | Mensaje genérico y comparación bcrypt también si el usuario no existe            | `src/routes/auth.js`           |
| Fijación de sesión           | `session.regenerate()` tras el login                                             | `src/routes/auth.js`           |
| Robo de cookie / CSRF        | Cookie `HttpOnly`, `SameSite=Strict`, `Secure` configurable; API solo JSON       | `src/app.js`                   |
| Cabeceras                    | `helmet` (CSP, `nosniff`, `X-Frame-Options`, HSTS, sin `X-Powered-By`)           | `src/app.js`                   |
| Fuga de información          | Errores genéricos sin trazas; límite de 10 kB en el cuerpo                       | `src/app.js`                   |
| Secretos                     | Solo por variables de entorno; `.env` excluido de Git y de la imagen             | `src/config.js`                |
| Contenedor                   | Usuario sin privilegios (`node`), código de solo lectura, `HEALTHCHECK`, `npm ci --omit=dev` | `Dockerfile`         |

### Limitaciones conocidas (aceptables para la demo)

- Las sesiones se guardan en memoria (`MemoryStore`): se pierden al reiniciar y no escalan a
  varias instancias. En producción usar un store persistente (Redis, SQLite, etc.).
- `node:sqlite` sigue marcado como experimental en Node 22; el aviso se silencia con
  `--disable-warning=ExperimentalWarning`.
