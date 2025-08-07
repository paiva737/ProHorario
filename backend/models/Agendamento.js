const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema({
  data: {
    type: Date,
    required: true
  },
  nomeCliente: {
    type: String,
    required: true
  },
  emailCliente: {
    type: String,
    required: true
  },
  confirmado: {
    type: Boolean,
    default: true
  },
  profissional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agendamento', AgendamentoSchema);
