const dbMovies = new PouchDB('movies');
const dbUsers = new PouchDB('mathflix-users');

let filmeEditando = null;
let usuarioEditando = null;

const formFilme = document.getElementById('add-movie-form');
const btnSalvarFilme = document.getElementById('btn-salvar');
const btnCancelarFilme = document.getElementById('btn-cancelar');
const listaFilmes = document.getElementById('filme-lista');

const usuariosTableBody = document.querySelector('#usuariosTable tbody');
const formUsuario = document.getElementById('user-form');
const btnSalvarUsuario = document.getElementById('btn-save-user');
const btnCancelarUsuario = document.getElementById('btn-cancel-user');

async function gerarNovoIdUsuario() {
  const result = await dbUsers.allDocs({ include_docs: false, startkey: 'usuario_', endkey: 'usuario_\ufff0' });
  const idsNumericos = result.rows.map(row => {
    const parts = row.id.split('_');
    const num = parseInt(parts[1], 10);
    return isNaN(num) ? -1 : num;
  });
  const maiorId = idsNumericos.length ? Math.max(...idsNumericos) : -1;
  return 'usuario_' + (maiorId + 1);
}

// --- FILMES ---

formFilme.addEventListener('submit', async (e) => {
  e.preventDefault();

  const filmeData = {
    titulo: formFilme.nome.value.trim(),
    imagem: formFilme.imagem.value.trim(),
    trailer: formFilme.trailer.value.trim(),
    classificacao: formFilme.classificacao.value.trim(),
    descricao: formFilme.descricao.value.trim(),
    duracao: formFilme.duracao.value.trim(),
    genero: formFilme.genero.value.trim(),
    ano: formFilme.ano.value.trim(),
  };

  try {
    if (filmeEditando) {
      filmeData._id = filmeEditando._id;
      filmeData._rev = filmeEditando._rev;
      await dbMovies.put(filmeData);
      alert('Filme atualizado com sucesso!');
      filmeEditando = null;
      btnSalvarFilme.textContent = 'Adicionar Filme';
      btnCancelarFilme.style.display = 'none';
    } else {
      filmeData._id = 'filme_' + Date.now();
      await dbMovies.put(filmeData);
      alert('Filme adicionado com sucesso!');
    }
    formFilme.reset();
    carregarFilmes();
  } catch (err) {
    alert('Erro ao salvar filme: ' + err);
  }
});

btnCancelarFilme.addEventListener('click', () => {
  filmeEditando = null;
  formFilme.reset();
  btnSalvarFilme.textContent = 'Adicionar Filme';
  btnCancelarFilme.style.display = 'none';
});

async function carregarFilmes() {
  listaFilmes.innerHTML = '';
  try {
    const result = await dbMovies.allDocs({ include_docs: true });
    result.rows.forEach(row => {
      const f = row.doc;
      if (f._id.startsWith('filme_')) {
        const li = document.createElement('li');

        const spanTitulo = document.createElement('span');
        spanTitulo.textContent = `${f.titulo} (${f.ano}) - ${f.genero}`;
        spanTitulo.style.marginRight = '15px';

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.style.marginRight = '10px';
        btnEditar.style.cursor = 'pointer';
        btnEditar.addEventListener('click', () => {
          filmeEditando = f;
          preencherFormularioFilme(f);
          btnSalvarFilme.textContent = 'Salvar Alterações';
          btnCancelarFilme.style.display = 'inline-block';
        });

        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.style.cursor = 'pointer';
        btnExcluir.addEventListener('click', async () => {
          if (confirm(`Deseja excluir o filme "${f.titulo}"?`)) {
            try {
              await dbMovies.remove(f);
              alert('Filme excluído com sucesso!');
              if (filmeEditando && filmeEditando._id === f._id) {
                filmeEditando = null;
                formFilme.reset();
                btnSalvarFilme.textContent = 'Adicionar Filme';
                btnCancelarFilme.style.display = 'none';
              }
              carregarFilmes();
            } catch (error) {
              alert('Erro ao excluir filme: ' + error);
            }
          }
        });

        li.appendChild(spanTitulo);
        li.appendChild(btnEditar);
        li.appendChild(btnExcluir);
        listaFilmes.appendChild(li);
      }
    });
  } catch (err) {
    console.error('Erro ao carregar filmes:', err);
  }
}

function preencherFormularioFilme(filme) {
  formFilme.nome.value = filme.titulo || '';
  formFilme.imagem.value = filme.imagem || '';
  formFilme.trailer.value = filme.trailer || '';
  formFilme.classificacao.value = filme.classificacao || '';
  formFilme.descricao.value = filme.descricao || '';
  formFilme.duracao.value = filme.duracao || '';
  formFilme.genero.value = filme.genero || '';
  formFilme.ano.value = filme.ano || '';
}

