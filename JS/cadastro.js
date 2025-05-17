const dbUsers = new PouchDB('mathflix-users');

// Função para gerar novo ID sequencial
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

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (!nome || !email || !password) {
    alert('Preencha todos os campos!');
    return;
  }

  try {
    // Verifica se email já está cadastrado
    const allUsers = await dbUsers.allDocs({ include_docs: true });
    const emailExiste = allUsers.rows.some(row => row.doc.email === email);
    if (emailExiste) {
      alert('E-mail já cadastrado!');
      return;
    }

    // Gera novo ID sequencial
    const novoId = await gerarNovoIdUsuario();

    const user = {
      _id: novoId,
      nome,
      email,
      password,
      admin: false,
    };

    await dbUsers.put(user);
    alert('Cadastro realizado com sucesso!');
    window.location.href = '../Html/login.html';

  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    alert('Erro no cadastro. Tente novamente.');
  }
});
