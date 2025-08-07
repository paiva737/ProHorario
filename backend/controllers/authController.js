const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (request, reply) => {
  const { nome, email, senha, linkPersonalizado } = request.body;

  try {
    const existeEmail = await User.findOne({ email });
    const existeLink = await User.findOne({ linkPersonalizado });

    if (existeEmail) return reply.status(400).send({ erro: 'E-mail já cadastrado' });
    if (existeLink) return reply.status(400).send({ erro: 'Link personalizado já em uso' });

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({ nome, email, senha: senhaHash, linkPersonalizado });
    await novoUsuario.save();

    reply.status(201).send({ mensagem: 'Usuário criado com sucesso' });
  } catch (err) {
     console.log(err);
    reply.status(500).send({ erro: 'Erro ao criar usuário' });
  }
};

exports.login = async (request, reply) => {
  const { email, senha } = request.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) return reply.status(401).send({ erro: 'E-mail não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return reply.status(401).send({ erro: 'Senha incorreta' });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    reply.send({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        linkPersonalizado: usuario.linkPersonalizado
      }
    });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao fazer login' });
  }
};
