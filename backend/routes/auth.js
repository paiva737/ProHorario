const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

  // Rota de login
  fastify.post('/login', async (request, reply) => {
    const { email, senha } = request.body;

    try {
      const usuario = await User.findOne({ email });

      if (!usuario) {
        return reply.status(401).send({ erro: 'E-mail não encontrado' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return reply.status(401).send({ erro: 'Senha incorreta' });
      }

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
  });
  const verifyToken = require('../middlewares/verifyToken');
  
  fastify.get('/me', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const userId = request.usuario.id;
  
      const usuario = await User.findById(userId).select('-senha'); // sem a senha
  
      if (!usuario) {
        return reply.status(404).send({ erro: 'Usuário não encontrado' });
      }
  
      reply.send({ usuario });
    } catch (err) {
      reply.status(500).send({ erro: 'Erro ao buscar usuário' });
    }
  });

  const Agendamento = require('../models/Agendamento');



fastify.post('/agendamentos', { preHandler: verifyToken }, async (request, reply) => {
  const { data, nomeCliente, emailCliente } = request.body;

  try {
    const novoAgendamento = new Agendamento({
      data,
      nomeCliente,
      emailCliente,
      profissional: request.usuario.id
    });

    await novoAgendamento.save();

    reply.status(201).send({ mensagem: 'Agendamento criado com sucesso', agendamento: novoAgendamento });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao criar agendamento' });
  }
});
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

  // Rota de login
  fastify.post('/login', async (request, reply) => {
    const { email, senha } = request.body;

    try {
      const usuario = await User.findOne({ email });

      if (!usuario) {
        return reply.status(401).send({ erro: 'E-mail não encontrado' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return reply.status(401).send({ erro: 'Senha incorreta' });
      }

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
  });
  const verifyToken = require('../middlewares/verifyToken');
  
  fastify.get('/me', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const userId = request.usuario.id;
  
      const usuario = await User.findById(userId).select('-senha'); // sem a senha
  
      if (!usuario) {
        return reply.status(404).send({ erro: 'Usuário não encontrado' });
      }
  
      reply.send({ usuario });
    } catch (err) {
      reply.status(500).send({ erro: 'Erro ao buscar usuário' });
    }
  });

  const Agendamento = require('../models/Agendamento');



fastify.post('/agendamentos', { preHandler: verifyToken }, async (request, reply) => {
  const { data, nomeCliente, emailCliente } = request.body;

  try {
    const novoAgendamento = new Agendamento({
      data,
      nomeCliente,
      emailCliente,
      profissional: request.usuario.id
    });

    await novoAgendamento.save();

    reply.status(201).send({ mensagem: 'Agendamento criado com sucesso', agendamento: novoAgendamento });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao criar agendamento' });
  }
});

}

fastify.get('/:linkPersonalizado/disponiveis', async (request, reply) => {
  const { linkPersonalizado } = request.params;

  try {
    const profissional = await User.findOne({ linkPersonalizado });

    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({ profissional: profissional._id })
      .sort({ data: 1 });

    reply.send({
      profissional: {
        nome: profissional.nome,
        link: profissional.linkPersonalizado
      },
      agendamentos
    });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao buscar agendamentos' });
  }
});

fastify.post('/:linkPersonalizado/agendar', async (request, reply) => {
  const { linkPersonalizado } = request.params;
  const { data, nomeCliente, emailCliente } = request.body;

  try {
    const profissional = await User.findOne({ linkPersonalizado });

    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    // Verificar se já existe um agendamento nesse mesmo horário
    const jaExiste = await Agendamento.findOne({
      profissional: profissional._id,
      data
    });

    if (jaExiste) {
      return reply.status(400).send({ erro: 'Horário já agendado' });
    }

    const novoAgendamento = new Agendamento({
      data,
      nomeCliente,
      emailCliente,
      profissional: profissional._id
    });

    await novoAgendamento.save();

    reply.status(201).send({ mensagem: 'Agendamento realizado com sucesso', agendamento: novoAgendamento });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao agendar horário' });
  }
});


}



module.exports = authRoutes;
