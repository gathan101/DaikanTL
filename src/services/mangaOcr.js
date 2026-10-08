const OCR_URL = import.meta.env.VITE_MANGA_OCR_URL || 'http://127.0.0.1:8000'

export async function recognizeMangaText(blob, filename = 'manga.png') {
  const form = new FormData()
  form.append('file', blob, filename)

  const res = await fetch(`${OCR_URL}/ocr`, { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Gagal membaca teks manga')
  return data.text || ''
}
