const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-3.8-flash'

function buildPrompt(targetLanguage, mode) {
  const gaya = mode === 'Formal' ? 'bahasa baku yang sopan' : mode === 'Slang' ? 'bahasa gaul/slang anak muda' : 'Bahasa Indonesia Santai / Natural Webtoon Scanlation'
  return `You are a senior professional manga scanlator translating into ${targetLanguage} (${gaya}). Produce 100% natural, fluid, human-like casual dialogue that flows effortlessly like real fan-translated or official webtoon manga.
1. PRONOUN RULE: Default to 'Aku' and 'Kamu' for dialogue between friends, lovers, or peers.
2. NATURAL COLLOQUIAL PARTICLES: Use conversational particles naturally ('kok', 'sih', 'deh', 'dong', 'kan', 'aja', 'udah', 'banget', 'kayak', 'emang', 'tau') without forcing unnecessary trailing particles. Keep endings clean and dialogue bubble-efficient.
3. CONNECTED BUBBLE FLUENCY: If speech is split across multiple bubbles, ensure the text across bubbles connects into one seamless, fluid Indonesian sentence.
4. STRICT ANTI-LITERAL & ANTI-AI SLOP: Completely ban word-for-word translation or stiff dictionary phrasing.
   - BAD/SLOP: 'MENGAPA KAMU TERLIHAT SANGAT TERKEJUT SEPERTI ITU?' -> GOOD/NATURAL: 'KOK KAGET BANGET SIH...?'
   - BAD/SLOP: 'SAYA ADALAH ORANG YANG MEMBUAT KAMU MERASA SEDIH' -> GOOD/NATURAL: 'AKU YANG BIKIN KAMU SEDIH...'
   - BAD/SLOP: 'APAKAH KAMU SUDAH MEMAKAN MAKANAN SIANGMU HARI INI?' -> GOOD/NATURAL: 'KAMU UDAH MAKAN SIANG BELUM?'
   - BAD/SLOP: 'SAYA BERJANJI AKAN DATANG KEMBALI KEPADAMU BESOK' -> GOOD/NATURAL: 'BESOK AKU JANJI BAKAL BALIK LAGI, KOK!'

Order bubbles by manga reading order (right-to-left, top-to-bottom).
Return ONLY a JSON array, no markdown, no explanation. For each bubble include the bounding box as [ymin, xmin, ymax, xmax] normalized 0-1000:
[{"bubble": 1, "original": "teks asli", "translated": "terjemahan", "bbox": [xmin, ymin, xmax, ymax]}]
Use "bbox" as [xmin, ymin, xmax, ymax] in PIXEL coordinates of the original image.`
}

export async function translateImage(base64Image, mimeType, targetLanguage = 'Indonesian', mode = 'Santai') {
  if (!API_KEY) throw new Error('API key belum diset. Isi VITE_GEMINI_API_KEY di file .env')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
  const body = {
    contents: [{
      parts: [
        { text: buildPrompt(targetLanguage, mode) },
        { inline_data: { mime_type: mimeType, data: base64Image } },
      ],
    }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Gagal memproses terjemahan')
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  return JSON.parse(text)
}
