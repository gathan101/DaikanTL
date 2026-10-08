export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// panel.bbox: [ymin, xmin, ymax, xmax] dalam skala 0-1000 (normalisasi Gemini)
export async function compose(imageSrc, panels, font, { watermark = false } = {}) {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  for (const p of panels) {
    if (!p.bbox) continue
    const [ymin, xmin, ymax, xmax] = p.bbox
    const x = (xmin / 1000) * img.width
    const y = (ymin / 1000) * img.height
    const w = ((xmax - xmin) / 1000) * img.width
    const h = ((ymax - ymin) / 1000) * img.height

    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 12)
    ctx.fill()

    ctx.fillStyle = '#111'
    let fontSize = Math.max(14, Math.floor(h / 4))
    ctx.font = `${fontSize}px '${font}', sans-serif`
    wrapText(ctx, p.translated, x + 8, y + fontSize + 6, w - 16, fontSize * 1.2)
  }

  if (watermark) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.font = `bold ${Math.floor(img.width / 18)}px sans-serif`
    ctx.fillText('WeBAI Free', img.width - ctx.measureText('WeBAI Free').width - 24, img.height - 24)
  }
  return canvas.toDataURL('image/png')
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/)
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = w
      y += lineHeight
    } else line = test
  }
  ctx.fillText(line, x, y)
}
