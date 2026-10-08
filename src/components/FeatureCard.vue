<script setup>
defineProps({
  icon: String,
  title: String,
  desc: String,
})
</script>

<template>
  <div class="bg-white rounded shadow p-5">
    <div class="text-3xl mb-2">{{ icon }}</div>
    <h3 class="font-bold mb-1">{{ title }}</h3>
    <p class="text-sm text-slate-500">{{ desc }}</p>
  </div>
</template>
