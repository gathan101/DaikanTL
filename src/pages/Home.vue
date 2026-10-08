<script setup>
import HeroSection from '../components/HeroSection.vue'
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-10">
    <HeroSection />

    <section>
      <h2 class="text-2xl font-bold mb-2 text-slate-100">Tentang Project</h2>
      <p class="text-slate-400">
        WeBAI adalah aplikasi web penerjemah manga berbasis AI. Aplikasi ini membaca teks yang ada di dalam
        gambar manga (OCR), lalu menerjemahkannya menjadi Bahasa Indonesia dengan gaya scanlation yang natural —
        bukan hasil terjemahan kaku ala mesin.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4 text-slate-100">Cara Kerja</h2>
      <ol class="grid md:grid-cols-3 gap-4 text-slate-300">
        <li class="bg-[#1b1f27] rounded p-4 border border-slate-800"><b>1. Upload</b> halaman manga yang mau diterjemahkan.</li>
        <li class="bg-[#1b1f27] rounded p-4 border border-slate-800"><b>2. Diproses</b> — sistem memproses hasil upload kamu secara otomatis.</li>
        <li class="bg-[#1b1f27] rounded p-4 border border-slate-800"><b>3. Tinggal download aja</b> — hasil terjemahan siap diunduh langsung.</li>
      </ol>
    </section>

  </div>
</template>
