<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser } from '../services/auth'

const router = useRouter()
const user = computed(() => currentUser())

if (!user.value) router.push('/login')
</script>

<template>
  <div v-if="user" class="max-w-3xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold mb-6">Profile</h1>
    <div class="bg-[#20252f] rounded-xl p-6 flex flex-col gap-3">
      <p><span class="text-slate-400">Nama:</span> {{ user.name }}</p>
      <p><span class="text-slate-400">Email:</span> {{ user.email }}</p>
      <p>
        <span class="text-slate-400">Status:</span>
        <span v-if="user.premium" class="text-amber-400 font-bold">★ Premium</span>
        <span v-else class="text-slate-300">Free</span>
      </p>
      <router-link v-if="!user.premium" to="/premium" class="mt-2 inline-block bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded w-fit">Upgrade ke Premium</router-link>
    </div>
  </div>
</template>
