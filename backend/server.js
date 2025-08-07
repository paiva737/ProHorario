require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const fastifyCors = require('@fastify/cors'); // Corrigido: usando require ao invés de import

mongoose.connect(process.env.MONGO_URI).then(() => {
  fastify.log.info('📦 Conectado ao MongoDB');
}).catch(err => {
  fastify.log.error(`❌ Erro ao conectar ao MongoDB:\n${err.message}`);
});

fastify.register(fastifyCors, {
  origin: 'http://localhost:5174',
  credentials: true
});

fastify.get('/', async (request, reply) => {
  return { mensagem: 'Servidor ProHorario rodando!' };
});

fastify.register(require('./routes/auth'));

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