// --- USUÁRIOS ---

formUsuario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = formUsuario.nome.value.trim();
  const email = formUsuario.email.value.trim().toLowerCase();
  const senha = formUsuario.senha.value;
  const admin = formUsuario.admin.checked;

  if (!nome || !email || (!senha && !usuarioEditando)) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  try {
    if (usuarioEditando) {
      const allUsers = await dbUsers.allDocs({ include_docs: true });
      const emailDuplicado = allUsers.rows.some(row =>
        row.doc.email === email && row.doc._id !== usuarioEditando._id
      );
      if (emailDuplicado) {
        alert('E-mail já cadastrado por outro usuário.');
        return;
      }

      usuarioEditando.nome = nome;
      usuarioEditando.email = email;
      if (senha) usuarioEditando.password = senha;
      usuarioEditando.admin = admin;

      await dbUsers.put(usuarioEditando);

      alert('Usuário atualizado com sucesso!');
      usuarioEditando = null;
      btnSalvarUsuario.textContent = 'Adicionar Usuário';
      btnCancelarUsuario.style.display = 'none';
    } else {
      const allUsers = await dbUsers.allDocs({ include_docs: true });
      const emailExiste = allUsers.rows.some(row => row.doc.email === email);
      if (emailExiste) {
        alert('E-mail já cadastrado!');
        return;
      }

      const novoId = await gerarNovoIdUsuario();

      const novoUsuario = {
        _id: novoId,
        nome,
        email,
        password: senha,
        admin,
      };

      await dbUsers.put(novoUsuario);
      alert('Usuário adicionado com sucesso!');
    }

    formUsuario.reset();
    carregarUsuarios();
  } catch (err) {
    alert('Erro ao salvar usuário: ' + err);
  }
});

btnCancelarUsuario.addEventListener('click', () => {
  usuarioEditando = null;
  formUsuario.reset();
  btnSalvarUsuario.textContent = 'Adicionar Usuário';
  btnCancelarUsuario.style.display = 'none';
});

async function carregarUsuarios() {
  usuariosTableBody.innerHTML = '';
  try {
    const result = await dbUsers.allDocs({ include_docs: true });
    result.rows.forEach(row => {
      const u = row.doc;
      if (u._id.startsWith('usuario_')) {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = u._id;

        const tdNome = document.createElement('td');
        tdNome.textContent = u.nome;

        const tdEmail = document.createElement('td');
        tdEmail.textContent = u.email;

        const tdAdmin = document.createElement('td');
        tdAdmin.textContent = u.admin ? 'Sim' : 'Não';

        const tdAcoes = document.createElement('td');

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.style.marginRight = '10px';
        btnEditar.style.cursor = 'pointer';
        btnEditar.addEventListener('click', () => {
          usuarioEditando = u;
          preencherFormularioUsuario(u);
          btnSalvarUsuario.textContent = 'Salvar Alterações';
          btnCancelarUsuario.style.display = 'inline-block';
        });

        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.style.cursor = 'pointer';
        btnExcluir.addEventListener('click', async () => {
          if (confirm(`Deseja excluir o usuário "${u.nome}"?`)) {
            try {
              await dbUsers.remove(u);
              alert('Usuário excluído com sucesso!');
              if (usuarioEditando && usuarioEditando._id === u._id) {
                usuarioEditando = null;
                formUsuario.reset();
                btnSalvarUsuario.textContent = 'Adicionar Usuário';
                btnCancelarUsuario.style.display = 'none';
              }
              carregarUsuarios();
            } catch (err) {
              alert('Erro ao excluir usuário: ' + err);
            }
          }
        });

        tdAcoes.appendChild(btnEditar);
        tdAcoes.appendChild(btnExcluir);

        tr.appendChild(tdId);
        tr.appendChild(tdNome);
        tr.appendChild(tdEmail);
        tr.appendChild(tdAdmin);
        tr.appendChild(tdAcoes);

        usuariosTableBody.appendChild(tr);
      }
    });
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
  }
}

function preencherFormularioUsuario(usuario) {
  formUsuario.nome.value = usuario.nome || '';
  formUsuario.email.value = usuario.email || '';
  formUsuario.senha.value = '';
  formUsuario.admin.checked = usuario.admin || false;
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  carregarFilmes();
  carregarUsuarios();

  btnCancelarFilme.style.display = 'none';
  btnCancelarUsuario.style.display = 'none';
});
