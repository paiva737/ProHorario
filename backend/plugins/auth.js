const jwt = require('jsonwebtoken')

module.exports = async function (fastify, opts) {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const auth = request.headers.authorization || ''
      if (!auth.startsWith('Bearer ')) {
        return reply.code(401).send({ erro: 'Authorization ausente/ inválido' })
      }
      const token = auth.slice('Bearer '.length).trim()
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      request.user = decoded
      request.usuario = decoded
      if (!request.usuario || !request.usuario.id) {
        return reply.code(401).send({ erro: 'JWT válido, mas payload sem id', payload: decoded || null })
      }
    } catch (err) {
      return reply.code(401).send({ erro: 'JWT inválido', detalhe: String(err && err.message ? err.message : err) })
    }
  })
}
