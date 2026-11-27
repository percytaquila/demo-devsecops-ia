'use strict';

async function loadComments(productId) {
  const list = document.getElementById('comment-list');
  const { ok, data } = await api(`/comments?productId=${encodeURIComponent(productId)}`);

  if (!ok) {
    list.innerHTML = '<li>No se pudieron cargar los comentarios.</li>';
    return;
  }
  if (data.length === 0) {
    list.innerHTML = '<li class="muted">Todavía no hay comentarios.</li>';
    return;
  }

  list.innerHTML = data
    .map(
      (c) => `
      <li class="comment">
        <div class="comment-meta"><strong>${escapeHtml(c.username)}</strong> · ${escapeHtml(c.created_at)}</div>
        <p>${escapeHtml(c.body)}</p>
      </li>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await renderMenu();
  const container = document.getElementById('product');
  const productId = new URLSearchParams(window.location.search).get('id') || '';

  const { ok, data } = await api(`/api/products/${encodeURIComponent(productId)}`);
  if (!ok) {
    container.innerHTML = `<p>${escapeHtml((data && data.error) || 'Producto no encontrado')}</p>`;
    return;
  }

  document.title = `${data.name} - TiendaDemo`;
  container.innerHTML = `
    <h1>${escapeHtml(data.name)}</h1>
    <p class="category">${escapeHtml(data.category)}</p>
    <p>${escapeHtml(data.description)}</p>
    <p class="price">${escapeHtml(formatPrice(data.price))}</p>
    <p class="muted">Stock: ${escapeHtml(data.stock)}</p>`;

  document.getElementById('comments-section').hidden = false;

  const form = document.getElementById('comment-form');
  const loginHint = document.getElementById('login-hint');
  const message = document.getElementById('comment-message');

  if (user) {
    form.hidden = false;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      message.textContent = '';
      const res = await api('/comments', {
        method: 'POST',
        body: JSON.stringify({ productId: data.id, body: form.body.value }),
      });
      if (res.ok) {
        form.reset();
        loadComments(data.id);
      } else {
        message.textContent = (res.data && res.data.error) || 'No se pudo publicar el comentario';
      }
    });
  } else {
    loginHint.hidden = false;
  }

  loadComments(data.id);
});
