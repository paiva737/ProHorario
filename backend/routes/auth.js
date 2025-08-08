const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const agendamentoController = require('../controllers/agendamentoController');
const verifyToken = require('../middlewares/verifyToken');

async function authRoutes(fastify, options) {
 
  fastify.post('/register', authController.register);
  fastify.post('/login', authController.login);

  
  fastify.get('/me', async (req, res) => {
  return { ok: true }
})

  

}

module.exports = authRoutes;
