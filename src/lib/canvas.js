const PAD_L = 0.10
const PAD_R = 0.06
const PAD_T = 0.08
const PAD_B = 0.18   // extra bottom room for dimension labels

export function computeScale(points, canvasW, canvasH, h0 = 0) {
  if (!points || points.length < 2) {
    return { scale: 20, offsetX: canvasW * PAD_L, offsetY: canvasH * (1 - PAD_B) }
  }
  const maxX = Math.max(...points.map(p => p.x))
  const maxY = Math.max(...points.map(p => p.y))
  const worldW = Math.max(maxX, 1)
  const worldH = Math.max(maxY, h0, 1)

  const drawW = canvasW * (1 - PAD_L - PAD_R)
  const drawH = canvasH * (1 - PAD_T - PAD_B)
  const scale = Math.min(drawW / worldW, drawH / worldH)

  return {
    scale,
    offsetX: canvasW * PAD_L,
    offsetY: canvasH * (1 - PAD_B),
  }
}

export function worldToScreen(x, y, scale, offsetX, offsetY) {
  return {
    sx: offsetX + x * scale,
    sy: offsetY - y * scale,
  }
}

// ─── Background ──────────────────────────────────────────────────────────────

export function drawBackground(ctx, w, h) {
  const time = performance.now() / 1000

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0,   '#EFF6FF')
  sky.addColorStop(0.6, '#F5F9FF')
  sky.addColorStop(1,   '#F3F4F6')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  // Faint grid
  ctx.save()
  ctx.strokeStyle = 'rgba(209,213,219,0.18)'
  ctx.lineWidth = 1
  const step = 40
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.restore()

  // Drifting geometric watermarks (10MS design language)
  ctx.save()
  const shapes = [
    { type: 'circle',   x: w * 0.87, y: h * 0.18, size: 64, color: '#1CAB55', speed: 0.45 },
    { type: 'triangle', x: w * 0.10, y: h * 0.70, size: 46, color: '#274FE3', speed: -0.65 },
    { type: 'square',   x: w * 0.76, y: h * 0.73, size: 40, color: '#E8001D', speed: 0.52 },
    { type: 'circle',   x: w * 0.44, y: h * 0.10, size: 32, color: '#EA580C', speed: -0.38 },
  ]
  shapes.forEach(s => {
    const ox = Math.sin(time * s.speed) * 10
    const oy = Math.cos(time * s.speed * 0.8) * 10
    ctx.save()
    ctx.translate(s.x + ox, s.y + oy)
    ctx.rotate(time * s.speed * 0.12)
    ctx.strokeStyle = s.color
    ctx.globalAlpha = 0.05
    ctx.lineWidth = 2.5
    if (s.type === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2); ctx.stroke()
    } else if (s.type === 'triangle') {
      ctx.beginPath()
      ctx.moveTo(0, -s.size / 2)
      ctx.lineTo(s.size / 2, s.size / 2)
      ctx.lineTo(-s.size / 2, s.size / 2)
      ctx.closePath(); ctx.stroke()
    } else {
      ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size)
    }
    ctx.restore()
  })
  ctx.restore()
}

// ─── Grid & Axes ─────────────────────────────────────────────────────────────

export function drawGrid(ctx, scale, offsetX, offsetY, canvasW, canvasH) {
  ctx.save()
  const step = pickGridStep(scale)
  const maxWorldX = (canvasW - offsetX) / scale
  const maxWorldY = offsetY / scale

  ctx.strokeStyle = 'rgba(156,163,175,0.25)'
  ctx.lineWidth = 1

  for (let x = 0; x <= maxWorldX + step; x += step) {
    const { sx } = worldToScreen(x, 0, scale, offsetX, offsetY)
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, canvasH); ctx.stroke()
    if (x > 0) {
      ctx.fillStyle = 'rgba(107,114,128,0.5)'
      ctx.font = '9px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(x, sx, offsetY + 12)
    }
  }
  for (let y = step; y <= maxWorldY + step; y += step) {
    const { sy } = worldToScreen(0, y, scale, offsetX, offsetY)
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(canvasW, sy); ctx.stroke()
    ctx.fillStyle = 'rgba(107,114,128,0.5)'
    ctx.font = '9px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(y, offsetX - 4, sy + 3)
  }
  ctx.restore()
}

