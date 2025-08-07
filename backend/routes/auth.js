const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const agendamentoController = require('../controllers/agendamentoController');
const verifyToken = require('../middlewares/verifyToken');

async function authRoutes(fastify, options) {
 
  fastify.post('/register', authController.register);
  fastify.post('/login', authController.login);

  
  fastify.get('/me', { preHandler: verifyToken }, userController.getMe);

 
  fastify.post('/agendamentos', { preHandler: verifyToken }, agendamentoController.criarAgendamento);
  fastify.delete('/agendamentos/:id', { preHandler: verifyToken }, agendamentoController.cancelarAgendamento);

  fastify.get('/:linkPersonalizado/disponiveis', agendamentoController.listarAgendamentos);
  fastify.post('/:linkPersonalizado/agendar', agendamentoController.agendarPublico);
  fastify.get('/:linkPersonalizado/disponiveis-livres', agendamentoController.horariosLivres);
}

module.exports = authRoutes;
