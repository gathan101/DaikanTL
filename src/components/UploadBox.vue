<script setup>
const emit = defineEmits(['file'])

function onChange(e) {
  const file = e.target.files?.[0]
  if (file) emit('file', file)
}
</script>

<template>
  <label class="block border-2 border-dashed border-slate-600 rounded-xl p-10 text-center cursor-pointer hover:border-[#76C0EC] transition">
    <p class="text-slate-300">Klik atau seret gambar manga ke sini</p>
    <p class="text-xs text-slate-500 mt-1">PNG / JPG</p>
    <input type="file" accept="image/*" class="hidden" @change="onChange" />
  </label>
</template>
