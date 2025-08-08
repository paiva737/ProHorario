const mongoose = require('mongoose');

const ProfissionalSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  link: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profissional', ProfissionalSchema);
