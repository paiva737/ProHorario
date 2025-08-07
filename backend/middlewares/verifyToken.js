const jwt = require('jsonwebtoken');

async function verifyToken(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Anexa o usuário ao request
    request.usuario = decoded;
  } catch (err) {
    return reply.status(401).send({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = verifyToken;
