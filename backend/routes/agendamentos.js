const Profissional = require('../models/Profissional');
const Agendamento = require('../models/Agendamento');

module.exports = async function (fastify, opts) {
  
  fastify.get('/:linkPersonalizado/disponiveis', async (request, reply) => {
    const { linkPersonalizado } = request.params;

    const profissional = await Profissional.findOne({ link: linkPersonalizado });
    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({ profissional: profissional._id });

    return { profissional, agendamentos };
  });


  fastify.get('/:linkPersonalizado/disponiveis-livres', async (request, reply) => {
    const { linkPersonalizado } = request.params;

    const profissional = await Profissional.findOne({ link: linkPersonalizado });
    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await Agendamento.find({ profissional: profissional._id });

    const horariosOcupados = agendamentos.map(a => a.data.toISOString());

    return { profissional, horariosOcupados };
  });


  fastify.post('/agendamentos', async (request, reply) => {
    const { data, nomeCliente, emailCliente } = request.body;

    const profissional = await Profissional.findOne(); 

    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
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

  
  fastify.post('/:linkPersonalizado/agendar', async (request, reply) => {
    const { linkPersonalizado } = request.params;
    const { data, nomeCliente, emailCliente } = request.body;

    const profissional = await Profissional.findOne({ link: linkPersonalizado });
    if (!profissional) {
      return reply.status(404).send({ erro: 'Profissional não encontrado' });
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
