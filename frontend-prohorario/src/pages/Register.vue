<template>
  <div>
    <h2>Cadastro</h2>
    <form @submit.prevent="cadastrar">
      <div>
        <label>Nome</label>
        <input v-model="nome" type="text" required />
      </div>

      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>

      <div>
        <label>Confirmar Email</label>
        <input v-model="emailConfirmacao" type="email" required />
      </div>

      <div>
        <label>Senha</label>
        <input v-model="senha" type="password" required />
      </div>

      <div>
        <label>Confirmar Senha</label>
        <input v-model="senhaConfirmacao" type="password" required />
      </div>

      <div>
        <label>CPF</label>
        <input v-model="cpf" type="text" required />
      </div>

      <div>
        <label>Link Personalizado</label>
        <input v-model="linkPersonalizado" type="text" required />
      </div>

      <div>
        <label>Área de Atuação</label>
        <input v-model="area" type="text" required />
      </div>

      <button type="submit">Cadastrar</button>
    </form>

    <p v-if="erro" style="color: red;">{{ mensagemErro }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      nome: '',
      email: '',
      emailConfirmacao: '',
      senha: '',
      senhaConfirmacao: '',
      cpf: '',
      linkPersonalizado: '',
      area: '',
      erro: false,
      mensagemErro: ''
    }
  },
  methods: {
    async cadastrar() {
      if (this.email !== this.emailConfirmacao) {
        this.erro = true
        this.mensagemErro = 'Os emails não coincidem.'
        return
      }

      if (this.senha !== this.senhaConfirmacao) {
        this.erro = true
        this.mensagemErro = 'As senhas não coincidem.'
        return
      }

      const cpfValido = /^\d{11}$/.test(this.cpf)
      if (!cpfValido) {
        this.erro = true
        this.mensagemErro = 'CPF inválido. Deve conter 11 números.'
        return
      }

      try {
        await axios.post('http://localhost:3000/register', {
          nome: this.nome,
          email: this.email,
          senha: this.senha,
          cpf: this.cpf,
          linkPersonalizado: this.linkPersonalizado,
          area: this.area
        })
        this.erro = false
        this.mensagemErro = ''
        this.$router.push('/login')
      } catch (err) {
        this.erro = true
        this.mensagemErro = err.response?.data?.erro || 'Erro ao cadastrar. Verifique os dados.'
        console.error(err)
      }
    }
  }
}
</script>
