# CLAUDE.md

Este repositorio es una **demo de DevSecOps con IA**.

## La aplicación: TiendaDemo

- Ubicación: `/app`
- Stack: **Node.js + Express + SQLite + HTML simple**
- Se ejecuta con **Docker** en el puerto **3000**
- Expone un endpoint de salud: `GET /health`

## Estructura

| Carpeta              | Propósito                                        |
|----------------------|--------------------------------------------------|
| `/app`               | Código de la aplicación TiendaDemo               |
| `/docs`              | Documentación de la demo                         |
| `/docs/patches`      | Parches / correcciones de seguridad documentadas |
| `/scripts`           | Scripts de automatización de la demo             |
| `/.github/workflows` | Pipelines de CI/CD y escaneos de seguridad       |

## Modelo de ramas (REGLAS ESTRICTAS)

- **`main`** — Versión **segura** de la app. **Nunca** debe recibir código vulnerable.
  No hacer merge de ramas `vuln/*` ni `demo/*` hacia `main`.
- **`vuln/*`** — Plantillas con vulnerabilidades **intencionales**. Cada vulnerabilidad
  está marcada con el comentario:
  ```js
  // VULNERABLE (DEMO)
  ```
  No "arreglar" estas vulnerabilidades en la rama `vuln/*`: son el material de la demo.
- **`demo/*`** — Ramas **desechables**, creadas para ejecutar una demo concreta
  (por ejemplo, a partir de una `vuln/*`). Pueden borrarse o recrearse libremente.

## Reglas para los scripts (`/scripts`)

- Los scripts **nunca** deben modificar `main` ni ninguna rama `vuln/*`
  (ni commits, ni push, ni reset, ni borrado).
- Los scripts solo pueden crear, modificar o eliminar ramas `demo/*`.

## Reglas para Claude

- Antes de cualquier commit, verificar la rama actual. Si es `main`, asegurarse de que
  el cambio no introduce código vulnerable ni marcas `// VULNERABLE (DEMO)`.
- Las correcciones de seguridad se aplican en ramas `demo/*` (o se documentan en
  `/docs/patches`), nunca reescribiendo las plantillas `vuln/*`.
