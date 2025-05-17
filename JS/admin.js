const db = new PouchDB('movies');

let editandoFilmeId = null; // se não for null, estamos editando

// Salvar novo filme ou atualizar existente
document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const filme = {
    titulo: document.getElementById('nome').value.trim(),
    imagem: document.getElementById('imagem').value.trim(),
    trailer: document.getElementById('trailer').value.trim(),
    classificacao: document.getElementById('classificacao').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    duracao: document.getElementById('duracao').value.trim(),
    genero: document.getElementById('genero').value.trim(),
    ano: document.getElementById('ano').value.trim(),
  };

  try {
    if (editandoFilmeId) {
      // Edição
      const doc = await db.get(editandoFilmeId);
      await db.put({ ...doc, ...filme });
      alert('Filme atualizado com sucesso!');
      editandoFilmeId = null;
    } else {
      // Novo
      await db.put({ _id: new Date().toISOString(), ...filme });
      alert('Filme adicionado com sucesso!');
    }

    e.target.reset();
    listarFilmes();
  } catch (err) {
    alert('Erro ao salvar filme: ' + err.message);
  }
});

// Listar filmes no painel admin
async function listarFilmes() {
  const lista = document.getElementById('filme-lista');
  lista.innerHTML = '';

  try {
    const result = await db.allDocs({ include_docs: true });

    if (result.rows.length === 0) {
      lista.innerHTML = '<li>Nenhum filme cadastrado.</li>';
      return;
    }

    result.rows.forEach(row => {
      const filme = row.doc;
      const li = document.createElement('li');

      li.innerHTML = `
        <strong>${filme.titulo}</strong> (${filme.ano}) -
        <button data-id="${filme._id}">Editar</button>
      `;

      li.querySelector('button').addEventListener('click', () => {
        preencherFormularioParaEdicao(filme);
      });

      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao listar filmes:', err);
  }
}

// Preencher formulário com dados do filme para edição
function preencherFormularioParaEdicao(filme) {
  document.getElementById('nome').value = filme.titulo;
  document.getElementById('imagem').value = filme.imagem;
  document.getElementById('trailer').value = filme.trailer;
  document.getElementById('classificacao').value = filme.classificacao;
  document.getElementById('descricao').value = filme.descricao;
  document.getElementById('duracao').value = filme.duracao;
  document.getElementById('genero').value = filme.genero;
  document.getElementById('ano').value = filme.ano;

  editandoFilmeId = filme._id;
}

// Botão para ir à página de filmes
document.getElementById('btn-ver-filmes').addEventListener('click', () => {
  window.location.href = '../Html/filmes.html';
});

// Inicializar
listarFilmes();
