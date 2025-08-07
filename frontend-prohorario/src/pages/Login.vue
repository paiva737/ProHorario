<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none" />
        </div>

        <div class="mb-4">
          <label class="block mb-1">Senha</label>
          <input v-model="senha" type="password" required class="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none" />
        </div>

        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">Entrar</button>
      </form>

      <p v-if="erro" class="text-red-400 mt-4 text-center">{{ erro }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const email = ref('')
const senha = ref('')
const erro = ref('')
const userStore = useUserStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await api.post('/login', {
      email: email.value,
      senha: senha.value,
    })

    const { token, usuario } = response.data
    userStore.setUserData(token, usuario)
    erro.value = ''

    // redirecionar (vamos criar essa rota em seguida)
    router.push('/dashboard')
  } catch (err) {
    erro.value = 'E-mail ou senha inválidos'
  }
}
</script>
