<template>
  <div
    class="agendamento"
    @submit.prevent.stop
    @keydown.enter.capture.prevent
  >
    <header>
      <h1>Agendamento</h1>
      <p class="meta">Horários exibidos no seu fuso local</p>
    </header>

    <main>
      <section>
        <div class="profissional">
          <p class="meta">Profissional</p>
          <p class="nome">{{ profissionalNome }}</p>
        </div>

        <div class="data-selecao">
          <label for="data">Selecione a data</label>
          <input
            id="data"
            type="date"
            v-model="dia"
            :min="hoje"
            @change="carregar"
          />
        </div>

        <div v-if="carregando" class="carregando">
          <p class="meta">Carregando horários…</p>
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
import { ref, onMounted, watch, computed, unref } from 'vue'
import { useRoute } from 'vue-router'
import { listarHorariosOcupados, agendarPublico } from '../services/agendamentos'
import GradeHorarios from '../components/GradesHorario.vue'
import FormConfirmacao from '../components/FormConfirmacao.vue'

const hoje = new Date().toISOString().slice(0,10)
const route = useRoute()

// >>> IMPORTANTÍSSIMO: computed precisa RETORNAR a string
const linkPersonalizado = computed(() => {
  return String(route.params.linkPersonalizado || route.query.link || '')
})

const dia = ref(hoje)
const profissional = ref(null)
const ocupados = ref([])
const carregando = ref(false)

const selecionado = ref(null)
const enviando = ref(false)
const ok = ref(false)
const erro = ref('')

const profissionalNome = computed(() => {
  const p = profissional.value
  if (!p) return 'Carregando...'
  if (typeof p === 'string') return p || 'Carregando...'
  return p?.nome || p?.name || p?.nomeCompleto || p?.fullName || 'Carregando...'
})

// Recarrega ao mudar o slug na rota ou a data
watch([() => route.params.linkPersonalizado, () => route.query.link], carregar)
watch(dia, carregar)

async function carregar(){
  const slug = unref(linkPersonalizado) // <- garante string
  if (!slug) {
    console.warn('[agendamento] linkPersonalizado ausente na rota.')
    return
  }
  carregando.value = true
  erro.value = ''
  try{
    console.debug('[agendamento] carregando horários para', { link: slug, date: dia.value })
    const data = await listarHorariosOcupados(slug, dia.value)

    const directName =
      data?.profissionalNome ||
      data?.nomeProfissional ||
      data?.nome ||
      data?.name ||
      data?.owner?.nome ||
      data?.user?.nome ||
      null

    const obj = data?.profissional
    const fromObj =
      (typeof obj === 'string' && obj) ||
      obj?.nome ||
      obj?.name ||
      obj?.nomeCompleto ||
      obj?.fullName ||
      null

    profissional.value = fromObj || directName || obj || null
    ocupados.value = Array.isArray(data?.horariosOcupados) ? data.horariosOcupados : []
  }catch(e){
    erro.value = e?.response?.data?.erro || 'Erro ao carregar horários'
    console.error('[agendamento] erro ao carregar:', e)
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

  const slug = unref(linkPersonalizado) // <- usa string correta no POST
  if (!slug) {
    erro.value = 'Link inválido'
    return
  }

  enviando.value = true
  erro.value = ''
  ok.value = false

  try{
    await agendarPublico(slug, {
      start: selecionado.value.start,
      end: selecionado.value.end,
      nomeCliente: payload.nome,
      emailCliente: payload.email,
      notas: payload.notas
    })

    // UX: mostra sucesso por ~1.5s e só depois atualiza/limpa
    ok.value = true
    setTimeout(async () => {
      try {
        await carregar()
      } finally {
        cancelarSelecao()
        ok.value = false
      }
    }, 1500)

  }catch(e){
    erro.value = e?.response?.data?.erro || 'Erro ao agendar'
  }finally{
    enviando.value = false
  }
}

onMounted(carregar)
</script>
