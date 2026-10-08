<script setup>
import { ref, onMounted, computed } from 'vue'
import UploadBox from '../components/UploadBox.vue'
import ResultModal from '../components/ResultModal.vue'
import { currentUser, saveTranslation } from '../services/auth'
import { translateImage } from '../services/gemini'
import { saveResult, loadResult, clearResult } from '../services/storage'
import { canTranslate, addUsage, DAILY_LIMIT, getUsage } from '../services/usage'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { compose } from '../services/compose'

const user = ref(currentUser())
const isPremium = computed(() => user.value?.premium === true)

const fontOptions = ['Bangers', 'Comic Neue', 'Komika', 'Wild Words', 'Noto Sans']
const selectedFont = ref('Noto Sans')
const selectedMode = ref('Santai')

const imagePreview = ref(null)
const composedSrc = ref(null)
const rawFile = ref(null)
const panels = ref([]) // [{ bubble, original, translated, checked }]
const loading = ref(false)
const error = ref('')
const modalShow = ref(false)
const modalText = ref('')

onMounted(async () => {
  const saved = await loadResult()
  if (saved) {
    panels.value = saved.panels
  }
})

function toBase64(file) {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1])
    r.readAsDataURL(file)
  })
}

function onFile(file) {
  rawFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  composedSrc.value = null
  error.value = ''
  panels.value = []
}

async function proses() {
  error.value = ''
  if (!rawFile.value) return (error.value = 'Upload gambar dulu')
  if (!canTranslate(isPremium.value)) return (error.value = `Limit harian habis (${DAILY_LIMIT} panel). Upgrade ke Premium!`)
  loading.value = true
  try {
    const b64 = await toBase64(rawFile.value)
    const result = await translateImage(b64, rawFile.value.type, 'Indonesian', selectedMode.value)
    panels.value = result.map((r) => ({ ...r, checked: true }))
    addUsage(panels.value.length)
    await saveResult(panels.value)
    await saveTranslation({ mode: selectedMode.value, font: selectedFont.value, result: panels.value })
    composedSrc.value = await compose(imagePreview.value, panels.value, selectedFont.value, { watermark: !isPremium.value })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openModal(panel) {
  modalText.value = panel.translated
  modalShow.value = true
}

async function downloadZip() {
  const chosen = panels.value.filter((p) => p.checked)
  if (!chosen.length) return
  const zip = new JSZip()
  const dataUrl = await compose(imagePreview.value, chosen, selectedFont.value, { watermark: !isPremium.value })
  const base64 = dataUrl.split(',')[1]
  zip.file('manga_terjemahan.png', base64, { base64: true })
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'terjemahan.zip')
}

async function reset() {
  panels.value = []
  imagePreview.value = null
  composedSrc.value = null
  rawFile.value = null
  error.value = ''
  await clearResult()
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
    <h1 class="text-3xl font-bold">Terjemahkan Manga</h1>
    <p class="text-slate-500">Upload halaman manga, sistem akan menerjemahkannya otomatis.</p>
    <p v-if="!isPremium" class="text-xs text-slate-500">Sisa kuota hari ini: {{ DAILY_LIMIT - getUsage().count }} panel (Free)</p>

    <UploadBox @file="onFile" />

    <div v-if="imagePreview" class="flex flex-col gap-4">
      <img :src="composedSrc || imagePreview" class="max-w-full max-h-[32rem] h-auto object-contain rounded border border-slate-700" />
      <div class="flex flex-wrap gap-4 items-center">
        <label class="text-sm">Font:
          <select v-model="selectedFont" class="bg-[#2a303c] rounded px-2 py-1 ml-1">
            <option v-for="f in fontOptions" :key="f">{{ f }}</option>
          </select>
        </label>
        <label class="text-sm">Mode:
          <select v-model="selectedMode" :disabled="!isPremium" class="bg-[#2a303c] rounded px-2 py-1 ml-1 disabled:opacity-50">
            <option>Santai</option>
            <option>Formal</option>
            <option>Slang</option>
          </select>
          <span v-if="!isPremium" class="text-xs text-slate-500">(Premium)</span>
        </label>
        <button @click="proses" :disabled="loading" class="bg-[#76C0EC] text-slate-900 font-bold px-5 py-2 rounded disabled:opacity-50">
          {{ loading ? 'Memproses...' : 'Terjemahkan' }}
        </button>
        <button @click="reset" class="border border-slate-600 px-4 py-2 rounded">Reset</button>
      </div>
    </div>

    <p v-if="error" class="text-red-400">{{ error }}</p>

    <div v-if="panels.length" class="flex flex-col gap-3">
      <h2 class="text-xl font-bold">Hasil ({{ panels.length }} bubble)</h2>
      <div v-for="(p, i) in panels" :key="i" class="bg-[#20252f] border border-slate-800 rounded p-4 flex gap-3">
        <input type="checkbox" v-model="p.checked" class="mt-1" />
        <div>
          <p class="text-xs text-slate-500">Bubble {{ p.bubble }}</p>
          <p class="text-slate-400 text-sm">{{ p.original }}</p>
          <p :style="{ fontFamily: selectedFont }" class="mt-1">{{ p.translated }}</p>
          <button @click="openModal(p)" class="text-[#76C0EC] text-xs mt-1">Lihat detail</button>
        </div>
      </div>
      <button @click="downloadZip" class="bg-[#76C0EC] text-slate-900 font-bold px-5 py-2 rounded w-fit">Download Terpilih (.zip)</button>
    </div>

    <ResultModal :show="modalShow" :text="modalText" :font="selectedFont" @close="modalShow = false" />
  </div>
</template>
