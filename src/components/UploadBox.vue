<script setup>
const emit = defineEmits(['files'])

function onChange(e) {
  const files = Array.from(e.target.files || [])
  if (files.length) emit('files', files)
}
</script>

<template>
  <label class="block border-2 border-dashed border-slate-600 rounded-xl p-10 text-center cursor-pointer hover:border-[#76C0EC] transition">
    <p class="text-slate-300">Klik atau seret gambar manga ke sini (bisa banyak)</p>
    <p class="text-xs text-slate-500 mt-1">PNG / JPG — multiple files</p>
    <input type="file" accept="image/*" multiple class="hidden" @change="onChange" />
  </label>
</template>