function pickGridStep(scale) {
  for (const c of [1, 2, 5, 10, 20, 50, 100]) { if (c * scale >= 38) return c }
  return 100
}

export function drawAxes(ctx, scale, offsetX, offsetY, canvasW, canvasH) {
  ctx.save()
  ctx.strokeStyle = 'rgba(75,85,99,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, canvasH); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(canvasW, offsetY); ctx.stroke()
  ctx.fillStyle = 'rgba(75,85,99,0.55)'
  ctx.font = 'bold 10px Inter, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('x (মি)', canvasW - 42, offsetY - 6)
  ctx.fillText('y (মি)', offsetX + 6, 14)
  ctx.restore()
}

// ─── Ground ───────────────────────────────────────────────────────────────────

export function drawGround(ctx, offsetY, canvasW) {
  ctx.save()
  const g = ctx.createLinearGradient(0, offsetY, 0, offsetY + 20)
  g.addColorStop(0,    '#22c55e')
  g.addColorStop(0.35, '#4ade80')
  g.addColorStop(1,    '#bbf7d0')
  ctx.fillStyle = g
  ctx.fillRect(0, offsetY, canvasW, 20)
  ctx.strokeStyle = '#16a34a'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(canvasW, offsetY); ctx.stroke()
  ctx.restore()
}

// ─── Launcher (cannon) ───────────────────────────────────────────────────────

