const controller = require('../controllers/agendamentoController')
const jwt = require('jsonwebtoken')

module.exports = async function (fastify, opts) {
  async function authInline(request, reply) {
    const auth = request.headers.authorization || ''
    if (!auth.startsWith('Bearer ')) {
      return reply.code(401).send({ erro: 'Authorization ausente/ inválido' })
    }
    try {
      const token = auth.slice(7).trim()
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      request.user = decoded
      request.usuario = decoded
    } catch (err) {
      return reply.code(401).send({ erro: 'JWT inválido' })
    }
  }

  fastify.post('/agendamentos', { preHandler: authInline }, controller.criarAgendamento)
  fastify.delete('/agendamentos/:id', { preHandler: authInline }, controller.cancelarAgendamento)

  fastify.get('/public/:linkPersonalizado/agendamentos', controller.listarAgendamentos)
  fastify.post('/public/:linkPersonalizado/agendamentos', controller.agendarPublico)
  fastify.get('/public/:linkPersonalizado/horarios-livres', controller.horariosLivres)
  fastify.get('/priv/agendamentos/mine', { preHandler: authInline }, controller.meusAgendamentos)
  fastify.post('/priv/agendamentos/bulk', { preHandler: authInline }, controller.criarAgendamentosEmLote)
  fastify.post('/priv/agendamentos/generate', { preHandler: authInline }, controller.gerarSlotsSequenciais)
}
