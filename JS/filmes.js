const db = new PouchDB('movies');

document.addEventListener("DOMContentLoaded", () => {

  function openModal(title, description, videoUrl) {
    document.getElementById('modalTitle').innerHTML = title;
    document.getElementById('modalDescription').innerHTML = description;
    const iframe = document.getElementById('videoIframe');
    iframe.src = videoUrl;
    const modal = document.getElementById('videoModal');
    modal.classList.add('show');
    modal.querySelector('.modal-content').focus();
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('show');
    document.getElementById('videoIframe').src = '';
    document.body.classList.remove('no-scroll');
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  function setupFilmesFixos() {
    document.querySelectorAll('.filme').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        openModal(card.dataset.titulo, card.dataset.descricao, card.dataset.video);
      });
    });
  }

  function filtrarFilmes() {
    const categoriaSelecionada = document.getElementById('categoria').value;
    const filmes = document.querySelectorAll('.filme');

    filmes.forEach(filme => {
      const generos = filme.getAttribute('data-genero') || '';
      filme.style.display = (categoriaSelecionada === 'todas' || generos.includes(categoriaSelecionada)) ? 'block' : 'none';
    });
  }
  window.filtrarFilmes = filtrarFilmes;

  function setupPesquisa() {
    const campoPesquisa = document.getElementById('pesquisa');
    campoPesquisa.addEventListener('input', () => {
      const termo = campoPesquisa.value.toLowerCase();
      const filmes = document.querySelectorAll('.filme');

      filmes.forEach(filme => {
        const titulo = filme.dataset.titulo.toLowerCase();
        const descricao = filme.dataset.descricao.toLowerCase();
        filme.style.display = (titulo.includes(termo) || descricao.includes(termo)) ? 'block' : 'none';
      });
    });
  }

  function embaralharCatalogo() {
    const catalogos = document.querySelectorAll(".catalogo");
    catalogos.forEach(catalogo => {
      const filmes = Array.from(catalogo.querySelectorAll(".filme"));
      for (let i = filmes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filmes[i], filmes[j]] = [filmes[j], filmes[i]];
      }
      catalogo.innerHTML = "";
      filmes.forEach(filme => catalogo.appendChild(filme));
    });
  }

  function setupHeaderScroll() {
    let prevScrollPos = window.scrollY;
    const header = document.querySelector("header");

    window.addEventListener('scroll', () => {
      const currentScrollPos = window.scrollY;
      if (prevScrollPos > currentScrollPos) {
        header.style.top = "0";
      } else {
        header.style.top = "-100px";
      }
      prevScrollPos = currentScrollPos;
    });
  }

  async function carregarFilmesAdicionados() {
    try {
      const result = await db.allDocs({ include_docs: true });
      const catalogo = document.querySelector('.catalogo');

      result.rows.forEach(row => {
        const filme = row.doc;

        const divFilme = document.createElement('div');
        divFilme.classList.add('filme');
        divFilme.style.cursor = 'pointer';
        divFilme.setAttribute('data-genero', filme.genero);
        divFilme.setAttribute('data-classificacao', filme.classificacao);
        divFilme.setAttribute('data-titulo', filme.titulo);
        divFilme.setAttribute('data-descricao', `${filme.descricao}<br /><br /><strong>Classificação:</strong> ${filme.classificacao}<br /><strong>Duração:</strong> ${filme.duracao}<br /><strong>Gênero:</strong> ${filme.genero}<br /><strong>Ano:</strong> ${filme.ano}`);
        divFilme.setAttribute('data-video', filme.trailer);

        divFilme.innerHTML = `
          <img src="${filme.imagem}" alt="${filme.titulo}" />
          <h3>${filme.titulo}</h3>
        `;

        divFilme.addEventListener('click', () => {
          openModal(
            divFilme.getAttribute('data-titulo'),
            divFilme.getAttribute('data-descricao'),
            divFilme.getAttribute('data-video')
          );
        });

        catalogo.appendChild(divFilme);
      });
    } catch (error) {
      console.error('Erro ao carregar filmes:', error);
    }
  }

  (async function iniciar() {
    setupFilmesFixos();
    setupPesquisa();
    setupHeaderScroll();
    await carregarFilmesAdicionados();
    embaralharCatalogo();
  })();
});