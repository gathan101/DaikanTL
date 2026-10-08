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

function normalizeBox(box) {
  if (!Array.isArray(box) || box.length !== 4) return null
  const values = box.map(Number)
  if (values.some((value) => !Number.isFinite(value))) return null
  const [xmin, ymin, xmax, ymax] = values.map((value) => Math.max(0, Math.min(1000, Math.round(value))))
  if (xmax <= xmin || ymax <= ymin || xmax - xmin < 15 || ymax - ymin < 15) return null
  return [xmin, ymin, xmax, ymax]
}

function intersectionOverUnion(a, b) {
  const x1 = Math.max(a[0], b[0])
  const y1 = Math.max(a[1], b[1])
  const x2 = Math.min(a[2], b[2])
  const y2 = Math.min(a[3], b[3])
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const areaA = (a[2] - a[0]) * (a[3] - a[1])
  const areaB = (b[2] - b[0]) * (b[3] - b[1])
  return intersection / (areaA + areaB - intersection || 1)
}

function sanitizeTextRegions(regions) {
  const valid = (Array.isArray(regions) ? regions : [])
    .map((region, index) => ({
      ...region,
      bubble: Number(region?.bubble) || index + 1,
      bbox: normalizeBox(region?.bbox),
      confidence: Number(region?.confidence ?? 1),
    }))
    .filter((region) => region.bbox && region.confidence >= 0.5)
    .sort((a, b) => b.confidence - a.confidence)

  const unique = []
  for (const region of valid) {
    if (!unique.some((item) => intersectionOverUnion(item.bbox, region.bbox) >= 0.75)) unique.push(region)
  }

  return unique
    .sort((a, b) => a.bbox[1] - b.bbox[1] || b.bbox[0] - a.bbox[0])
    .map((region, index) => ({ ...region, bubble: index + 1 }))
}

export async function detectTextRegions(base64Image, mimeType) {
  const prompt = `Detect every separate Japanese speech bubble or text area in this manga page.
Return ONLY a JSON array, with no markdown or explanation.
Use this exact shape for every item:
[{"bubble":1,"bbox":[xmin,ymin,xmax,ymax],"confidence":0.95}]
Coordinates must be normalized integers from 0 to 1000, where [xmin,ymin] is the top-left and [xmax,ymax] is the bottom-right.
The bbox must cover the complete speech bubble or narration box, including empty space around the text.
Include speech bubbles, narration boxes, sound effects, and standalone Japanese text.
Do not include panels, gutters, faces, characters, or background objects.
Do not merge separate bubbles and do not return a bbox for the whole page.
Order items in Japanese manga reading order: right-to-left, then top-to-bottom.`

  const regions = await requestGemini([
    { text: prompt },
    { inline_data: { mime_type: mimeType, data: base64Image } },
  ])
  return sanitizeTextRegions(regions)
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
