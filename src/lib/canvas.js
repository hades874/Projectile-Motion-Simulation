const PADDING = 0.10

export function computeScale(points, canvasW, canvasH, h0 = 0) {
  if (!points || points.length < 2) {
    return { scale: 20, offsetX: 20, offsetY: canvasH - 40 }
  }
  const maxX = Math.max(...points.map(p => p.x))
  const maxY = Math.max(...points.map(p => p.y))
  const worldW = Math.max(maxX, 1)
  const worldH = Math.max(maxY, h0, 1)

  const drawW = canvasW * (1 - 2 * PADDING)
  const drawH = canvasH * (1 - 2 * PADDING)
  const scale = Math.min(drawW / worldW, drawH / worldH)

  const offsetX = canvasW * PADDING
  const offsetY = canvasH - canvasH * PADDING

  return { scale, offsetX, offsetY }
}

export function worldToScreen(x, y, scale, offsetX, offsetY) {
  return {
    sx: offsetX + x * scale,
    sy: offsetY - y * scale,
  }
}

export function drawGrid(ctx, scale, offsetX, offsetY, canvasW, canvasH) {
  ctx.save()
  ctx.strokeStyle = 'rgba(209,213,219,0.5)'
  ctx.lineWidth = 1
  const step = pickGridStep(scale)
  const maxWorldX = (canvasW - offsetX) / scale
  const maxWorldY = offsetY / scale

  for (let x = 0; x <= maxWorldX + step; x += step) {
    const { sx } = worldToScreen(x, 0, scale, offsetX, offsetY)
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, canvasH)
    ctx.stroke()
  }
  for (let y = 0; y <= maxWorldY + step; y += step) {
    const { sy } = worldToScreen(0, y, scale, offsetX, offsetY)
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(canvasW, sy)
    ctx.stroke()
  }
  ctx.restore()
}

function pickGridStep(scale) {
  const candidates = [1, 2, 5, 10, 20, 50, 100]
  for (const c of candidates) {
    if (c * scale >= 40) return c
  }
  return 100
}

export function drawAxes(ctx, scale, offsetX, offsetY, canvasW, canvasH) {
  ctx.save()
  ctx.strokeStyle = 'rgba(75,85,99,0.7)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(offsetX, 0)
  ctx.lineTo(offsetX, canvasH)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, offsetY)
  ctx.lineTo(canvasW, offsetY)
  ctx.stroke()
  ctx.restore()
}

export function drawTrajectory(ctx, points, scale, offsetX, offsetY, color = '#1CAB55', dashed = false) {
  if (!points || points.length < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  if (dashed) ctx.setLineDash([6, 4])
  ctx.lineJoin = 'round'
  ctx.beginPath()
  points.forEach((p, i) => {
    const { sx, sy } = worldToScreen(p.x, p.y, scale, offsetX, offsetY)
    if (i === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  })
  ctx.stroke()
  ctx.restore()
}

export function drawBall(ctx, x, y, scale, offsetX, offsetY, color = '#1CAB55') {
  const { sx, sy } = worldToScreen(x, y, scale, offsetX, offsetY)
  ctx.save()
  ctx.beginPath()
  ctx.arc(sx, sy, 7, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()
}

export function drawTrajectoryDots(ctx, points, T, scale, offsetX, offsetY, color = '#1CAB55') {
  if (!points || points.length < 2 || T <= 0) return
  const dotInterval = T / 10
  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  for (let dt = 0; dt <= T; dt += dotInterval) {
    const frac = dt / T
    const idx = Math.min(Math.round(frac * (points.length - 1)), points.length - 1)
    const p = points[idx]
    const { sx, sy } = worldToScreen(p.x, p.y, scale, offsetX, offsetY)
    ctx.beginPath()
    ctx.arc(sx, sy, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}

export function drawVectors(ctx, x, y, vx, vy, scale, offsetX, offsetY) {
  const { sx, sy } = worldToScreen(x, y, scale, offsetX, offsetY)
  const vecScale = Math.min(scale * 1.5, 60) / Math.max(Math.sqrt(vx * vx + vy * vy), 1)
  drawArrow(ctx, sx, sy, sx + vx * vecScale, sy - vy * vecScale, '#274FE3', 'v')
  drawArrow(ctx, sx, sy, sx + vx * vecScale, sy, '#EA580C', 'vₓ')
  drawArrow(ctx, sx, sy, sx, sy - vy * vecScale, '#1CAB55', 'vᵧ')
  const gLen = 30
  drawArrow(ctx, sx, sy, sx, sy + gLen, '#E8001D', 'g')
}

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 4) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  const angle = Math.atan2(dy, dx)
  const hs = 8
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - hs * Math.cos(angle - 0.4), y2 - hs * Math.sin(angle - 0.4))
  ctx.lineTo(x2 - hs * Math.cos(angle + 0.4), y2 - hs * Math.sin(angle + 0.4))
  ctx.closePath()
  ctx.fill()
  if (label) {
    ctx.font = '11px Inter, sans-serif'
    ctx.fillText(label, x2 + 4, y2 - 4)
  }
  ctx.restore()
}

export function drawLauncher(ctx, offsetX, offsetY, thetaDeg) {
  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.rotate(-thetaDeg * (Math.PI / 180))
  ctx.fillStyle = '#374151'
  ctx.beginPath()
  ctx.roundRect(-4, -6, 32, 12, 4)
  ctx.fill()
  ctx.fillStyle = '#111827'
  ctx.beginPath()
  ctx.arc(0, 0, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawGround(ctx, offsetY, canvasW) {
  ctx.save()
  ctx.strokeStyle = '#9CA3AF'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, offsetY)
  ctx.lineTo(canvasW, offsetY)
  ctx.stroke()
  ctx.restore()
}
