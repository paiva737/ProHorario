<template>
  <div class="mt-6 border-t pt-6" @submit.prevent.stop>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-900">Confirme seu agendamento</h2>
      <span class="text-sm text-gray-500">{{ hhmm(selected.start) }} – {{ hhmm(selected.end) }} · {{ date }}</span>
    </div>

    <!-- Transição suave entre formulário e cartão de sucesso -->
    <Transition name="fade-scale" mode="out-in">
      <!-- Cartão de sucesso -->
      <div v-if="success" key="ok" class="rounded-xl border border-green-200 bg-green-50 p-4">
        <div class="flex items-start gap-3">
          <div class="h-6 w-6 rounded-full bg-green-600 text-white grid place-items-center text-sm">✓</div>
          <div>
            <p class="font-semibold text-green-800">Agendado com sucesso!</p>
            <p class="text-green-700 text-sm mt-1">
              {{ hhmm(selected.start) }} – {{ hhmm(selected.end) }} · {{ date }}
            </p>
            <div class="mt-3 flex gap-2">
              <button
                type="button"
                class="px-3 py-2 rounded-lg border border-green-300 text-green-800 hover:bg-green-100 transition"
                @click="$emit('cancel')"
              >
                Novo agendamento
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulário -->
      <div v-else key="form" class="grid grid-cols-1 gap-3">
        <label class="block">
          <span class="text-sm text-gray-700">Seu nome</span>
          <input
            v-model.trim="nome"
            class="mt-1 w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Ex.: João da Silva"
            :disabled="loading"
            @keydown.enter.prevent
            required
          />
        </label>

        <label class="block">
          <span class="text-sm text-gray-700">Seu e-mail</span>
          <input
            v-model.trim="email"
            type="email"
            class="mt-1 w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="voce@email.com"
            :disabled="loading"
            @keydown.enter.prevent
            required
          />
        </label>

        <label class="block">
          <span class="text-sm text-gray-700">Notas (opcional)</span>
          <textarea
            v-model.trim="notas"
            rows="3"
            class="mt-1 w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Compartilhe informações úteis para a consulta"
            :disabled="loading"
            @keydown.enter.prevent
          ></textarea>
        </label>

        <div class="flex gap-2 mt-2 items-center">
          <button
            type="button"
            class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition
                   disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading"
            @click.stop.prevent="$emit('cancel')"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow-sm
                   hover:bg-green-700 active:bg-green-700 transition
                   disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            :disabled="loading || !nome || !emailValido(email)"
            @click.stop.prevent="onSubmit"
          >
            <span v-if="loading" class="inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading ? 'Agendando…' : 'Confirmar' }}</span>
          </button>

          <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  selected: { type: Object, required: true }, 
  date: { type: String, required: true },     
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
  if(!nome.value.trim()){
    return emit('submit', { error: 'Informe seu nome' })
  }
  if(!emailValido(email.value)){
    return emit('submit', { error: 'Informe um e-mail válido' })
  }
  emit('submit', {
    nome: nome.value.trim(),
    email: email.value.trim(),
    notas: notas.value?.trim() || undefined
  })
}
</script>

<style>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
