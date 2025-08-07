const Agendamento = require('../models/Agendamento');
const User = require('../models/User');

exports.criarAgendamento = async (request, reply) => {
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
};

exports.cancelarAgendamento = async (request, reply) => {
  const { id } = request.params;

  try {
    const agendamento = await Agendamento.findById(id);

    if (!agendamento) {
      return reply.status(404).send({ erro: 'Agendamento não encontrado' });
    }

    if (agendamento.profissional.toString() !== request.usuario.id) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }

    await agendamento.deleteOne();

    reply.send({ mensagem: 'Agendamento cancelado com sucesso' });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao cancelar agendamento' });
  }
};

exports.listarAgendamentos = async (request, reply) => {
  const { linkPersonalizado } = request.params;

  try {
    const profissional = await User.findOne({ linkPersonalizado });

    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({ profissional: profissional._id }).sort({ data: 1 });

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
};

exports.agendarPublico = async (request, reply) => {
  const { linkPersonalizado } = request.params;
  const { data, nomeCliente, emailCliente } = request.body;

  try {
    const profissional = await User.findOne({ linkPersonalizado });

    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

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
};

exports.horariosLivres = async (request, reply) => {
  const { linkPersonalizado } = request.params;

  try {
    const profissional = await User.findOne({ linkPersonalizado });

    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({
      profissional: profissional._id,
      data: { $gte: new Date() }
    }).sort({ data: 1 });

    const horariosOcupados = agendamentos.map(item => item.data.toISOString());

    reply.send({
      profissional: {
        nome: profissional.nome,
        link: profissional.linkPersonalizado
      },
      horariosOcupados
    });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao buscar agendamentos' });
  }
};
