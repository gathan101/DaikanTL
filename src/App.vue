<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { Analytics } from '@vercel/analytics/vue'

</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#15181e] text-slate-200">
    <Navbar />
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer />
    <Analytics />
  </div>
</template>
