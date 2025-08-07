// server.js
require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  fastify.log.info('📦 Conectado ao MongoDB');
}).catch(err => {
  fastify.log.error('Erro ao conectar ao MongoDB:', err);
});

// Rota de teste
fastify.get('/', async (request, reply) => {
  return { mensagem: 'Servidor ProHorario rodando!' };
});

// Start do servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`🚀 Servidor rodando em http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
