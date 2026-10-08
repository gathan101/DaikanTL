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

    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 12)
    ctx.fill()

    ctx.fillStyle = '#111'
    let fontSize = Math.max(12, Math.floor(h / 3))
    let lines = []
    while (fontSize > 10) {
      ctx.font = `${fontSize}px '${font}', sans-serif`
      lines = wrapLines(ctx, p.translated, w - 16)
      if (lines.length * fontSize * 1.2 <= h - 8) break
      fontSize -= 2
    }
    ctx.font = `${fontSize}px '${font}', sans-serif`
    lines.forEach((line, i) => ctx.fillText(line, x + 8, y + fontSize + 6 + i * fontSize * 1.2))
  }

  if (watermark) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.font = `bold ${Math.floor(img.width / 18)}px sans-serif`
    ctx.fillText('WeBAI Free', img.width - ctx.measureText('WeBAI Free').width - 24, img.height - 24)
  }
  return canvas.toDataURL('image/png')
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/)
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
  return lines
}
