<template>
  <div class="mt-6 border-t pt-6">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-900">Confirme seu agendamento</h2>
      <span class="text-sm text-gray-500">{{ hhmm(selected.start) }} – {{ hhmm(selected.end) }} · {{ date }}</span>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <label class="block">
        <span class="text-sm text-gray-700">Seu nome</span>
        <input v-model.trim="nome" class="mt-1 w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
               placeholder="Ex.: João da Silva" />
      </label>

      <label class="block">
        <span class="text-sm text-gray-700">Seu e-mail</span>
        <input v-model.trim="email" type="email" class="mt-1 w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm
                                                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
               placeholder="voce@email.com" />
      </label>

      <label class="block">
        <span class="text-sm text-gray-700">Notas (opcional)</span>
        <textarea v-model.trim="notas" rows="3" class="mt-1 w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm
                                                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Compartilhe informações úteis para a consulta"></textarea>
      </label>
    </div>

    <div class="flex gap-2 mt-4 items-center">
      <button
        class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>

      <button
        class="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow-sm
               hover:bg-green-700 active:bg-green-700 transition
               disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
        :disabled="loading"
        @click="onSubmit"
      >
        <span v-if="loading" class="inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
        <span>{{ loading ? 'Agendando…' : 'Confirmar' }}</span>
      </button>

      <span v-if="success" class="text-green-600 text-sm">Agendado com sucesso!</span>
      <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  selected: { type: Object, required: true }, // { start, end } ISO-UTC
  date: { type: String, required: true },     // YYYY-MM-DD
  loading: { type: Boolean, default: false },
  success: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
const emit = defineEmits(['submit', 'cancel'])

const nome = ref('')
const email = ref('')
const notas = ref('')

watch(() => props.selected, () => {
  nome.value = ''
  email.value = ''
  notas.value = ''
})

function hhmm(isoUtc) {
  const d = new Date(isoUtc)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}
function emailValido(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
}
function onSubmit(){
  if(!nome.value.trim()) return emit('submit', { error: 'Informe seu nome' })
  if(!emailValido(email.value)) return emit('submit', { error: 'Informe um e-mail válido' })
  emit('submit', {
    nome: nome.value.trim(),
    email: email.value.trim(),
    notas: notas.value?.trim() || undefined
  })
}
</script>
