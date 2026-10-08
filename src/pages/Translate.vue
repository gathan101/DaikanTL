<script setup>
import { ref, onMounted, computed } from 'vue'
import UploadBox from '../components/UploadBox.vue'
import ResultModal from '../components/ResultModal.vue'
import { currentUser, saveTranslation } from '../services/auth'
import { detectTextRegions, translateTexts } from '../services/gemini'
import { recognizeMangaText } from '../services/mangaOcr'
import { saveResult, loadResult, clearResult } from '../services/storage'
import { canTranslate, addUsage, DAILY_LIMIT, getUsage } from '../services/usage'
import { compose, cropImageRegion } from '../services/compose'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const user = ref(currentUser())
const isPremium = computed(() => user.value?.premium === true)

const fontOptions = ['Bangers', 'Comic Neue', 'Komika', 'Wild Words', 'Noto Sans']
const selectedFont = ref('Noto Sans')
const selectedMode = ref('Santai')
const autoDetectBoxes = ref(true)

const images = ref([]) // [{ file, preview, composedSrc, panels: [{bubble,original,translated,bbox,checked}], status }]
const loading = ref(false)
const error = ref('')
const modalShow = ref(false)
const modalText = ref('')

onMounted(async () => {
  const saved = await loadResult()
  if (saved) {
    images.value = (saved.images || []).map((im) => ({ ...im, file: null, preview: null, composedSrc: null }))
  }
})

function toBase64(file) {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1])
    r.readAsDataURL(file)
  })
}

function onFiles(files) {
  error.value = ''
  for (const f of files) {
    images.value.push({ file: f, preview: URL.createObjectURL(f), composedSrc: null, panels: [], status: 'ready' })
  }
}

async function proses() {
  error.value = ''
  const targets = images.value.filter((im) => im.status === 'ready')
  if (!targets.length) return (error.value = 'Tidak ada gambar untuk diproses')
  if (!canTranslate(isPremium.value)) return (error.value = `Limit harian habis (${DAILY_LIMIT} panel). Upgrade ke Premium!`)
  loading.value = true
  try {
    for (const im of targets) {
      im.status = 'loading'
      try {
        const b64 = await toBase64(im.file)
        const regions = autoDetectBoxes.value
          ? await detectTextRegions(b64, im.file.type)
          : [{ bubble: 1, bbox: [0, 0, 1000, 1000], confidence: 1 }]
        if (autoDetectBoxes.value && !regions.length) {
          throw new Error('Tidak ada area teks yang terdeteksi di halaman ini')
        }
        const ocrResults = []
        for (const region of regions) {
          const crop = await cropImageRegion(im.preview, region.bbox)
          const original = await recognizeMangaText(crop, `${im.file.name}-bubble-${region.bubble}.png`)
          if (original) ocrResults.push({ bubble: region.bubble, text: original })
        }
        const translations = await translateTexts(ocrResults, 'Indonesian', selectedMode.value)
        const textByBubble = new Map(ocrResults.map((item) => [item.bubble, item.text]))
        const translationByBubble = new Map(translations.map((item) => [item.bubble, item.translated]))
        im.panels = regions
          .map((region) => ({
            ...region,
            original: textByBubble.get(region.bubble) || '',
            translated: translationByBubble.get(region.bubble) || '',
            checked: Boolean(textByBubble.get(region.bubble)),
          }))
          .filter((panel) => panel.original || panel.translated)
        addUsage(im.panels.length)
        if (isPremium.value) {
          await saveTranslation({ mode: selectedMode.value, font: selectedFont.value, result: im.panels })
        }
        im.composedSrc = autoDetectBoxes.value
          ? await compose(im.preview, im.panels, selectedFont.value, { watermark: !isPremium.value })
          : im.preview
        im.status = 'done'
      } catch (e) {
        im.status = 'error'
        error.value = e.message
      }
    }
    await saveResult({ images: images.value.map((im) => ({ name: im.file?.name || im.name, panels: im.panels, status: im.status })) })
  } finally {
    loading.value = false
  }
}

function openModal(panel) {
  modalText.value = panel.translated
  modalShow.value = true
}

