const User = require('../models/User');
const Agendamento = require('../models/Agendamento');

module.exports = async function (fastify, opts) {
  
  fastify.get('/:linkPersonalizado/disponiveis', async (request, reply) => {
    const { linkPersonalizado } = request.params;

    const profissional = await User.findOne({ linkPersonalizado });
    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({ profissional: profissional._id });

    return { profissional, agendamentos };
  });

  fastify.get('/:linkPersonalizado/disponiveis-livres', async (request, reply) => {
    const { linkPersonalizado } = request.params;

    const profissional = await User.findOne({ linkPersonalizado });
    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({
      profissional: profissional._id,
      data: { $gte: new Date() }
    });

    const horariosOcupados = agendamentos.map(a => a.data.toISOString());

    return { profissional, horariosOcupados };
  });

  fastify.post('/:linkPersonalizado/agendar', async (request, reply) => {
    const { linkPersonalizado } = request.params;
    const { data, nomeCliente, emailCliente } = request.body;

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

    const agendamento = new Agendamento({
      data,
      nomeCliente,
      emailCliente,
      confirmado: true,
      profissional: profissional._id
    });

    await agendamento.save();

    return { mensagem: 'Agendamento criado com sucesso', agendamento };
  });
};
