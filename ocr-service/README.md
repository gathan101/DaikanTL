# DaikanTL Manga OCR service

This service runs [`manga-ocr`](https://github.com/kha-white/manga-ocr) outside the browser. The Vue app uses Gemini only to locate text regions and translate the Japanese text returned by Manga OCR.

## Requirements

Use Python 3.10–3.12 for the smoothest PyTorch installation. Manga OCR downloads its model (about 400 MB) the first time it starts.

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

python -m pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

Check the service:

```bash
curl http://127.0.0.1:8000/health
```

The endpoint accepts a cropped manga text region as `multipart/form-data`:

```bash
curl -X POST -F "file=@bubble.png" http://127.0.0.1:8000/ocr
```

Set `OCR_ALLOW_ORIGINS` to the deployed frontend origin in production. The default `*` is convenient for local development only.
