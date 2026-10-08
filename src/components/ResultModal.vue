<script setup>
import { defineProps, defineEmits } from 'vue'
defineProps({ show: Boolean, text: String, font: String })
defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-20" @click.self="$emit('close')">
    <div class="bg-[#20252f] text-slate-200 rounded-xl p-6 max-w-lg w-full">
      <h3 class="font-bold mb-3">Hasil Terjemahan</h3>
      <p :style="{ fontFamily: font }" class="whitespace-pre-wrap text-slate-300">{{ text }}</p>
      <button @click="$emit('close')" class="mt-4 px-4 py-2 rounded bg-[#76C0EC] text-slate-900 font-bold">Tutup</button>
    </div>
  </div>
</template>
