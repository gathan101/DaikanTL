<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi'
    return
  }
  const res = await login({ email: email.value, password: password.value })
  if (res.ok) router.push('/')
  else error.value = res.message
}
</script>

<template>
  <form @submit.prevent="submit" class="max-w-md mx-auto mt-16 bg-[#20252f] text-slate-200 p-8 rounded-xl shadow flex flex-col gap-4">
    <h2 class="text-3xl font-bold">Selamat datang kembali</h2>
    <p class="text-slate-400 text-sm">Masuk untuk mulai menerjemahkan manga.</p>
    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    <label class="text-sm text-slate-300">Email</label>
    <input v-model="email" type="email" placeholder="Email" class="bg-[#2a303c] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#76C0EC]" />
    <label class="text-sm text-slate-300">Kata Sandi</label>
    <input v-model="password" type="password" placeholder="Kata sandi" class="bg-[#2a303c] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#76C0EC]" />
    <button class="bg-[#76C0EC] text-slate-900 font-bold rounded py-2.5 mt-2">Masuk</button>
    <p class="text-sm text-slate-400 text-center">Belum punya akun? <router-link to="/register" class="text-[#76C0EC] font-semibold">Daftar sekarang</router-link></p>
  </form>
</template>
