'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  await renderMenu();

  const form = document.getElementById('login-form');
  const message = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';

    const { ok, data } = await api('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: form.username.value,
        password: form.password.value,
      }),
    });

    if (ok) {
      window.location.href = '/products';
    } else {
      message.textContent = (data && data.error) || 'Error al iniciar sesión';
    }
  });
});
