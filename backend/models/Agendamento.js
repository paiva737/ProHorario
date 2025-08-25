const mongoose = require('mongoose')

const AgendamentoSchema = new mongoose.Schema({
  profissional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  notas: {
    type: String,
    default: ''
  },
  start: {
    type: Date,
    required: true,
    index: true
  },
  end: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled'],
    default: 'scheduled',
    index: true
  }
}, {
  timestamps: true
})

AgendamentoSchema.index({ profissional: 1, start: 1 }, { unique: true })

module.exports = mongoose.model('Agendamento', AgendamentoSchema)
