<template>
  <div class="agendamento">
    <header>
      <h1>Agendamento</h1>
      <p>Horários exibidos no seu fuso local</p>
    </header>

    <main>
      <section>
        <div>
          <div class="profissional">
            <p>Profissional</p>
            <p>{{ profissional?.nome || 'Carregando...' }}</p>
          </div>

          <div class="data-selecao">
            <label for="data">Selecione a data</label>
            <input
              id="data"
              type="date"
              v-model="dia"
              :min="hoje"
              @change="carregar"
              class="input"
            />
          </div>
        </div>

        <div v-if="carregando" class="carregando">
          <p>Carregando horários…</p>
        </div>

        <div v-else>
          <div class="horarios">
            
            <GradeHorarios
              :date="dia"
              :ocupados="ocupados"
              :selected="selecionado"
              :disabled="enviando"
              @select="selecionar"
            />
          </div>

          <FormConfirmacao
            v-if="selecionado"
            :selected="selecionado"
            :date="dia"
            :loading="enviando"
            :success="ok"
            :error="erro"
            @cancel="cancelarSelecao"
            @submit="handleSubmit"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { listarHorariosOcupados, agendarPublico } from '../services/agendamentos'
import GradeHorarios from '../components/GradesHorario.vue'
import FormConfirmacao from '../components/FormConfirmacao.vue'

const hoje = new Date().toISOString().slice(0,10)
const route = useRoute()
const linkPersonalizado = route.params.linkPersonalizado

const dia = ref(hoje)
const profissional = ref(null)
const ocupados = ref([])
const carregando = ref(false)

const selecionado = ref(null)
const enviando = ref(false)
const ok = ref(false)
const erro = ref('')

watch(() => route.params.linkPersonalizado, async (novo) => {
  if (!novo) return
  await carregar()
})

function hhmm(isoUtc) {
  const d = new Date(isoUtc)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

async function carregar(){
  if(!linkPersonalizado) return
  carregando.value = true
  erro.value = ''
  try{
    const data = await listarHorariosOcupados(String(linkPersonalizado), dia.value)
    profissional.value = data.profissional
    ocupados.value = Array.isArray(data.horariosOcupados) ? data.horariosOcupados : []
  }catch(e){
    erro.value = e?.response?.data?.erro || 'Erro ao carregar horários'
  }finally{
    carregando.value = false
  }
}

function selecionar(slot){
  selecionado.value = slot
  ok.value = false
  erro.value = ''
}

function cancelarSelecao(){
  selecionado.value = null
  ok.value = false
  erro.value = ''
}

async function handleSubmit(payload){
  if (payload?.error) {
    erro.value = payload.error
    return
  }
  if(!selecionado.value) {
    erro.value = 'Selecione um horário'
    return
  }

  enviando.value = true
  erro.value = ''
  ok.value = false
  try{
    await agendarPublico(String(linkPersonalizado), {
      start: selecionado.value.start,
      end: selecionado.value.end,
      nomeCliente: payload.nome,
      emailCliente: payload.email,
      notas: payload.notas
    })
    ok.value = true
    await carregar()
    cancelarSelecao()
  }catch(e){
    erro.value = e?.response?.data?.erro || 'Erro ao agendar'
  }finally{
    enviando.value = false
  }
}

onMounted(carregar)
</script>
