export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function cropImageRegion(imageSrc, bbox) {
  const img = await loadImage(imageSrc)
  let [xmin, ymin, xmax, ymax] = bbox || []
  if (![xmin, ymin, xmax, ymax].every(Number.isFinite)) throw new Error('Koordinat teks tidak valid')

  if (Math.max(xmin, ymin, xmax, ymax) <= 1000) {
    xmin = (xmin / 1000) * img.width
    ymin = (ymin / 1000) * img.height
    xmax = (xmax / 1000) * img.width
    ymax = (ymax / 1000) * img.height
  }

  const width = xmax - xmin
  const height = ymax - ymin
  if (width <= 0 || height <= 0) throw new Error('Area teks tidak valid')

  const padX = Math.max(4, width * 0.08)
  const padY = Math.max(4, height * 0.08)
  const left = Math.max(0, xmin - padX)
  const top = Math.max(0, ymin - padY)
  const right = Math.min(img.width, xmax + padX)
  const bottom = Math.min(img.height, ymax + padY)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(right - left)
  canvas.height = Math.ceil(bottom - top)
  canvas.getContext('2d').drawImage(img, left, top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal membuat crop teks'))), 'image/png')
  })
}

// panel.bbox: [xmin, ymin, xmax, ymax] dalam skala 0-1000
export async function compose(imageSrc, panels, font, { watermark = false } = {}) {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  for (const p of panels) {
    if (!p.bbox) continue
    let [xmin, ymin, xmax, ymax] = p.bbox
    // dukung dua kemungkinan format: piksel absolut atau 0-1000
    if (Math.max(xmin, ymin, xmax, ymax) <= 1000) {
      xmin = (xmin / 1000) * img.width
      ymin = (ymin / 1000) * img.height
      xmax = (xmax / 1000) * img.width
      ymax = (ymax / 1000) * img.height
    }
    const x = xmin
    const y = ymin
    const w = xmax - xmin
    const h = ymax - ymin

    const padding = Math.max(10, Math.min(w, h) * 0.08)
    const maxWidth = Math.max(1, w - padding * 2)
    const maxHeight = Math.max(1, h - padding * 2)

    ctx.fillStyle = 'rgba(255,255,255,0.94)'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, Math.min(12, Math.min(w, h) / 4))
    ctx.fill()

    let fontSize = Math.max(12, Math.min(w, h) * 0.22)
    let lines = []
    let lineHeight = fontSize * 1.15
    while (fontSize >= 10) {
      ctx.font = `600 ${fontSize}px '${font}', sans-serif`
      lines = wrapLines(ctx, p.translated || '', maxWidth)
      lineHeight = fontSize * 1.15
      if (lines.length * lineHeight <= maxHeight) break
      fontSize -= 1
    }

    ctx.font = `600 ${fontSize}px '${font}', sans-serif`
    ctx.fillStyle = '#111'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, i) => ctx.fillText(line, x + w / 2, startY + i * lineHeight))
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  }

  if (watermark) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.font = `bold ${Math.floor(img.width / 18)}px sans-serif`
    ctx.fillText('DaikanTL Free', img.width - ctx.measureText('DaikanTL Free').width - 24, img.height - 24)
  }
  return canvas.toDataURL('image/png')
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}
