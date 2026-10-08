import io
import os
from functools import lru_cache

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool
from manga_ocr import MangaOcr

MAX_IMAGE_BYTES = 10 * 1024 * 1024


def allowed_origins():
    value = os.getenv("OCR_ALLOW_ORIGINS", "*")
    return [origin.strip() for origin in value.split(",") if origin.strip()]


app = FastAPI(title="DaikanTL Manga OCR")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def get_ocr():
    """Load the model once and reuse it for subsequent requests."""
    return MangaOcr()


def recognize(image: Image.Image) -> str:
    return get_ocr()(image).strip()


@app.get("/health")
def health():
    return {"status": "ok", "service": "manga-ocr"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    data = await file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran gambar maksimal 10 MB")
    if not data:
        raise HTTPException(status_code=400, detail="File gambar kosong")

    try:
        image = Image.open(io.BytesIO(data)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=415, detail="File bukan gambar yang valid") from exc

    text = await run_in_threadpool(recognize, image)
    return {"text": text}
