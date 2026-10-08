# WeBAI — Penerjemah Manga AI

WeBAI adalah aplikasi web penerjemah manga berbasis AI. Aplikasi ini membaca teks di dalam gambar manga (OCR) lalu menerjemahkannya ke Bahasa Indonesia dengan gaya scanlation yang natural.

## Fitur
- Login & Register
- Upload halaman manga dan sistem menerjemahkannya otomatis
- Pilihan font hasil terjemahan
- Mode bahasa: Santai, Formal, Slang
- Download hasil per panel dalam file .zip
- Limit Free 25 panel/hari, Premium tanpa batas

## Tech Stack
- Vue 3 (Composition API) + Vite
- Tailwind CSS
- Vue Router
- Manga OCR service (Python + FastAPI) untuk membaca teks Jepang dari crop bubble

## Cara Menjalankan (Lokal)
```bash
npm install
npm run dev
```
Lalu buka `http://localhost:5173`.

Untuk mengaktifkan OCR manga lokal, jalankan service Python di terminal lain:

```bash
cd ocr-service
python -m venv .venv
# Use Python 3.10–3.12 for the OCR service.
# Windows
.venv\\Scripts\\activate
# macOS/Linux
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

Salin `.env.example` menjadi `.env`, lalu pastikan `VITE_MANGA_OCR_URL` mengarah ke service OCR tersebut. Saat pertama kali dijalankan, Manga OCR akan mengunduh model sekitar 400 MB.

## Cara Akses Online
Aplikasi di-deploy di Vercel: [isi URL deploy kamu di sini]
