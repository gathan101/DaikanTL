<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, logout } from '../services/auth'

const router = useRouter()
const open = ref(false)
const user = ref(currentUser())

router.afterEach(() => {
  user.value = currentUser()
  open.value = false
})

function handleLogout() {
  logout()
  user.value = null
  router.push('/')
}
</script>

<template>
  <nav class="bg-[#1b1f27] border-b border-slate-800 sticky top-0 z-10">
    <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 text-slate-200">
      <router-link to="/" class="font-bold text-xl text-[#76C0EC]">WeBAI</router-link>
      <button class="md:hidden" @click="open = !open">☰</button>
      <div :class="['md:flex items-center gap-4', open ? 'flex flex-col absolute top-full left-0 right-0 bg-white p-4 shadow md:static md:flex-row md:shadow-none' : 'hidden']">
        <router-link to="/">Home</router-link>
        <router-link to="/translate">Translate</router-link>
        <router-link to="/premium">Premium</router-link>
        <router-link to="/profile">Profile</router-link>
        <template v-if="user">
          <span class="text-sm text-slate-500">{{ user.name }} <span v-if="user.premium" class="text-amber-500 font-semibold">★ Premium</span></span>
          <button @click="handleLogout" class="text-red-500">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register" class="bg-[#76C0EC] text-slate-900 font-semibold px-3 py-1 rounded">Register</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>
