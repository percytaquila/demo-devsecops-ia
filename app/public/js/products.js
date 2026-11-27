'use strict';

async function search(q) {
  const summary = document.getElementById('search-summary');
  const list = document.getElementById('product-list');

  const { ok, data } = await api(`/products/search?q=${encodeURIComponent(q)}`);
  if (!ok) {
    summary.textContent = 'No se pudo realizar la búsqueda.';
    list.innerHTML = '';
    return;
  }

  summary.innerHTML = data.query
    ? `${data.results.length} resultado(s) para «<strong>${escapeHtml(data.query)}</strong>»`
    : `${data.results.length} producto(s)`;

  list.innerHTML = data.results
    .map(
      (p) => `
      <li class="card">
        <a href="/product?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a>
        <span class="category">${escapeHtml(p.category)}</span>
        <span class="price">${escapeHtml(formatPrice(p.price))}</span>
      </li>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderMenu();

  const form = document.getElementById('search-form');
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  form.q.value = q;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const term = form.q.value;
    const url = term ? `/products?q=${encodeURIComponent(term)}` : '/products';
    window.history.replaceState(null, '', url);
    search(term);
  });

  search(q);
});
