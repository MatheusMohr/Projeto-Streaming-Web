/* cadastro.js ----------------------------------------------------------- */
const dbUsers = new PouchDB('mathflix-users');

/* ---------- util: gerar novo _id sequencial --------------------------- */
async function gerarNovoIdUsuario() {
  const r = await dbUsers.allDocs({ startkey: 'usuario_', endkey: 'usuario_\ufff0' });
  const max = r.rows
    .map(row => parseInt(row.id.split('_')[1] || -1, 10))
    .reduce((a, b) => Math.max(a, b), -1);
  return 'usuario_' + (max + 1);
}

/* ---------- alternar visibilidade da senha --------------------------- */
(() => {
  const btn  = document.getElementById('toggle-password');
  const pass = document.getElementById('password');

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
  btn.innerHTML = eyeOpen;

  btn.addEventListener('click', () => {
    const hidden = pass.type === 'password';
    pass.type = hidden ? 'text' : 'password';
    btn.innerHTML = hidden ? eyeClosed : eyeOpen;
  });
})();

/* ---------- submit do formulário ------------------------------------- */
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome  = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass  = document.getElementById('password').value;

  if (!nome || !email || !pass) {
    alert('Preencha todos os campos!');
    return;
  }

  try {
    /* verifica e-mail duplicado */
    const all = await dbUsers.allDocs({ include_docs: true });
    if (all.rows.some(r => r.doc.email === email)) {
      alert('E-mail já cadastrado!');
      return;
    }

    const user = {
      _id: await gerarNovoIdUsuario(),
      nome,
      email,
      password: pass,
      admin: false
    };

    await dbUsers.put(user);
    alert('Cadastro realizado com sucesso!');
    location.href = 'login.html';
  } catch (err) {
    console.error(err);
    alert('Erro no cadastro. Tente novamente.');
  }
});
