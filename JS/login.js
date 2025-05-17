const db = new PouchDB('mathflix-users');

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.toLowerCase();
  const password = document.getElementById('login-password').value;

  const adminEmail = 'admin@mathcine.com';
  const adminPassword = 'admin';

  try {
    if (email === adminEmail && password === adminPassword) {
      alert('Login admin realizado com sucesso!');
      sessionStorage.setItem('usuario_logado', adminEmail);
      sessionStorage.setItem('usuario_admin', 'true');
      window.location.href = 'admin.html';
      return;
    }

    // Login usuários normais no PouchDB
    const user = await db.get('usuario_' + email);

    if (user.password === password) {
      alert('Login realizado com sucesso!');
      sessionStorage.setItem('usuario_logado', email);
      sessionStorage.setItem('usuario_admin', user.admin ? 'true' : 'false');

      if (user.admin) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'filmes.html';
      }
    } else {
      alert('Senha incorreta!');
    }
  } catch (error) {
    alert('Usuário não encontrado!');
  }
});