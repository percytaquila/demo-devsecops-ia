'use strict';

// Escapa texto antes de insertarlo como HTML (previene XSS).
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

async function getCurrentUser() {
  const { ok, data } = await api('/api/me');
  return ok ? data : null;
}

// Menú común a todas las páginas.
async function renderMenu() {
  const nav = document.getElementById('menu');
  if (!nav) return null;

  const user = await getCurrentUser();
  const current = window.location.pathname;

  const links = [
    { href: '/products', label: 'Productos' },
    { href: '/profile', label: 'Mi perfil' },
  ];

  nav.innerHTML =
    '<a class="brand" href="/products">TiendaDemo</a>' +
    links
      .map(
        (l) =>
          `<a href="${l.href}"${current === l.href ? ' class="active"' : ''}>${escapeHtml(l.label)}</a>`
      )
      .join('') +
    (user
      ? `<span class="user">Hola, ${escapeHtml(user.username)}</span><button type="button" id="logout-btn">Salir</button>`
      : `<a href="/login"${current === '/login' ? ' class="active"' : ''}>Login</a>`);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api('/logout', { method: 'POST' });
      window.location.href = '/login';
    });
  }

  return user;
}