async function downloadZip() {
  const zip = new JSZip()
  let count = 0
  for (const im of images.value) {
    const chosen = im.panels.filter((p) => p.checked)
    if (!chosen.length) continue
    count++
    if (im.preview) {
      const dataUrl = autoDetectBoxes.value
        ? await compose(im.preview, chosen, selectedFont.value, { watermark: !isPremium.value })
        : im.preview
      zip.file(`manga_terjemahan_${count}.png`, dataUrl.split(',')[1], { base64: true })
    } else {
      const text = chosen.map((p) => `[Bubble ${p.bubble}] ${p.translated}`).join('\n\n')
      zip.file(`terjemahan_${count}.txt`, text)
    }
  }
  if (!count) return
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'terjemahan.zip')
}

async function reset() {
  images.value = []
  error.value = ''
  await clearResult()
}

function selectNone() {
  images.value.forEach((im) => im.panels.forEach((p) => (p.checked = false)))
}

function selectAll() {
  images.value.forEach((im) => im.panels.forEach((p) => (p.checked = true)))
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
    <h1 class="text-3xl font-bold">Terjemahkan Manga</h1>
    <p class="text-slate-500">Upload satu atau banyak halaman manga, sistem akan menerjemahkannya otomatis.</p>
    <p v-if="!isPremium" class="text-xs text-slate-500">Sisa kuota hari ini: {{ DAILY_LIMIT - getUsage().count }} panel (Free)</p>

    <UploadBox @files="onFiles" />

    <label class="flex items-center gap-2 text-sm cursor-pointer w-fit">
      <input v-model="autoDetectBoxes" type="checkbox" class="accent-[#76C0EC]" />
      <span>Deteksi box otomatis</span>
      <span class="text-xs text-slate-500">
        ({{ autoDetectBoxes ? 'aktif' : 'nonaktif' }})
      </span>
    </label>
    <p class="text-xs text-slate-500 -mt-4">
      {{ autoDetectBoxes ? 'Area bubble akan dicari otomatis sebelum OCR.' : 'OCR akan membaca satu area penuh tanpa typesetting otomatis.' }}
    </p>

    <div v-if="images.length" class="flex flex-col gap-4">
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

      <div v-for="(im, idx) in images" :key="idx" class="bg-[#1b1f27] border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
        <p class="text-xs text-slate-500">{{ im.file?.name || im.name || `Gambar ${idx + 1}` }} — {{ im.status }}</p>
        <img v-if="im.composedSrc || im.preview" :src="im.composedSrc || im.preview" class="max-w-full max-h-96 h-auto object-contain rounded border border-slate-700" />
        <p v-else class="text-slate-500 text-sm">(gambar tidak tersimpan, hanya teks hasil)</p>
        <div v-if="im.panels.length" class="flex flex-col gap-2">
          <div class="flex gap-3 items-center">
            <h3 class="font-bold">Hasil ({{ im.panels.length }} bubble)</h3>
            <button @click="selectAll()" class="text-xs text-[#76C0EC]">Pilih Semua</button>
            <button @click="selectNone()" class="text-xs text-slate-400">Kosongkan</button>
          </div>
          <div v-for="(p, i) in im.panels" :key="i" class="flex gap-3 items-start">
            <input type="checkbox" v-model="p.checked" class="mt-1" />
            <div>
              <p class="text-xs text-slate-500">Bubble {{ p.bubble }}</p>
              <p class="text-slate-400 text-sm">{{ p.original }}</p>
              <p :style="{ fontFamily: selectedFont }">{{ p.translated }}</p>
              <button @click="openModal(p)" class="text-[#76C0EC] text-xs">Lihat detail</button>
            </div>
          </div>
        </div>
      </div>

      <button @click="downloadZip" class="bg-[#76C0EC] text-slate-900 font-bold px-5 py-2 rounded w-fit">Download Terpilih (.zip)</button>
    </div>

    <p v-if="error" class="text-red-400">{{ error }}</p>

    <ResultModal :show="modalShow" :text="modalText" :font="selectedFont" @close="modalShow = false" />
  </div>
</template>
