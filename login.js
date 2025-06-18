(() => {
  const DB_NAME = 'mathflix-users';
  const ADMIN_EMAIL = 'admin@mathcine.com';

  const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
  const REMEMBER_KEY = 'mathcine_last_email';

  const db = new PouchDB(DB_NAME);

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const rememberChk = document.getElementById('remember-me');
  const eyeBtn = document.getElementById('toggle-password');

  const eyeOpen = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`;
  const eyeClosed = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"/>
      <line x1="4" y1="4" x2="20" y2="20"/>
    </svg>`;
  eyeBtn.innerHTML = eyeClosed;

  eyeBtn.addEventListener('click', () => {
    const hidden = passInput.type === 'password';
    passInput.type = hidden ? 'text' : 'password';
    eyeBtn.innerHTML = hidden ? eyeOpen : eyeClosed;
  });

  async function hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const savedEmail = localStorage.getItem(REMEMBER_KEY);
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberChk.checked = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const pwd = passInput.value;

    if (email === ADMIN_EMAIL) {
      const hashedPwd = await hashSenha(pwd);
      if (hashedPwd === ADMIN_PASSWORD_HASH) {
        finishLogin({ email, admin: true });
        return;
      } else {
        alert('Senha incorreta!');
        return;
      }
    }

    try {
      const result = await db.allDocs({ include_docs: true });
      const user = result.rows.find(r => r.doc.email === email)?.doc;

      if (!user) {
        alert('Usuário não encontrado!');
        return;
      }

      const hashedPwd = await hashSenha(pwd);
      if (user.password !== hashedPwd) {
        alert('Senha incorreta!');
        return;
      }

      finishLogin({ email, admin: !!user.admin });
    } catch (err) {
      console.error(err);
      alert('Erro no login: ' + err.message);
    }
  });

  function finishLogin({ email, admin }) {
    alert('Login realizado com sucesso!');
    sessionStorage.setItem('usuario_logado', email);
    sessionStorage.setItem('usuario_admin', admin ? 'true' : 'false');

    if (rememberChk.checked) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    location.href = admin ? 'admin.html' : 'filmes.html';
  }
})();
