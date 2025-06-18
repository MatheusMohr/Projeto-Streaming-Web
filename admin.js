/* ===========================================================
   BLOQUEIO DE ACESSO – só entra quem tem usuario_admin=true
   =========================================================== */
if (sessionStorage.getItem('usuario_admin') !== 'true') {
  alert('Acesso restrito. Faça login como administrador.');
  location.href = 'login.html'; // redireciona ao login
  throw new Error('bloqueado');
}

/* =================== BANCOS PouchDB ======================= */
const dbMovies = new PouchDB('movies');
const dbUsers = new PouchDB('mathflix-users');

let filmeEditando = null;
let usuarioEditando = null;

/* ------------ referências de elementos -------------------------------- */
const formFilme = document.getElementById('add-movie-form');
const btnSalvarF = document.getElementById('btn-salvar');
const btnCancelF = document.getElementById('btn-cancelar');
const listaFilmes = document.getElementById('filme-lista');

const tbody = document.querySelector('#usuariosTable tbody');
const formUser = document.getElementById('user-form');
const btnSalvarU = document.getElementById('btn-save-user');
const btnCancelU = document.getElementById('btn-cancel-user');

/* ---------- gerar novo _id p/ usuário ----------------------- */
async function gerarNovoIdUsuario() {
  const r = await dbUsers.allDocs({ startkey: 'usuario_', endkey: 'usuario_\ufff0' });
  const max = r.rows
    .map(row => parseInt(row.id.split('_')[1] || -1, 10))
    .reduce((a, b) => Math.max(a, b), -1);
  return 'usuario_' + (max + 1);
}

/* ---------- Função para gerar hash SHA-256 da senha ------------------- */
async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ======================= CRUD DE FILMES =============================== */
formFilme.addEventListener('submit', async (e) => {
  e.preventDefault();

  const f = {
    titulo: formFilme.nome.value.trim(),
    imagem: formFilme.imagem.value.trim(),
    trailer: formFilme.trailer.value.trim(),
    classificacao: formFilme.classificacao.value.trim(),
    descricao: formFilme.descricao.value.trim(),
    duracao: formFilme.duracao.value.trim(),
    genero: formFilme.genero.value.trim(),
    ano: formFilme.ano.value.trim()
  };

  try {
    if (filmeEditando) {
      f._id = filmeEditando._id;
      f._rev = filmeEditando._rev;
      await dbMovies.put(f);
      alert('Filme atualizado!');
      filmeEditando = null;
      btnSalvarF.textContent = 'Adicionar Filme';
      btnCancelF.style.display = 'none';
    } else {
      f._id = 'filme_' + Date.now();
      await dbMovies.put(f);
      alert('Filme adicionado!');
    }
    formFilme.reset();
    carregarFilmes();
  } catch (err) {
    alert('Erro: ' + err);
  }
});

btnCancelF.addEventListener('click', () => {
  filmeEditando = null;
  formFilme.reset();
  btnSalvarF.textContent = 'Adicionar Filme';
  btnCancelF.style.display = 'none';
});

async function carregarFilmes() {
  listaFilmes.innerHTML = '';
  const r = await dbMovies.allDocs({ include_docs: true });
  r.rows.forEach(row => {
    const f = row.doc;
    if (!f._id.startsWith('filme_')) return;

    const li = document.createElement('li');
    li.textContent = `${f.titulo} (${f.ano}) – ${f.genero} `;

    const edit = document.createElement('button');
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => {
      filmeEditando = f;
      preencherFormFilme(f);
      btnSalvarF.textContent = 'Salvar Alterações';
      btnCancelF.style.display = 'inline-block';
    });

    const del = document.createElement('button');
    del.textContent = 'Excluir';
    del.addEventListener('click', async () => {
      if (confirm('Excluir "' + f.titulo + '"?')) {
        await dbMovies.remove(f);
        carregarFilmes();
      }
    });

    li.append(edit, del);
    listaFilmes.appendChild(li);
  });
}

function preencherFormFilme(f) {
  Object.entries(f).forEach(([k, v]) => {
    if (formFilme[k]) formFilme[k].value = v;
  });
}

/* ======================= CRUD DE USUÁRIOS ============================= */
formUser.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = formUser.nome.value.trim();
  const email = formUser.email.value.trim().toLowerCase();
  const senha = formUser.senha.value;
  const admin = formUser.admin.checked;

  if (!nome || !email || (!senha && !usuarioEditando)) {
    alert('Preencha os campos obrigatórios.');
    return;
  }

  try {
    const allUsers = await dbUsers.allDocs({ include_docs: true });
    const dup = allUsers.rows.some(r => r.doc.email === email && r.doc._id !== (usuarioEditando?._id));

    if (dup) {
      alert('E-mail já cadastrado.');
      return;
    }

    if (usuarioEditando) {
      Object.assign(usuarioEditando, { nome, email, admin });

      if (senha) {
        usuarioEditando.password = await hashSenha(senha);
      }

      await dbUsers.put(usuarioEditando);
      alert('Usuário atualizado!');
      usuarioEditando = null;
      btnSalvarU.textContent = 'Adicionar Usuário';
      btnCancelU.style.display = 'none';
    } else {
      const senhaHash = await hashSenha(senha);

      const novo = {
        _id: await gerarNovoIdUsuario(),
        nome,
        email,
        password: senhaHash,
        admin
      };
      await dbUsers.put(novo);
      alert('Usuário adicionado!');
    }

    formUser.reset();
    carregarUsuarios();
  } catch (err) {
    alert('Erro: ' + err);
  }
});

btnCancelU.addEventListener('click', () => {
  usuarioEditando = null;
  formUser.reset();
  btnSalvarU.textContent = 'Adicionar Usuário';
  btnCancelU.style.display = 'none';
});

async function carregarUsuarios() {
  tbody.innerHTML = '';
  const r = await dbUsers.allDocs({ include_docs: true });
  r.rows.forEach(row => {
    const u = row.doc;
    if (!u._id.startsWith('usuario_')) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u._id}</td>
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${u.admin ? 'Sim' : 'Não'}</td>
    `;

    const tdAcoes = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => {
      usuarioEditando = u;
      formUser.nome.value = u.nome;
      formUser.email.value = u.email;
      formUser.senha.value = '';
      formUser.admin.checked = !!u.admin;
      btnSalvarU.textContent = 'Salvar Alterações';
      btnCancelU.style.display = 'inline-block';
    });

    const del = document.createElement('button');
    del.textContent = 'Excluir';
    del.addEventListener('click', async () => {
      if (confirm('Excluir "' + u.nome + '"?')) {
        await dbUsers.remove(u);
        carregarUsuarios();
      }
    });

    tdAcoes.append(edit, del);
    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  });
}
/* ---------------- inicialização ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  carregarFilmes();
  carregarUsuarios();
  btnCancelF.style.display = 'none';
  btnCancelU.style.display = 'none';
});
