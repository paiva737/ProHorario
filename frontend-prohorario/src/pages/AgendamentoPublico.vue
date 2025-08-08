<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">Agendamento</h1>

    <div v-if="carregando" class="text-center">Carregando horários...</div>
    <div v-else>
      <p class="text-center mb-4">Profissional: <strong>{{ profissional?.nome }}</strong></p>

      <ul class="grid grid-cols-2 gap-4">
        <li v-for="(horario, index) in horarios" :key="index" class="bg-gray-100 p-4 rounded">
          <span>{{ formatarHorario(horario) }}</span>
          <button
            class="ml-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            @click="selecionarHorario(horario)"
          >
            Agendar
          </button>
        </li>
      </ul>
    </div>

    <div v-if="horarioSelecionado" class="mt-6">
      <h2 class="text-lg font-semibold mb-2">Confirme seu agendamento:</h2>
      <input
        type="text"
        v-model="nomeCliente"
        placeholder="Seu nome"
        class="w-full mb-2 p-2 border rounded"
      />
      <input
        type="email"
        v-model="emailCliente"
        placeholder="Seu e-mail"
        class="w-full mb-2 p-2 border rounded"
      />
      <button
        class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        @click="enviarAgendamento"
      >
        Confirmar
      </button>
    </div>

    <div v-if="mensagem" class="mt-4 text-green-600 font-medium text-center">
      {{ mensagem }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const link = route.params.linkPersonalizado

const profissional = ref(null)
const horarios = ref([])
const horarioSelecionado = ref(null)
const nomeCliente = ref('')
const emailCliente = ref('')
const mensagem = ref('')
const carregando = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3000/${link}/disponiveis-livres`)
    const data = await res.json()
    profissional.value = data.profissional
    horarios.value = data.horariosOcupados ? gerarHorariosDisponiveis(data.horariosOcupados) : []
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
  } finally {
    carregando.value = false
  }
})

function gerarHorariosDisponiveis(ocupados) {
  const horariosBase = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00'
  ]

  const dataHoje = new Date().toISOString().split('T')[0]

  return horariosBase
    .map(h => new Date(`${dataHoje}T${h}:00.000Z`).toISOString())
    .filter(h => !ocupados.includes(h))
}

function formatarHorario(iso) {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function selecionarHorario(horario) {
  horarioSelecionado.value = horario
}

async function enviarAgendamento() {
  if (!nomeCliente.value || !emailCliente.value || !horarioSelecionado.value) return

  const payload = {
    data: horarioSelecionado.value,
    nomeCliente: nomeCliente.value,
    emailCliente: emailCliente.value
  }

  try {
    const res = await fetch(`http://localhost:3000/${link}/agendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (res.ok) {
      mensagem.value = 'Agendamento confirmado!'
      horarioSelecionado.value = null
      nomeCliente.value = ''
      emailCliente.value = ''

      
      horarios.value = horarios.value.filter(h => h !== payload.data)
    } else {
      mensagem.value = data.erro || 'Erro ao agendar'
    }
  } catch (error) {
    console.error('Erro ao agendar:', error)
    mensagem.value = 'Erro ao agendar'
  }
}

</script>
