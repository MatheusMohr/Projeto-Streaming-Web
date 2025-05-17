/* login.js -------------------------------------------------------------- */
/*  Fluxo idêntico ao script original:
    – Admin hard-coded
    – Busca de usuário por e-mail no PouchDB “mathflix-users”
    – Flags em sessionStorage
    – Checkbox “Lembrar de mim”
    – Botão mostrar/ocultar senha                                      */

(() => {
  /* ---------- Configurações ------------------------------------------- */
  const DB_NAME        = 'mathflix-users';
  const ADMIN_EMAIL    = 'admin@mathcine.com';
  const ADMIN_PASSWORD = 'admin';            // troque em produção
  const REMEMBER_KEY   = 'mathcine_last_email';

  const db = new PouchDB(DB_NAME);

  /* ---------- Elementos de UI ----------------------------------------- */
  const form        = document.getElementById('login-form');
  const emailInput  = document.getElementById('login-email');
  const passInput   = document.getElementById('login-password');
  const rememberChk = document.getElementById('remember-me');
  const eyeBtn      = document.getElementById('toggle-password');

  /* ---------- SVGs para o botão “olho” -------------------------------- */
  const eyeOpen = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;
  const eyeClosed = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"/>
      <line x1="4" y1="4" x2="20" y2="20"/>
    </svg>`;
  eyeBtn.innerHTML = eyeOpen;

  eyeBtn.addEventListener('click', () => {
    const hidden = passInput.type === 'password';
    passInput.type = hidden ? 'text' : 'password';
    eyeBtn.innerHTML = hidden ? eyeClosed : eyeOpen;
  });

  /* ---------- Pré-preencher e-mail se “lembrar” ----------------------- */
  const savedEmail = localStorage.getItem(REMEMBER_KEY);
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberChk.checked = true;
  }

  /* ---------- Submit do formulário ------------------------------------ */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const pwd   = passInput.value;

    /* 1) Admin hard-coded ---------------------------------------------- */
    if (email === ADMIN_EMAIL && pwd === ADMIN_PASSWORD) {
      finishLogin({ email, admin: true });
      return;
    }

    /* 2) Usuário comum -------------------------------------------------- */
    try {
      const result = await db.allDocs({ include_docs: true });
      const user   = result.rows.find(r => r.doc.email === email)?.doc;

      if (!user) {
        alert('Usuário não encontrado!');
        return;
      }
      if (user.password !== pwd) {
        alert('Senha incorreta!');
        return;
      }

      finishLogin({ email, admin: !!user.admin });
    } catch (err) {
      console.error(err);
      alert('Erro no login: ' + err.message);
    }
  });

  /* ---------- Finaliza login + redireciona ---------------------------- */
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
