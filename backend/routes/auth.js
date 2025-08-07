const bcrypt = require('bcrypt');
const User = require('../models/User');

async function authRoutes(fastify, options) {
  fastify.post('/register', async (request, reply) => {
    const { nome, email, senha, linkPersonalizado } = request.body;

    try {
      const existeEmail = await User.findOne({ email });
      const existeLink = await User.findOne({ linkPersonalizado });

      if (existeEmail) {
        return reply.status(400).send({ erro: 'E-mail já cadastrado' });
      }

      if (existeLink) {
        return reply.status(400).send({ erro: 'Link personalizado já em uso' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = new User({
        nome,
        email,
        senha: senhaHash,
        linkPersonalizado
      });

      await novoUsuario.save();

      reply.status(201).send({ mensagem: 'Usuário criado com sucesso' });
    } catch (err) {
      reply.status(500).send({ erro: 'Erro ao criar usuário' });
    }
  });
}

module.exports = authRoutes;
