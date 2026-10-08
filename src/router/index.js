import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Translate from '../pages/Translate.vue'
import Premium from '../pages/Premium.vue'
import Profile from '../pages/Profile.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/translate', name: 'Translate', component: Translate },
  { path: '/premium', name: 'Premium', component: Premium },
  { path: '/profile', name: 'Profile', component: Profile },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
