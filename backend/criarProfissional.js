
require('dotenv').config();
const mongoose = require('mongoose');
const Profissional = require('./models/Profissional');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const jaExiste = await Profissional.findOne({ link: 'novousuario' });
    if (jaExiste) {
      console.log('✅ Profissional já existe.');
    } else {
      await Profissional.create({
  nome: 'Novo Usuário',
  link: 'novousuario',
  email: 'teste@prohorario.com',
  senha: 'senha123' 
});

      console.log('✅ Profissional criado com sucesso.');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
  });
