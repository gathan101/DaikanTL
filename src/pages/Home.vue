<script setup>
import HeroSection from '../components/HeroSection.vue'
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-10">
    <HeroSection />

    <section>
      <h2 class="text-2xl font-bold mb-2 text-slate-100">Tentang DaikanTL</h2>
      <p class="text-slate-400">
        DaikanTL membantu kamu menerjemahkan halaman manga ke Bahasa Indonesia tanpa ribet. Cukup unggah gambarnya,
        lalu biarkan sistem membaca teks dan menyusunnya kembali dengan bahasa yang lebih enak dibaca.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4 text-slate-100">Cara Kerja</h2>
      <ol class="grid md:grid-cols-3 gap-4 text-slate-300">
        <li class="bg-[#1b1f27] rounded p-4 border border-slate-800"><b>1. Upload</b> halaman manga yang ingin kamu baca.</li>
        <li class="bg-[#1b1f27] rounded p-4 border border-slate-800"><b>2. Tunggu sebentar</b> sampai teksnya selesai dibaca dan diterjemahkan.</li>
        <li class="bg-[#1b1f27] rounded p-4 border border-slate-800"><b>3. Download</b> hasilnya, lalu lanjut baca manga favoritmu.</li>
      </ol>
    </section>

  </div>
</template>
