const dbUsers = new PouchDB('mathflix-users');

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  // Login admin hardcoded
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

    // Buscar usuário pelo email no campo 'email'
    const result = await dbUsers.allDocs({ include_docs: true });
    const user = result.rows.find(row => row.doc.email === email)?.doc;

    if (!user) {
      alert('Usuário não encontrado!');
      return;
    }

    if (user.password !== password) {
      alert('Senha incorreta!');
      return;
    }

    // Login normal: salva sessão e redireciona
    sessionStorage.setItem('usuario_logado', email);
    sessionStorage.setItem('usuario_admin', user.admin ? 'true' : 'false');

    if (user.admin) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'filmes.html';
    }

  } catch (error) {
    alert('Erro no login: ' + error);
  }
});
