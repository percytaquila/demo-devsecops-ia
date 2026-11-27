'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await renderMenu();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  const container = document.getElementById('profile');
  const { ok, data } = await api(`/api/users/${encodeURIComponent(user.id)}`);

  if (!ok) {
    container.innerHTML = `<p>${escapeHtml((data && data.error) || 'No se pudo cargar el perfil')}</p>`;
    return;
  }

  container.innerHTML = `
    <dl>
      <dt>Usuario</dt><dd>${escapeHtml(data.username)}</dd>
      <dt>Nombre</dt><dd>${escapeHtml(data.full_name)}</dd>
      <dt>Email</dt><dd>${escapeHtml(data.email)}</dd>
      <dt>Rol</dt><dd>${escapeHtml(data.role)}</dd>
      <dt>Alta</dt><dd>${escapeHtml(data.created_at)}</dd>
    </dl>`;
});
