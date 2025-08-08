const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function autenticar(request, reply) {
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    return reply.status(401).send({ erro: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return reply.status(401).send({ erro: 'Usuário não encontrado' });
    }

    request.usuario = usuario;
  } catch (err) {
    return reply.status(401).send({ erro: 'Token inválido ou expirado' });
  }
};
