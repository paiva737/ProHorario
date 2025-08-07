const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  linkPersonalizado: {
    type: String,
    required: true,
    unique: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
