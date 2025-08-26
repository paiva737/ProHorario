<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-900">Horários Disponíveis</h2>
      <span class="text-xs text-gray-500">{{ disponiveis.length }} opções</span>
    </div>

    <ul class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <li
        v-for="slot in disponiveis"
        :key="slot.start"
        class="group p-3 rounded-xl border relative overflow-hidden
               flex items-center justify-between transition
               hover:shadow-md hover:border-blue-300"
        :class="selected && selected.start === slot.start
          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
          : 'bg-gray-50 border-gray-200'"
      >
        <span class="font-medium text-gray-900">
          {{ hhmm(slot.start) }} – {{ hhmm(slot.end) }}
        </span>
        <button
          class="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium
                 bg-blue-600 text-white hover:bg-blue-700
                 disabled:opacity-60 disabled:cursor-not-allowed
                 transition"
          :disabled="disabled"
          @click="$emit('select', slot)"
        >
          Selecionar
        </button>
      </li>

      <li v-if="disponiveis.length === 0" class="text-center text-gray-500 col-span-full py-8">
        Nenhum horário disponível nessa data.
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  date: { type: String, required: true },                 // YYYY-MM-DD (local)
  ocupados: { type: Array, default: () => [] },           // [{ start: ISO-UTC, end: ISO-UTC }]
  startHHMM: { type: String, default: '09:00' },
  endHHMM: { type: String, default: '17:00' },
  stepMin: { type: Number, default: 30 },
  selected: { type: Object, default: null },
  disabled: { type: Boolean, default: false }
})
defineEmits(['select'])

const hoje = new Date().toISOString().slice(0,10)

function localDate(dateYYYYMMDD, timeHHMM) {
  const [Y, M, D] = String(dateYYYYMMDD).split('-').map(Number)
  const [h, m] = String(timeHHMM).split(':').map(Number)
  return new Date(Y, M - 1, D, h, m, 0, 0)
}
function toUtcIso(dateObj) {
  return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
}
function hhmm(isoUtc) {
  const d = new Date(isoUtc)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}
function gerarGrade(dateYYYYMMDD, startHHMM, endHHMM, stepMin){
  const out = []
  let cursorLocal = localDate(dateYYYYMMDD, startHHMM)
  const limiteLocal = localDate(dateYYYYMMDD, endHHMM)
  while (cursorLocal.getTime() + stepMin*60000 <= limiteLocal.getTime()){
    const sLocal = new Date(cursorLocal)
    const eLocal = new Date(cursorLocal.getTime() + stepMin*60000)
    out.push({ start: toUtcIso(sLocal), end: toUtcIso(eLocal) })
    cursorLocal = eLocal
  }
  return out
}
function calcularDisponiveis(grade, ocupadosArr){
  const overlap = (aS,aE,bS,bE) => new Date(aS) < new Date(bE) && new Date(aE) > new Date(bS)
  return grade.filter(g => !ocupadosArr.some(o => overlap(g.start,g.end,o.start,o.end)))
}
function slotEhFuturoLocal(isoStart){
  const agora = new Date()
  const inicio = new Date(isoStart)
  return inicio.getTime() > agora.getTime()
}

const disponiveis = computed(() => {
  const grade = gerarGrade(props.date, props.startHHMM, props.endHHMM, props.stepMin)
  const base = calcularDisponiveis(grade, props.ocupados || [])
  if (props.date === hoje) return base.filter(s => slotEhFuturoLocal(s.start))
  return base
})
</script>
