const db = new PouchDB('mathflix-users');

document.querySelector('.form-wrapper form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.toLowerCase();
  const email = document.getElementById('email').value.toLowerCase();
  const password = document.getElementById('password').value;

  try {
    const existingUser = await db.get('usuario_' + email).catch(() => null);

    if (existingUser) {
      alert('E-mail já cadastrado!');
      return;
    }

    const user = {
      _id: 'usuario_' + email,
      nome,
      email,
      password, // Atenção: para produção, nunca salve senha em texto puro!
      admin: false
    };

    await db.put(user);
    alert('Cadastro realizado com sucesso!');
    window.location.href = '../Html/login.html';

  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    alert('Erro no cadastro. Tente novamente.');
  }
});