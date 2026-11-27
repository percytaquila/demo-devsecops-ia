FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/app/data/tienda.sqlite

WORKDIR /app

# Solo dependencias de producción, instaladas de forma reproducible desde el lockfile.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# El código pertenece a root (solo lectura para la app); solo /app/data es escribible.
COPY . .
RUN mkdir -p /app/data && chown node:node /app/data

# Ejecutar sin privilegios.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
