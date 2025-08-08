const {
  criarAgendamento,
  cancelarAgendamento,
  listarAgendamentos
} = require('../controllers/agendamentoController');

const autenticar = require('../middlewares/autenticar');

module.exports = async function (fastify, opts) {
  fastify.addHook('preHandler', autenticar);

  fastify.post('/agendamentos', criarAgendamento); 
  fastify.delete('/agendamentos/:id', cancelarAgendamento); 
  fastify.get('/agendamentos/:linkPersonalizado', listarAgendamentos); 
};
