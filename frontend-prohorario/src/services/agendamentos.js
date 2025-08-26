import api from './api'

export async function listarHorariosOcupados(linkPersonalizado, dateISO) {
  const { data } = await api.get(`/public/${encodeURIComponent(linkPersonalizado)}/horarios-livres`, { params: { date: dateISO } })
  return data
}

export async function agendarPublico(linkPersonalizado, { start, end, nomeCliente, emailCliente, notas }) {
  const { data } = await api.post(`/public/${encodeURIComponent(linkPersonalizado)}/agendamentos`, { start, end, nomeCliente, emailCliente, notas })
  return data
}
