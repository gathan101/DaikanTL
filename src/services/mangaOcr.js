const OCR_URL = import.meta.env.VITE_MANGA_OCR_URL || 'http://127.0.0.1:8000'

export async function recognizeMangaText(blob, filename = 'manga.png') {
  const form = new FormData()
  form.append('file', blob, filename)

  let res
  try {
    res = await fetch(`${OCR_URL}/ocr`, { method: 'POST', body: form })
  } catch (error) {
    throw new Error(`Service OCR tidak bisa dihubungi di ${OCR_URL}. Jalankan Manga OCR di port 8000 terlebih dahulu.`)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Gagal membaca teks manga')
  return data.text || ''
}
