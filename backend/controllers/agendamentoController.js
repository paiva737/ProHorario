const Agendamento = require('../models/Agendamento')
const User = require('../models/User')
const mongoose = require('mongoose')

function toDate(v){ return new Date(v) }

function getUserId(req){
  return (req.usuario && req.usuario.id) || (req.user && req.user.id) || null
}

async function existeConflito(profissionalId, start, end) {
  const s = toDate(start)
  const e = toDate(end)
  return await Agendamento.exists({
    profissional: new mongoose.Types.ObjectId(profissionalId),
    status: 'scheduled',
    $or: [{ start: { $lt: e }, end: { $gt: s } }]
  })
}

exports.criarAgendamento = async (request, reply) => {
  try {
    const userId = getUserId(request)
    if(!userId) return reply.status(401).send({ erro: 'não autenticado' })
    const { start, end, nomeCliente, emailCliente, notas } = request.body
    if(!start || !end || !nomeCliente || !emailCliente) return reply.status(400).send({ erro: 'dados obrigatórios ausentes' })
    const conflito = await existeConflito(userId, start, end)
    if(conflito) return reply.status(409).send({ erro: 'horário em conflito' })
    const novo = new Agendamento({
      profissional: userId,
      nomeCliente,
      emailCliente,
      notas: notas || '',
      start: toDate(start),
      end: toDate(end),
      status: 'scheduled'
    })
    await novo.save()
    return reply.status(201).send({ mensagem: 'Agendamento criado com sucesso', agendamento: novo })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}

exports.cancelarAgendamento = async (request, reply) => {
  try {
    const userId = getUserId(request)
    if(!userId) return reply.status(401).send({ erro: 'não autenticado' })
    const { id } = request.params
    if(!mongoose.isValidObjectId(id)) return reply.status(400).send({ erro: 'id inválido' })
    const agendamento = await Agendamento.findOne({ _id: id, profissional: userId })
    if (!agendamento) return reply.status(404).send({ erro: 'Agendamento não encontrado' })
    agendamento.status = 'cancelled'
    await agendamento.save()
    return reply.send({ mensagem: 'Agendamento cancelado com sucesso' })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}

exports.listarAgendamentos = async (request, reply) => {
  try {
    const { linkPersonalizado } = request.params
    const { from, to, status } = request.query
    const profissional = await User.findOne({ linkPersonalizado })
    if (!profissional) return reply.status(404).send({ erro: 'Profissional não encontrado' })
    const q = { profissional: profissional._id }
    if (from || to) {
      q.start = {}
      if (from) q.start.$gte = toDate(from)
      if (to) q.start.$lte = toDate(to)
    }
    if (status) q.status = status
    const agendamentos = await Agendamento.find(q).sort({ start: 1 })
    return reply.send({ profissional: { nome: profissional.nome, link: profissional.linkPersonalizado }, agendamentos })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}

exports.agendarPublico = async (request, reply) => {
  try {
    const { linkPersonalizado } = request.params
    const { start, end, nomeCliente, emailCliente, notas } = request.body
    if(!start || !end || !nomeCliente || !emailCliente) return reply.status(400).send({ erro: 'dados obrigatórios ausentes' })
    const profissional = await User.findOne({ linkPersonalizado })
    if (!profissional) return reply.status(404).send({ erro: 'Profissional não encontrado' })
    const conflito = await existeConflito(profissional._id, start, end)
    if(conflito) return reply.status(409).send({ erro: 'horário indisponível' })
    const novo = new Agendamento({
      profissional: profissional._id,
      nomeCliente,
      emailCliente,
      notas: notas || '',
      start: toDate(start),
      end: toDate(end),
      status: 'scheduled'
    })
    await novo.save()
    return reply.status(201).send({ mensagem: 'Agendamento realizado com sucesso', agendamento: novo })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}

exports.horariosLivres = async (request, reply) => {
  try {
    const { linkPersonalizado } = request.params
    const { date } = request.query
    const profissional = await User.findOne({ linkPersonalizado })
    if (!profissional) return reply.status(404).send({ erro: 'Profissional não encontrado' })
    const dayStart = date ? new Date(date + 'T00:00:00.000Z') : new Date()
    const dayEnd = date ? new Date(date + 'T23:59:59.999Z') : null
    const q = { profissional: profissional._id, status: 'scheduled' }
    if (dayEnd) q.start = { $gte: dayStart, $lte: dayEnd }
    else q.start = { $gte: dayStart }
    const ocupados = await Agendamento.find(q).sort({ start: 1 }).lean()
    const horariosOcupados = ocupados.map(i => ({ start: i.start, end: i.end }))
    return reply.send({ profissional: { nome: profissional.nome, link: profissional.linkPersonalizado }, horariosOcupados })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}
exports.meusAgendamentos = async (request, reply) => {
  try {
    const userId = (request.usuario && request.usuario.id) || (request.user && request.user.id)
    if(!userId) return reply.status(401).send({ erro: 'não autenticado' })
    const { from, to, status } = request.query
    const q = { profissional: userId }
    if (from || to) {
      q.start = {}
      if (from) q.start.$gte = new Date(from)
      if (to) q.start.$lte = new Date(to)
    }
    if (status) q.status = status
    const list = await Agendamento.find(q).sort({ start: 1 }).lean()
    return reply.send(list)
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}

exports.criarAgendamentosEmLote = async (request, reply) => {
  try {
    const userId = (request.usuario && request.usuario.id) || (request.user && request.user.id)
    if(!userId) return reply.status(401).send({ erro: 'não autenticado' })

    const { itens } = request.body
    if(!Array.isArray(itens) || itens.length === 0){
      return reply.status(400).send({ erro: 'itens deve ser um array com pelo menos 1 elemento' })
    }

    for (const it of itens) {
      if(!it || !it.start || !it.end || !it.nomeCliente || !it.emailCliente){
        return reply.status(400).send({ erro: 'cada item precisa de start, end, nomeCliente, emailCliente' })
      }
    }

    const norm = itens.map(it => ({
      start: new Date(it.start),
      end: new Date(it.end),
      nomeCliente: it.nomeCliente,
      emailCliente: it.emailCliente,
      notas: it.notas || ''
    })).sort((a,b) => a.start - b.start)

    const loteInicio = norm[0].start
    const loteFim = norm.reduce((acc, it) => it.end > acc ? it.end : acc, norm[0].end)
    const existentes = await Agendamento.find({
      profissional: userId,
      status: 'scheduled',
      $or: [
        { start: { $lt: loteFim }, end: { $gt: loteInicio } }
      ]
    }).select('start end').lean()

    function overlap(aStart, aEnd, bStart, bEnd){
      return aStart < bEnd && aEnd > bStart
    }

    const conflitos = []
    const aInserir = []

    for (const it of norm) {
      const conflitaComExistente = existentes.some(e => overlap(it.start, it.end, new Date(e.start), new Date(e.end)))
      const conflitaComInseridos = aInserir.some(e => overlap(it.start, it.end, e.start, e.end))
      if (conflitaComExistente || conflitaComInseridos) {
        conflitos.push({ start: it.start, end: it.end, motivo: conflitaComExistente ? 'db' : 'lote' })
      } else {
        aInserir.push({
          profissional: userId,
          nomeCliente: it.nomeCliente,
          emailCliente: it.emailCliente,
          notas: it.notas,
          start: it.start,
          end: it.end,
          status: 'scheduled'
        })
      }
    }

    let inseridos = 0
    if (aInserir.length > 0) {
      const res = await Agendamento.insertMany(aInserir, { ordered: true })
      inseridos = res.length
    }

    return reply.status(201).send({ inseridos, conflitos })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}
exports.gerarSlotsSequenciais = async (request, reply) => {
  try {
    const userId = (request.usuario && request.usuario.id) || (request.user && request.user.id)
    if(!userId) return reply.status(401).send({ erro: 'não autenticado' })

    const { date, from, to, durationMinutes, prefix } = request.body
    if(!date || !from || !to || !durationMinutes) {
      return reply.status(400).send({ erro: 'Informe date (YYYY-MM-DD), from (HH:MM), to (HH:MM) e durationMinutes (número)' })
    }

    const startDay = new Date(`${date}T${from}:00.000Z`)
    const endDay   = new Date(`${date}T${to}:00.000Z`)
    const step = parseInt(durationMinutes, 10)
    if(isNaN(step) || step <= 0) return reply.status(400).send({ erro: 'durationMinutes inválido' })
    if(!(startDay < endDay)) return reply.status(400).send({ erro: 'intervalo inválido' })


    const base = (prefix || 'Slot').toString()
    const itens = []
    let cursor = new Date(startDay)
    let idx = 1
    while (cursor.getTime() + step*60000 <= endDay.getTime()) {
      const s = new Date(cursor)
      const e = new Date(cursor.getTime() + step*60000)
      itens.push({
        start: s, end: e,
        nomeCliente: `${base} ${idx}`,
        emailCliente: `${base.toLowerCase().replace(/\s+/g,'')}${idx}@auto.local`,
        notas: 'gerado automaticamente'
      })
      idx++
      cursor = e
    }

    if(itens.length === 0) return reply.status(400).send({ erro: 'nenhum slot gerado para o intervalo' })

    
    const loteInicio = itens[0].start
    const loteFim = itens[itens.length - 1].end
    const existentes = await Agendamento.find({
      profissional: userId,
      status: 'scheduled',
      $or: [{ start: { $lt: loteFim }, end: { $gt: loteInicio } }]
    }).select('start end').lean()

    const overlap = (aS, aE, bS, bE) => aS < bE && aE > bS

    const aInserir = []
    const conflitos = []
    for (const it of itens) {
      const hitDb = existentes.some(e => overlap(it.start, it.end, new Date(e.start), new Date(e.end)))
      const hitLote = aInserir.some(e => overlap(it.start, it.end, e.start, e.end))
      if (hitDb || hitLote) {
        conflitos.push({ start: it.start, end: it.end, motivo: hitDb ? 'db' : 'lote' })
      } else {
        aInserir.push({
          profissional: userId,
          nomeCliente: it.nomeCliente,
          emailCliente: it.emailCliente,
          notas: it.notas,
          start: it.start,
          end: it.end,
          status: 'scheduled'
        })
      }
    }

    let inseridos = 0
    if (aInserir.length > 0) {
      const res = await Agendamento.insertMany(aInserir, { ordered: true })
      inseridos = res.length
    }

    return reply.status(201).send({ inseridos, conflitos })
  } catch (err) {
    return reply.status(500).send({ erro: String(err && err.message ? err.message : err) })
  }
}


