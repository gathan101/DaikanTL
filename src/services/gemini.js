const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-3.1-flash-lite'

async function requestGemini(parts) {
  if (!API_KEY) throw new Error('API key belum diset. Isi VITE_GEMINI_API_KEY di file .env')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
  const body = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Gagal memproses terjemahan')
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  return JSON.parse(text)
}

export async function detectTextRegions(base64Image, mimeType) {
  const prompt = `Detect every separate Japanese speech bubble or text area in this manga page.
Return ONLY a JSON array, with no markdown or explanation.
Use this exact shape for every item:
[{"bubble":1,"bbox":[xmin,ymin,xmax,ymax]}]
Coordinates must be normalized integers from 0 to 1000, where [xmin,ymin] is the top-left and [xmax,ymax] is the bottom-right.
Include speech bubbles, narration boxes, sound effects, and standalone Japanese text.
Do not include panels, gutters, faces, characters, or background objects.
Order items in Japanese manga reading order: right-to-left, then top-to-bottom.`

  return requestGemini([
    { text: prompt },
    { inline_data: { mime_type: mimeType, data: base64Image } },
  ])
}

export async function translateTexts(texts, targetLanguage = 'Indonesian', mode = 'Santai') {
  if (!texts.length) return []
  const gaya = mode === 'Formal'
    ? 'bahasa baku yang sopan'
    : mode === 'Slang'
      ? 'bahasa gaul/slang anak muda'
      : 'Bahasa Indonesia santai yang natural seperti dialog webtoon'
  const prompt = `Translate each Japanese manga text into ${targetLanguage} using ${gaya}.
Keep the meaning and emotion, but avoid stiff word-for-word translation. Use Aku and Kamu for casual dialogue when appropriate.
Return ONLY a JSON array with this exact shape: [{"bubble":1,"translated":"..."}]
Input texts:
${JSON.stringify(texts)}`
  return requestGemini([{ text: prompt }])
}

// Kept for compatibility with callers that still send the full page directly.
export async function translateImage(base64Image, mimeType, targetLanguage = 'Indonesian', mode = 'Santai') {
  const regions = await detectTextRegions(base64Image, mimeType)
  return regions.map((region) => ({ ...region, original: '', translated: '' }))
}