export function drawLauncher(ctx, offsetX, offsetY, thetaDeg, h0 = 0, scale = 1, isComparison = false) {
  const launchY = offsetY - h0 * scale

  // Colors based on theme
  const colors = isComparison ? {
    barrel: ['#FB923C', '#EA580C', '#9A3412'],
    wheel:  ['#7C2D12', '#C2410C', '#EA580C'],
    arc:    'rgba(234, 88, 12, 0.35)',
    label:  '#9A3412'
  } : {
    barrel: ['#6B7280', '#374151', '#111827'],
    wheel:  ['#1F2937', '#4B5563', '#6B7280'],
    arc:    'rgba(28, 171, 85, 0.38)',
    label:  '#4B5563'
  }

  // Platform column when elevated
  if (h0 > 0) {
    const platformH = offsetY - launchY
    ctx.save()
    const colGrad = ctx.createLinearGradient(offsetX - 8, 0, offsetX + 8, 0)
    colGrad.addColorStop(0,   isComparison ? '#9A3412' : '#4B5563')
    colGrad.addColorStop(0.5, isComparison ? '#C2410C' : '#6B7280')
    colGrad.addColorStop(1,   isComparison ? '#7C2D12' : '#374151')
    ctx.fillStyle = colGrad
    ctx.beginPath()
    ctx.roundRect(offsetX - 8, launchY + 6, 16, platformH - 6, [0, 0, 4, 4])
    ctx.fill()
    // Cap plate
    const capGrad = ctx.createLinearGradient(0, launchY - 4, 0, launchY + 8)
    capGrad.addColorStop(0, isComparison ? '#FDBA74' : '#9CA3AF')
    capGrad.addColorStop(1, isComparison ? '#9A3412' : '#374151')
    ctx.fillStyle = capGrad
    ctx.beginPath()
    ctx.roundRect(offsetX - 22, launchY - 4, 44, 10, 3)
    ctx.fill()
    // Height indicator tick
    ctx.strokeStyle = isComparison ? 'rgba(234, 88, 12, 0.4)' : 'rgba(39,79,227,0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(offsetX - 28, launchY)
    ctx.lineTo(offsetX - 52, launchY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  ctx.save()
  ctx.translate(offsetX, launchY)

  // Angle arc
  const arcR = 36
  ctx.strokeStyle = colors.arc
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.arc(0, 0, arcR, -thetaDeg * Math.PI / 180, 0)
  ctx.stroke()
  ctx.setLineDash([])

  // Angle label near the middle of the arc
  const midA = -thetaDeg * Math.PI / 360
  ctx.fillStyle = colors.label
  ctx.font = 'bold 10px Inter, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(thetaDeg + '°', (arcR + 6) * Math.cos(midA), (arcR + 6) * Math.sin(midA))

  // Wheel
  ctx.fillStyle = colors.wheel[0]
  ctx.beginPath(); ctx.arc(3, 3, 13, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = colors.wheel[1]; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.fillStyle = colors.wheel[2]
  ctx.beginPath(); ctx.arc(3, 3, 4.5, 0, Math.PI * 2); ctx.fill()

  // Barrel
  ctx.rotate(-thetaDeg * Math.PI / 180)
  const barGrad = ctx.createLinearGradient(0, -8, 0, 8)
  barGrad.addColorStop(0,    colors.barrel[0])
  barGrad.addColorStop(0.45, colors.barrel[1])
  barGrad.addColorStop(1,    colors.barrel[2])
  ctx.fillStyle = barGrad
  ctx.beginPath(); ctx.roundRect(-2, -7, 42, 14, [3, 8, 8, 3]); ctx.fill()

  // Muzzle
  ctx.fillStyle = colors.barrel[2]
  ctx.beginPath(); ctx.arc(40, 0, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = colors.barrel[1]
  ctx.beginPath(); ctx.arc(40, 0, 4, 0, Math.PI * 2); ctx.fill()

  ctx.restore()
}

// ─── Trajectory ──────────────────────────────────────────────────────────────

export function drawTrajectory(ctx, points, scale, offsetX, offsetY, color = '#1CAB55', dashed = false, opacity = 1) {
  if (!points || points.length < 2) return
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = color
  ctx.lineWidth = dashed ? 2.5 : 3
  if (dashed) ctx.setLineDash([6, 4])
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  if (opacity > 0.4) {
    ctx.shadowBlur = 10
    ctx.shadowColor = color
  }
  ctx.beginPath()
  points.forEach((p, i) => {
    const { sx, sy } = worldToScreen(p.x, p.y, scale, offsetX, offsetY)
    if (i === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  })
  ctx.stroke()
  ctx.restore()
}

// ─── Ball ────────────────────────────────────────────────────────────────────

export function drawBall(ctx, x, y, scale, offsetX, offsetY, color = '#1CAB55', radius = 9) {
  const { sx, sy } = worldToScreen(x, y, scale, offsetX, offsetY)
  const hl = radius * 0.28
  ctx.save()
  ctx.shadowBlur = 18
  ctx.shadowColor = color
  ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2)
  ctx.fillStyle = color; ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.beginPath(); ctx.arc(sx - hl, sy - hl, hl, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill()
  ctx.restore()
}

// ─── Time dots ───────────────────────────────────────────────────────────────

export function drawTrajectoryDots(ctx, points, T, scale, offsetX, offsetY, color = '#1CAB55', currentT = T) {
  if (!points || points.length < 2 || T <= 0) return
  const dotInterval = T / 10
  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  for (let dt = dotInterval; dt <= Math.min(currentT, T) - 0.01; dt += dotInterval) {
    const frac = dt / T
    const idx = Math.min(Math.round(frac * (points.length - 1)), points.length - 1)
    const { sx, sy } = worldToScreen(points[idx].x, points[idx].y, scale, offsetX, offsetY)
    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2)
    ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

// ─── Vectors ─────────────────────────────────────────────────────────────────

export function drawVectors(ctx, x, y, vx, vy, scale, offsetX, offsetY) {
  const { sx, sy } = worldToScreen(x, y, scale, offsetX, offsetY)
  const speed = Math.max(Math.sqrt(vx * vx + vy * vy), 0.1)
  
  // Use a fixed pixel target for arrow length so they are always visible
  // regardless of the graph's world scale.
  const targetPx = 100 
  const vs = targetPx / speed
  
  // Main velocity: Solid and thick
  drawArrow(ctx, sx, sy, sx + vx * vs, sy - vy * vs, '#2563EB', 'v',  6, false)
  
  // Components: Dashed and slightly thinner
  drawArrow(ctx, sx, sy, sx + vx * vs, sy,           '#EA580C', 'vₓ', 4.5, true) 
  drawArrow(ctx, sx, sy, sx,           sy - vy * vs, '#16A34A', 'vᵧ', 4.5, true)
  
  // Gravity: Solid (fixed length 90px)
  drawArrow(ctx, sx, sy, sx,           sy + 90,       '#DC2626', 'g',  5, false)
}

function drawArrow(ctx, x1, y1, x2, y2, color, label, lw = 4, dashed = false) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 5) return
  
  ctx.save()
  
  // White outline for maximum contrast
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = lw + 2.5
  if (dashed) ctx.setLineDash([5, 3])
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  
  // Main arrow shaft
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw
  ctx.lineCap = 'round'
  if (dashed) ctx.setLineDash([5, 3])
  else ctx.setLineDash([])

  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.setLineDash([]) // Reset for arrowhead and tail

  // Arrow Tail (starting dot)
  ctx.beginPath(); ctx.arc(x1, y1, lw * 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  
  // Balanced Arrowhead
  const angle = Math.atan2(dy, dx)
  const hs = 22 // High-visibility arrowhead size
  
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - hs * Math.cos(angle - 0.45), y2 - hs * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - hs * Math.cos(angle + 0.45), y2 - hs * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()

  if (label) {
    ctx.font = 'bold 20px Inter, sans-serif'
    ctx.shadowBlur = 10; ctx.shadowColor = '#fff'
    
    // Explicit offsets for each label type to prevent overlap
    let ox = 0, oy = 0
    if (label === 'v')  { ox = 15;  oy = -20; }
    if (label === 'vₓ') { ox = 18;  oy = 20;  }
    if (label === 'vᵧ') { ox = -25; oy = -18; }
    if (label === 'g')  { ox = 0;   oy = 26;  }
    
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(label, x2 + ox, y2 + oy)
  }
  
  ctx.restore()
}

// ─── Dimension lines (idle / finished) ───────────────────────────────────────

export function drawDimensionLines(ctx, points, scale, offsetX, offsetY, results) {
  if (!points || points.length < 2 || !results || results.R <= 0 || results.H <= 0) return

  const peakIdx = points.reduce((best, p, i) => p.y > points[best].y ? i : best, 0)
  const peak = points[peakIdx]

  const { sx: peakSx, sy: peakSy } = worldToScreen(peak.x, peak.y, scale, offsetX, offsetY)
  const { sx: originSx }           = worldToScreen(0,        0,      scale, offsetX, offsetY)
  const { sx: landSx }             = worldToScreen(results.R, 0,     scale, offsetX, offsetY)

  ctx.save()

  // Height dashed vertical
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = 'rgba(39,79,227,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(peakSx, peakSy); ctx.lineTo(peakSx, offsetY); ctx.stroke()

  // Range dashed horizontal (below ground strip)
  const rangeY = offsetY + 28
  ctx.strokeStyle = 'rgba(28,171,85,0.5)'
  ctx.beginPath(); ctx.moveTo(originSx, rangeY); ctx.lineTo(landSx, rangeY); ctx.stroke()
  ctx.setLineDash([])

  // Range arrowheads
  ctx.fillStyle = '#1CAB55'
  for (const [tx, dir] of [[originSx, 1], [landSx, -1]]) {
    ctx.beginPath()
    ctx.moveTo(tx, rangeY)
    ctx.lineTo(tx + dir * 7, rangeY - 4)
    ctx.lineTo(tx + dir * 7, rangeY + 4)
    ctx.closePath(); ctx.fill()
  }
  ctx.font = 'bold 11px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('R', (originSx + landSx) / 2, rangeY + 13)

  // Height label
  ctx.fillStyle = '#274FE3'
  ctx.textAlign = 'left'
  ctx.fillText('H', peakSx + 5, (peakSy + offsetY) / 2 + 4)

  // Peak dot
  ctx.fillStyle = '#274FE3'
  ctx.beginPath(); ctx.arc(peakSx, peakSy, 5, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()

  // Landing dot
  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.arc(landSx, offsetY, 5, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.stroke()

  ctx.restore()
}

// ─── Impact ripple (animated) ─────────────────────────────────────────────────

export function drawImpactMarker(ctx, x, y, scale, offsetX, offsetY, color = '#1CAB55') {
  const { sx, sy } = worldToScreen(x, y, scale, offsetX, offsetY)
  const time = (performance.now() / 1000) % 1.5
  ctx.save()
  for (let i = 0; i < 3; i++) {
    const phase = ((time - i * 0.35 + 1.5) % 1.5) / 1.5
    const r     = 5 + phase * 28
    const alpha = (1 - phase) * 0.55
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.restore()
}
