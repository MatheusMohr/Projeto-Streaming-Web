const db = new PouchDB('movies');

let filmeEditando = null;

const form = document.getElementById('add-movie-form');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const listaFilmes = document.getElementById('filme-lista');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const filmeData = {
    titulo: form.nome.value.trim(),
    imagem: form.imagem.value.trim(),
    trailer: form.trailer.value.trim(),
    classificacao: form.classificacao.value.trim(),
    descricao: form.descricao.value.trim(),
    duracao: form.duracao.value.trim(),
    genero: form.genero.value.trim(),
    ano: form.ano.value.trim(),
  };

  try {
    if (filmeEditando) {
      filmeData._id = filmeEditando._id;
      filmeData._rev = filmeEditando._rev;
      await db.put(filmeData);
      alert('Filme atualizado com sucesso!');
      filmeEditando = null;
      btnSalvar.textContent = 'Adicionar Filme';
      btnCancelar.style.display = 'none';
    } else {
      filmeData._id = 'filme_' + Date.now();
      await db.put(filmeData);
      alert('Filme adicionado com sucesso!');
    }

    form.reset();
    carregarFilmes();
  } catch (err) {
    alert('Erro ao salvar filme: ' + err);
  }
});

btnCancelar.addEventListener('click', () => {
  filmeEditando = null;
  form.reset();
  btnSalvar.textContent = 'Adicionar Filme';
  btnCancelar.style.display = 'none';
});

async function carregarFilmes() {
  listaFilmes.innerHTML = '';
  try {
    const result = await db.allDocs({ include_docs: true });
    result.rows.forEach(row => {
      const f = row.doc;
      if (f._id.startsWith('filme_')) {
        const li = document.createElement('li');

        // Texto do filme
        const spanTitulo = document.createElement('span');
        spanTitulo.textContent = `${f.titulo} (${f.ano}) - ${f.genero}`;
        spanTitulo.style.marginRight = '15px';

        // Botão editar
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.style.marginRight = '10px';
        btnEditar.style.cursor = 'pointer';
        btnEditar.addEventListener('click', () => {
          filmeEditando = f;
          preencherFormulario(f);
          btnSalvar.textContent = 'Salvar Alterações';
          btnCancelar.style.display = 'inline-block';
        });

        // Botão excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.style.cursor = 'pointer';
        btnExcluir.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          if (confirm(`Deseja excluir o filme "${f.titulo}"?`)) {
            try {
              await db.remove(f);
              alert('Filme excluído com sucesso!');
              if (filmeEditando && filmeEditando._id === f._id) {
                filmeEditando = null;
                form.reset();
                btnSalvar.textContent = 'Adicionar Filme';
                btnCancelar.style.display = 'none';
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

function preencherFormulario(filme) {
  form.nome.value = filme.titulo || '';
  form.imagem.value = filme.imagem || '';
  form.trailer.value = filme.trailer || '';
  form.classificacao.value = filme.classificacao || '';
  form.descricao.value = filme.descricao || '';
  form.duracao.value = filme.duracao || '';
  form.genero.value = filme.genero || '';
  form.ano.value = filme.ano || '';
}

document.addEventListener('DOMContentLoaded', carregarFilmes);
