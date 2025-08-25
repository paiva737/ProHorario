require('dotenv').config()
const fastify = require('fastify')({ logger: true })
const mongoose = require('mongoose')
const fastifyCors = require('@fastify/cors')
const fastifyJWT = require('@fastify/jwt')

fastify.register(fastifyCors, {
  origin: ['http://localhost:5174','http://localhost:5173'],
  credentials: true
})

fastify.register(fastifyJWT, { secret: process.env.JWT_SECRET })
fastify.register(require('./plugins/auth'))
fastify.register(require('./routes/auth'))
fastify.register(require('./routes/agendamentosPrivado'), { prefix: '/priv' })
fastify.register(require('./routes/agendamentos'))

mongoose.connect(process.env.MONGO_URI).then(() => {
  fastify.log.info('📦 Conectado ao MongoDB')
}).catch(err => {
  fastify.log.error(`❌ Erro ao conectar ao MongoDB:\n${err.message}`)
})

fastify.get('/', async () => {
  return { mensagem: 'Servidor ProHorario rodando!' }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    fastify.log.info('🚀 Servidor rodando em http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}


start()
