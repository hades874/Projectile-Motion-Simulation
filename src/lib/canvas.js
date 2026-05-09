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

  // Colors based on the new "Toon Cannon" themes
  const colors = isComparison ? {
    // Rugged Orange
    primary:   '#e67e22',
    accent:    '#d35400',
    wheelBg:   '#f39c12',
    gold:      '#f1c40f',
    label:     '#d35400',
    arc:       'rgba(230, 126, 34, 0.35)'
  } : {
    // Moderne Grey
    primary:   '#7f8c8d',
    accent:    '#2c3e50',
    wheelBg:   '#95a5a6',
    gold:      '#f1c40f',
    label:     '#2c3e50',
    arc:       'rgba(127, 140, 141, 0.38)'
  }

  // Platform column when elevated
  if (h0 > 0) {
    const platformH = offsetY - launchY
    ctx.save()
    const colGrad = ctx.createLinearGradient(offsetX - 10, 0, offsetX + 10, 0)
    colGrad.addColorStop(0,   isComparison ? '#9A3412' : '#1F2937')
    colGrad.addColorStop(0.5, colors.primary)
    colGrad.addColorStop(1,   isComparison ? '#9A3412' : '#1F2937')
    ctx.fillStyle = colGrad
    ctx.beginPath()
    ctx.roundRect(Math.round(offsetX - 10), Math.round(launchY + 8), 20, Math.round(platformH - 8), [0, 0, 4, 4])
    ctx.fill()
    
    // Cap plate
    ctx.fillStyle = colors.accent
    ctx.beginPath()
    ctx.roundRect(Math.round(offsetX - 24), Math.round(launchY - 4), 48, 12, 4)
    ctx.fill()
    
    // Height indicator tick
    ctx.strokeStyle = isComparison ? 'rgba(234, 88, 12, 0.4)' : 'rgba(39,79,227,0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(offsetX - 32, launchY)
    ctx.lineTo(offsetX - 56, launchY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  ctx.save()
  ctx.translate(offsetX, launchY)

  // Angle arc
  const arcR = 40
  ctx.strokeStyle = colors.arc
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.arc(0, 0, arcR, -thetaDeg * Math.PI / 180, 0)
  ctx.stroke()
  ctx.setLineDash([])

  // Angle label
  const midA = -thetaDeg * Math.PI / 360
  ctx.fillStyle = colors.label
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(thetaDeg + '°', (arcR + 8) * Math.cos(midA), (arcR + 8) * Math.sin(midA))

  // 1. Draw Barrel (Rotated)
  ctx.save()
  ctx.rotate(-thetaDeg * Math.PI / 180)
  
  // Design dimensions - scaled down for fit
  const bw = 55, bh = 32
  
  // Main Barrel Body
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  // border-radius: 10px 45px 45px 10px (scaled)
  ctx.roundRect(-10, -bh/2, bw, bh, [6, 22, 22, 6])
  ctx.fill()
  
  // Shadow for depth
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.roundRect(-10, bh/2 - 4, bw, 4, [0, 0, 22, 6])
  ctx.fill()

  // Shared Golden Band
  ctx.fillStyle = colors.gold
  ctx.fillRect(-10 + bw * 0.25, -bh/2, 6, bh)
  
  // Wide Muzzle Mouth (Flare)
  const mw = 10, mh = 42
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.roundRect(-10 + bw - 4, -mh/2, mw, mh, 8)
  ctx.fill()
  
  // Muzzle Ring distinction
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(-10 + bw - 4, -mh/2, mw, mh, 8)
  ctx.stroke()
  
  ctx.restore()

  // 2. Draw Wheel (In front of barrel base)
  ctx.save()
  const wr = 11
  const wy = 1
  
  // Main wheel disk
  ctx.fillStyle = colors.wheelBg
  ctx.beginPath()
  ctx.arc(0, wy, wr, 0, Math.PI * 2)
  ctx.fill()
  
  // Wheel Border
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 4
  ctx.stroke()
  
  // Hub Cap
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(0, wy, 5, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore()

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
  ctx.save()
  
  // Determine if it's the Grey Cannonball or the Orange Energy Sphere
  const isOrange = color.toLowerCase() === '#ea580c'
  const isGrey = color.toLowerCase() === '#374151'

  if (isGrey) {
    // Moderne Grey Cannonball
    // background: radial-gradient(circle at 30% 30%, #555, #222);
    const grad = ctx.createRadialGradient(sx - radius * 0.4, sy - radius * 0.4, 0, sx, sy, radius)
    grad.addColorStop(0, '#555')
    grad.addColorStop(1, '#222')
    
    ctx.shadowBlur = 6
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  } else if (isOrange) {
    // Rugged Orange Energy Sphere
    // background: radial-gradient(circle at 50% 50%, #fff, #e67e22 70%);
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius)
    grad.addColorStop(0, '#fff')
    grad.addColorStop(0.7, '#e67e22')
    
    ctx.shadowBlur = 15
    ctx.shadowColor = 'rgba(255, 223, 0, 0.8)'
    
    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    
    // Inset white glow
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()
  } else {
    // Default Ball Style
    const hl = radius * 0.28
    ctx.shadowBlur = 18
    ctx.shadowColor = color
    ctx.beginPath(); ctx.arc(Math.round(sx), Math.round(sy), radius, 0, Math.PI * 2)
    ctx.fillStyle = color; ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(Math.round(sx - hl), Math.round(sy - hl), hl, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill()
  }
  
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

export function drawVectors(ctx, x, y, vx, vy, scale, offsetX, offsetY, canvasW = 600) {
  const { sx, sy } = worldToScreen(x, y, scale, offsetX, offsetY)
  const speed = Math.max(Math.sqrt(vx * vx + vy * vy), 0.1)

  // Scale arrow sizes proportionally on small canvases (mobile)
  const sf = Math.min(canvasW / 600, 1)

  const targetPx = 100 * sf
  const vs = targetPx / speed
  const gravLen = 90 * sf

  drawArrow(ctx, sx, sy, sx + vx * vs, sy - vy * vs, '#2563EB', 'v',  6 * sf,   false, sf)
  drawArrow(ctx, sx, sy, sx + vx * vs, sy,           '#EA580C', 'vₓ', 4.5 * sf, true,  sf)
  drawArrow(ctx, sx, sy, sx,           sy - vy * vs, '#16A34A', 'vᵧ', 4.5 * sf, true,  sf)
  drawArrow(ctx, sx, sy, sx,           sy + gravLen,  '#DC2626', 'g',  5 * sf,   false, sf)
}

function drawArrow(ctx, x1, y1, x2, y2, color, label, lw = 4, dashed = false, sf = 1) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 5) return

  const hs = 22 * sf
  const fontSize = Math.round(20 * sf)

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
  ctx.setLineDash([])

  // Arrow tail dot
  ctx.beginPath(); ctx.arc(x1, y1, lw * 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()

  // Arrowhead
  const angle = Math.atan2(dy, dx)
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - hs * Math.cos(angle - 0.45), y2 - hs * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - hs * Math.cos(angle + 0.45), y2 - hs * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()

  if (label) {
    ctx.font = `bold ${fontSize}px Inter, sans-serif`
    ctx.shadowBlur = 10; ctx.shadowColor = '#fff'

    let ox = 0, oy = 0
    if (label === 'v')  { ox = 15 * sf;  oy = -20 * sf; }
    if (label === 'vₓ') { ox = 18 * sf;  oy =  20 * sf; }
    if (label === 'vᵧ') { ox = -25 * sf; oy = -18 * sf; }
    if (label === 'g')  { ox = 0;        oy =  26 * sf; }

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
  ctx.beginPath(); ctx.arc(Math.round(peakSx), Math.round(peakSy), 5, 0, Math.PI * 2); ctx.fill()
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
