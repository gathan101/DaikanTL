<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, upgradeToPremium } from '../services/auth'

const router = useRouter()
const showModal = ref(false)
const message = ref('')
const user = ref(currentUser())

function subscribe() {
  if (!user.value) {
    message.value = 'Silakan login dulu sebelum berlangganan.'
  }
  showModal.value = true
}

async function confirm() {
  const res = await upgradeToPremium()
  if (res.ok) {
    user.value = currentUser()
    message.value = 'Selamat! Akun kamu sudah Premium ★'
  } else {
    message.value = res.message
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold mb-6">Langganan Premium</h1>
    <p v-if="user?.premium" class="text-amber-600 font-semibold mb-4">★ Akun kamu sudah Premium!</p>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-[#20252f] text-slate-200 rounded-xl shadow p-6">
        <h3 class="text-xl font-bold">Free</h3>
        <p class="text-slate-400 my-2">Rp0 / bulan</p>
        <ul class="list-disc ml-5 text-sm text-slate-400">
          <li>25 panel per hari</li>
          <li>Semua pilihan font</li>
          <li>Watermark pada hasil download</li>
          <li>Resolusi hasil diturunkan</li>
          <li>Mode bahasa: Santai saja</li>
        </ul>
      </div>
      <div class="bg-[#20252f] text-slate-200 rounded-xl shadow p-6 border-2 border-amber-400">
        <h3 class="text-xl font-bold">Premium ★</h3>
        <p class="text-slate-400 my-2">Rp25.000 / bulan</p>
        <ul class="list-disc ml-5 text-sm text-slate-400">
          <li>Tanpa batas panel harian</li>
          <li>Semua pilihan font</li>
          <li>Download zip tanpa watermark</li>
          <li>Resolusi hasil penuh</li>
          <li>Mode bahasa: Santai, Formal, Slang</li>
        </ul>
        <button @click="subscribe" :disabled="user?.premium" class="mt-4 bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded disabled:opacity-50">
          {{ user?.premium ? 'Sudah Aktif' : 'Berlangganan' }}
        </button>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-[#20252f] text-slate-200 rounded-xl p-6 max-w-sm w-full">
        <p class="mb-4">{{ message || 'Yakin ingin berlangganan Premium?' }}</p>
        <div class="flex justify-end gap-2">
          <button @click="showModal = false; message = ''" class="px-4 py-2 rounded border border-slate-600">Batal</button>
          <button v-if="!message" @click="confirm()" class="px-4 py-2 rounded bg-[#76C0EC] text-slate-900 font-bold">Ya, Berlangganan</button>
        </div>
      </div>
    </div>
  </div>
</template>
