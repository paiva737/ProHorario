const User = require('../models/User');

exports.getProfile = async (request, reply) => {
  try {
    const userId = request.usuario.id;
    const usuario = await User.findById(userId).select('-senha');
    if (!usuario) return reply.status(404).send({ erro: 'Usuário não encontrado' });

    reply.send({ usuario });
  } catch (err) {
    reply.status(500).send({ erro: 'Erro ao buscar usuário' });
  }
};
