document.addEventListener('DOMContentLoaded', () => {

  const anoSpan = document.getElementById('anoAtual');
  if (anoSpan) anoSpan.textContent = new Date().getFullYear();

  function attachDescriptionListeners(filme) {
    const descBox = filme.querySelector('.descricao-abaixo');
    if (!descBox) return;

    function show() {
      const { titulo, sinopse, classificacao, duracao, genero, ano } = filme.dataset;
      descBox.innerHTML = `
        <h4>${titulo}</h4>
        <p>${sinopse}</p>
        <p><strong>Classificação:</strong> ${classificacao}</p>
        <p><strong>Duração:</strong> ${duracao}</p>
        <p><strong>Gênero:</strong> ${genero}</p>
        <p><strong>Ano:</strong> ${ano}</p>
      `;
      filme.classList.add('expanded');
    }

    function hide() {
      descBox.innerHTML = '';
      filme.classList.remove('expanded');
    }

    filme.addEventListener('mouseenter', show);
    filme.addEventListener('mouseleave', hide);
    filme.addEventListener('focus',      show);
    filme.addEventListener('blur',       hide);
  }

  document.querySelectorAll('.catalogo .filme')
          .forEach(attachDescriptionListeners);

  const dbMovies = new PouchDB('movies');
  const catalogo = document.querySelector('.catalogo');
  if (!catalogo) {
    console.error('Container .catalogo não encontrado!');
    return;
  }

  dbMovies.allDocs({ include_docs: true })
    .then(res => {
      res.rows
        .map(r => r.doc)
        .filter(doc => doc._id.startsWith('filme_'))
        .forEach(f => {
          const card = document.createElement('div');
          card.className = 'filme';
          card.tabIndex  = 0;
          card.dataset.titulo        = f.titulo;
          card.dataset.sinopse       = f.descricao;
          card.dataset.classificacao = f.classificacao;
          card.dataset.duracao       = f.duracao;
          card.dataset.genero        = f.genero;
          card.dataset.ano           = f.ano;

          card.innerHTML = `
            <img src="${f.imagem}" alt="${f.titulo}">
            <h3>${f.titulo}</h3>
            <div class="descricao-abaixo"></div>
          `;
          attachDescriptionListeners(card);
          catalogo.appendChild(card);
        });
    })
    .catch(err => {
      console.error('Erro ao carregar filmes do admin:', err);
    });
});
