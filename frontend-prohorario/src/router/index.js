import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import Register from '../pages/Register.vue'
import AgendamentoPublico from '../pages/AgendamentoPublico.vue' 


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/register', name: 'Register', component: Register },
  { path: '/:linkPersonalizado', name: 'AgendamentoPublico', component: AgendamentoPublico } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
