import { OBJECTS, SURFACES, FORCE_PER_PERSON, frictionForce, WIN_DISTANCE } from './forcesPhysics.js'
import { formatNum } from './bangla.js'

function fmt(value, decimals, lang) {
  return formatNum(value, decimals, lang === 'bn' ? 'bangla' : 'western')
}

// Preload object sprites
const IMG = {}
const SPRITES = {
  skate:    '/assets/images/skate-board.png',
  box:      '/assets/images/box.png',
  fridge:   '/assets/images/fridge.png',
  car:      '/assets/images/car.png',
  ice:      '/assets/images/ice.png',
  wood:     '/assets/images/log.png',
  concrete: '/assets/images/concrete.png',
}
Object.entries(SPRITES).forEach(([key, src]) => {
  const img = new Image()
  img.src = src
  IMG[key] = img
})

// For dynamic background geometry
let bgTime = 0

// World → screen X. World range: [-8, 8] m → [5%, 95%] of canvas width.
export function wx(worldX, w) {
  return w / 2 + (worldX / 8) * (w * 0.44)
}

export function groundY(h) {
  return Math.floor(h * 0.68)
}

function drawBackground(ctx, w, h) {
  if (w <= 0 || h <= 0) return
  bgTime += 0.01

  // Subtle grid (full canvas — sky is transparent so CSS background shows through)
  ctx.save()
  ctx.strokeStyle = 'rgba(209, 213, 219, 0.3)'
  ctx.lineWidth = 1
  const step = 40
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.restore()

  // Drifting shapes — proportional to canvas so they stay subtle on all screen sizes
  ctx.save()
  const dim = Math.min(w, h)
  const shapes = [
    { type: 'circle',   x: w * 0.1,  y: h * 0.2, size: dim * 0.08,  color: '#E8001D', speed: 0.8 },
    { type: 'triangle', x: w * 0.85, y: h * 0.4, size: dim * 0.065, color: '#1CAB55', speed: -1.2 },
    { type: 'square',   x: w * 0.2,  y: h * 0.6, size: dim * 0.07,  color: '#274FE3', speed: 0.5 }
  ]
  shapes.forEach(s => {
    const ox = Math.sin(bgTime * s.speed) * 12
    const oy = Math.cos(bgTime * s.speed * 0.7) * 10
    const rot = bgTime * s.speed * 0.2
    ctx.save()
    ctx.translate(s.x + ox, s.y + oy)
    ctx.rotate(rot)
    ctx.strokeStyle = s.color
    ctx.globalAlpha = 0.1
    ctx.lineWidth = 2
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

function drawSurface(ctx, w, h) {
  const gy = groundY(h)
  ctx.save()
  
  // Fix 1: Surface fill with earthy tones
  const grad = ctx.createLinearGradient(0, gy, 0, h)
  grad.addColorStop(0, '#d4a574') // Sandy tan near horizon
  grad.addColorStop(1, '#b5845a') // Warm earthy brown at base
  ctx.fillStyle = grad
  ctx.fillRect(0, gy, w, h - gy)
  
  // Fix 3: Platform Strip / Stage
  // A thin horizontal band sitting on top of the ground
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.fillRect(0, gy, w, 12)
  
  // Fix 1: Clear Horizon Line (Darker contrasting stroke)
  ctx.strokeStyle = '#059669'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke()
  
  // Decorative edge for the platform
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, gy + 12); ctx.lineTo(w, gy + 12); ctx.stroke()
  
  // Fix 1: Bottom shading (darker strip at the very bottom)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, h - 10, w, 10)
  
  // Fix 3: Subtle platform texture (dots or small lines)
  ctx.fillStyle = 'rgba(0,0,0,0.03)'
  for (let x = 20; x < w; x += 60) {
    ctx.beginPath(); ctx.arc(x, gy + 6, 1, 0, Math.PI * 2); ctx.fill()
  }
  
  ctx.restore()
}

// Proportional horizontal force arrow starting at (x, y)

function drawForceArrow(ctx, x, y, F, maxF, color, label, startOffset = 0, scale = 1) {
  if (Math.abs(F) < 0.5) return
  const dir = Math.sign(F)
  const absF = Math.abs(F)
  
  // Length from the start point
  const maxLen = 140 * scale
  const minLen = 25 * scale
  const shaftLen = (Math.min(absF, maxF) / maxF) * maxLen + minLen
  
  const startX = x + dir * startOffset
  const ex = startX + dir * shaftLen
  
  ctx.save()
  
  // Outer white outline for high contrast
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // Draw Arrow Path (Shaft + Head)
  const hs = 18 * scale // Head length
  const hw = 8 * scale  // Head half-width
  
  const drawArrowPath = () => {
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(ex, y)
    // Head lines
    ctx.moveTo(ex, y)
    ctx.lineTo(ex - dir * hs, y - hw)
    ctx.lineTo(ex, y)
    ctx.lineTo(ex - dir * hs, y + hw)
  }

  // 1. Shadow/Glow
  ctx.shadowBlur = 10 * scale
  ctx.shadowColor = color
  
  // 2. Thick background outline
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 8 * scale
  drawArrowPath()
  ctx.stroke()
  
  // 3. Main colored arrow
  ctx.shadowBlur = 0
  ctx.strokeStyle = color
  ctx.lineWidth = 4 * scale
  ctx.stroke()
  
  // 4. Solid head fill
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(ex, y)
  ctx.lineTo(ex - dir * hs, y - hw)
  ctx.lineTo(ex - dir * hs, y + hw)
  ctx.closePath()
  ctx.fill()
  
  // Label
  ctx.font = `bold ${Math.round(15 * scale)}px Hind Siliguri, Inter, sans-serif`
  ctx.textAlign = dir > 0 ? 'left' : 'right'
  ctx.textBaseline = 'bottom'
  
  const labelX = ex + dir * 10 * scale
  const labelY = y - 8 * scale
  
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 4 * scale
  ctx.strokeText(label, labelX, labelY)
  ctx.fillText(label, labelX, labelY)
  
  ctx.restore()
}

function drawBox(ctx, cx, cy, size, label) {
  const hs = size / 2
  ctx.save()
  
  // Original Shadow (Restored)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(cx - hs + 4, cy - size + 4, size, size)
  
  // Main box
  ctx.fillStyle = '#EA580C'
  ctx.beginPath(); ctx.roundRect(Math.round(cx - hs), Math.round(cy - size), Math.round(size), Math.round(size), 4); ctx.fill()
  
  // Border
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // Text
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.max(11, size * 0.28)}px Inter, sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy - size / 2)
  ctx.restore()
}

function drawSprite(ctx, key, cx, groundY, height) {
  const img = IMG[key]
  if (!img?.complete || !img.naturalWidth) {
    drawBox(ctx, cx, groundY, height, '')
    return
  }
  const aspect = img.naturalWidth / img.naturalHeight
  const w = height * aspect
  
  ctx.save()
  
  // Fix 4: Contrast backdrop
  ctx.beginPath()
  ctx.ellipse(cx, groundY - height / 2, w * 0.6, height * 0.6, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.fill()
  
  ctx.drawImage(img, Math.round(cx - w / 2), Math.round(groundY - height), Math.round(w), Math.round(height))
  ctx.restore()
}

function drawParticles(ctx, x, y, velocity, count = 5) {
  const absV = Math.abs(velocity)
  if (absV < 0.2) return
  ctx.save()
  const dir = Math.sign(velocity)
  
  // Dust particles
  for (let i = 0; i < count; i++) {
    const px = x - dir * (Math.random() * 40 + 10)
    const py = y - Math.random() * 8
    const size = Math.random() * 3 + 1
    const alpha = Math.random() * 0.4 + 0.1
    
    ctx.fillStyle = `rgba(156, 163, 175, ${alpha})`
    ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill()
  }

  // Speed lines if very fast
  if (absV > 2.5) {
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      const lx = x - dir * (Math.random() * 60 + 20)
      const ly = y - Math.random() * 30 - 5
      const len = Math.random() * 30 + 10
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - dir * len, ly); ctx.stroke()
    }
  }
  ctx.restore()
}

function drawCart(ctx, cx, cy, scale = 1) {
  const cw = 72 * scale, ch = 30 * scale, wr = 11 * scale
  ctx.save()

  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fillRect(cx - cw / 2 + 4 * scale, cy - ch + 4 * scale, cw, ch)

  ctx.beginPath()
  ctx.ellipse(cx, cy - ch / 2, cw * 0.6, ch * 0.8, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.fill()

  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.roundRect(Math.round(cx - cw / 2), Math.round(cy - ch), Math.round(cw), Math.round(ch), 8 * scale); ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5 * scale; ctx.stroke()

  const wheelCenters = [-cw / 3, cw / 3]
  wheelCenters.forEach(ox => {
    ctx.fillStyle = '#1F2937'
    ctx.beginPath(); ctx.arc(cx + ox, cy, wr, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5 * scale; ctx.stroke()

    ctx.fillStyle = '#4B5563'
    ctx.beginPath(); ctx.arc(cx + ox, cy, 4 * scale, 0, Math.PI * 2); ctx.fill()
  })
  ctx.restore()
}

// Stick figure. direction: 'left'|'right' (which way person faces / arm extends)
function drawPerson(ctx, cx, cy, active, direction, color, isRunning, isPulling = false, scale = 1) {
  const drawColor = active ? color : '#9CA3AF'
  const headR = 8 * scale, bodyH = 24 * scale, legH = 20 * scale, armLen = 16 * scale
  const dir = direction === 'left' ? -1 : 1

  // Straining animation
  let ox = 0, oy = 0
  if (active && isRunning) {
    ox = (Math.random() - 0.5) * 1.5
    oy = Math.sin(Date.now() * 0.02) * 1.2
  }

  // Fix 4: Contrast backdrop for active figures
  if (active) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(cx, cy - bodyH * 0.8, headR * 3, bodyH * 1.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fill()
    ctx.restore()
  }


  ctx.save()
  ctx.translate(ox, oy)
  ctx.strokeStyle = drawColor; ctx.fillStyle = drawColor
  ctx.lineWidth = Math.max(1.5, 3.5 * scale); ctx.lineCap = 'round'; ctx.lineJoin = 'round'

  // Head with subtle glow if active
  if (active) {
    ctx.shadowBlur = 8
    ctx.shadowColor = drawColor
  }
  ctx.beginPath(); ctx.arc(cx, cy - bodyH - headR * 1.5, headR, 0, Math.PI * 2); ctx.fill()
  
  ctx.shadowBlur = 0
  // Body (leaning based on push/pull)
  ctx.beginPath()
  ctx.moveTo(cx, cy - bodyH)
  if (isPulling) {
    // Lean away from direction (pulling)
    ctx.quadraticCurveTo(cx - dir * 10, cy - bodyH / 2, cx - dir * 5, cy)
  } else if (active) {
    // Deep lean into direction (pushing hard)
    ctx.quadraticCurveTo(cx - dir * 10, cy - bodyH / 2, cx + dir * 2, cy)
  } else {
    // Slight lean (idle/gentle push)
    ctx.quadraticCurveTo(cx - dir * 3, cy - bodyH / 2, cx, cy)
  }
  ctx.stroke()

  // Arms
  if (isPulling) {
    // Both arms pulling the rope
    ctx.beginPath()
    ctx.moveTo(cx, cy - bodyH * 0.7)
    ctx.lineTo(cx + dir * armLen, cy - bodyH * 0.6)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(cx, cy - bodyH * 0.7)
    ctx.lineTo(cx + dir * (armLen - 4), cy - bodyH * 0.45)
    ctx.stroke()
  } else {
    // Push arm (extended)
    ctx.beginPath()
    ctx.moveTo(cx, cy - bodyH * 0.7)
    ctx.lineTo(cx + dir * armLen, cy - bodyH * 0.5)
    ctx.stroke()

    // Back arm
    ctx.beginPath()
    ctx.moveTo(cx, cy - bodyH * 0.7)
    ctx.lineTo(cx - dir * armLen * 0.5, cy - bodyH * 0.9)
    ctx.stroke()
  }

  // Legs
  ctx.beginPath()
  ctx.moveTo(isPulling ? cx - dir * 5 : cx, cy)
  ctx.lineTo(cx - dir * 15, cy + legH)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(isPulling ? cx - dir * 5 : cx, cy)
  ctx.lineTo(cx + dir * 5, cy + legH)
  ctx.stroke()

  ctx.restore()
}

function drawRope(ctx, x1, y, x2, markerX, isRunning, tension = 0, scale = 1) {
  ctx.save()

  const time = Date.now() * 0.05
  const wave = isRunning ? Math.sin(time) * (1 + tension * 2) : 0

  ctx.shadowBlur = 4
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowOffsetY = 2

  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 6 * scale; ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x1, y)

  const sag = (1 - tension) * 12 * scale
  const cp1x = (x1 + markerX) / 2
  const cp1y = y + sag + wave
  ctx.quadraticCurveTo(cp1x, cp1y, markerX, y)

  const cp2x = (markerX + x2) / 2
  const cp2y = y + sag - wave
  ctx.quadraticCurveTo(cp2x, cp2y, x2, y)

  ctx.stroke()

  ctx.setLineDash([4 * scale, 8 * scale])
  ctx.strokeStyle = '#92400E'
  ctx.lineWidth = 2 * scale
  ctx.stroke()
  ctx.restore()

  // Flag on the cart marker
  ctx.save()
  const poleTop = y - 35 * scale
  const poleBot = y - 5 * scale
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2.5 * scale
  ctx.beginPath(); ctx.moveTo(markerX, poleTop); ctx.lineTo(markerX, poleBot); ctx.stroke()

  ctx.shadowBlur = 6
  ctx.shadowColor = 'rgba(255, 214, 0, 0.4)'
  ctx.fillStyle = '#FFD600'; ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.5 * scale

  const flagWave = Math.sin(Date.now() * 0.01) * 4 * scale
  ctx.beginPath()
  ctx.moveTo(markerX, poleTop)
  ctx.lineTo(markerX + 22 * scale, poleTop + 10 * scale + flagWave)
  ctx.lineTo(markerX, poleTop + 20 * scale)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.restore()
}

function drawFrictionGraph(ctx, Fapplied, Ff_actual, Fs_max, Fk, w, h, scale = 1) {
  const gx = w - 175 * scale, gy = 18 * scale, gw = 158 * scale, gh = 120 * scale
  const maxF = Math.max(Fs_max * 1.5, 10)
  ctx.save()
  
  // Glass effect for graph
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 12 * scale); ctx.fill(); ctx.stroke()
  
  // Outer border
  ctx.strokeStyle = '#E5E7EB'
  ctx.strokeRect(gx, gy, gw, gh)

  const ax = gx + 25 * scale, ay = gy + gh - 22 * scale
  const axw = gw - 38 * scale, axh = gh - 35 * scale
  
  // Axes
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.5 * scale
  ctx.beginPath(); ctx.moveTo(ax, gy + 10 * scale); ctx.lineTo(ax, ay + 5 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ax - 5 * scale, ay); ctx.lineTo(ax + axw, ay); ctx.stroke()

  const pivotNorm = Fs_max / maxF
  const xPivot = ax + pivotNorm * axw
  
  // Static region (diagonal y=x)
  ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 2.5 * scale
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(xPivot, ay - pivotNorm * axh); ctx.stroke()
  
  // Kinetic region (horizontal dashed)
  ctx.setLineDash([5 * scale, 4 * scale])
  ctx.beginPath()
  ctx.moveTo(xPivot, ay - (Fk / maxF) * axh)
  ctx.lineTo(ax + axw, ay - (Fk / maxF) * axh)
  ctx.stroke(); ctx.setLineDash([])

  // Current point with glow
  const dX = ax + Math.min(Math.abs(Fapplied) / maxF, 1) * axw
  const dY = ay - Math.min(Math.abs(Ff_actual) / maxF, 1) * axh
  ctx.shadowBlur = 8 * scale
  ctx.shadowColor = '#1CAB55'
  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.arc(dX, dY, 6 * scale, 0, Math.PI * 2); ctx.fill()

  ctx.shadowBlur = 0
  ctx.fillStyle = '#6B7280'; ctx.font = `bold ${Math.round(10 * scale)}px Hind Siliguri, Inter, sans-serif`
  ctx.textAlign = 'center'; ctx.fillText('প্রযুক্ত বল', ax + axw / 2, gy + gh - 5 * scale)
  ctx.save(); ctx.translate(gx + 10 * scale, gy + gh / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText('ঘর্ষণ বল', 0, 0); ctx.restore()

  ctx.restore()
}

// Base CSS dimensions for each motion-tab object at objScale = 1.
// Single source of truth shared by forceCanvas and MotionTab.
export const OBJ_DIMS = {
  ice:    { w: 50,  h: 50,  halfW: 25 },
  box:    { w: 50,  h: 50,  halfW: 25 },
  fridge: { w: 100, h: 120, halfW: 50 },
  car:    { w: 160, h: 90,  halfW: 80 },
}

// ─── Tab drawing functions ───────────────────────────────────────────────────

export function drawNetForce(ctx, w, h, state, lang = 'bn', strings) {
  const { leftPushers, rightPushers, cartX, cartV } = state
  const gy = groundY(h)
  const cartSX = wx(cartX, w)
  const lCount = leftPushers.filter(Boolean).length
  const rCount = rightPushers.filter(Boolean).length
  const Fnet = (rCount - lCount) * FORCE_PER_PERSON
  const maxF = 4 * FORCE_PER_PERSON
  const s = strings?.canvasLabels || { force1: 'Force 1', force2: 'Force 2', netForce: 'Net Force', unitM: 'm', unitMs: 'm/s' }

  // Scale factor for responsive proportions
  const scale = Math.min(1.2, w / 600)

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Dashed track center line
  ctx.save()
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 1; ctx.setLineDash([8 * scale, 6 * scale])
  ctx.beginPath(); ctx.moveTo(w * 0.04, gy - 1); ctx.lineTo(w * 0.96, gy - 1); ctx.stroke()
  ctx.setLineDash([]); ctx.restore()

  // Left pushers (Red)
  leftPushers.forEach((active, i) => {
    const px = cartSX - (110 * scale) - i * (32 * scale)
    if (px > 0) drawPerson(ctx, px, gy, active, 'right', '#E8001D', state.isRunning, false, scale)
  })
  // Right pushers (Blue)
  rightPushers.forEach((active, i) => {
    const px = cartSX + (110 * scale) + i * (32 * scale)
    if (px < w) drawPerson(ctx, px, gy, active, 'left', '#274FE3', state.isRunning, false, scale)
  })

  drawCart(ctx, cartSX, gy, scale)

  // Force arrows stacked above cart
  const baseArrowY = gy - 75 * scale
  const cartOffset = 36 * scale
  if (lCount > 0) drawForceArrow(ctx, cartSX, baseArrowY, -(lCount * FORCE_PER_PERSON), maxF, '#E8001D', `${s.force1} = ${fmt(lCount * 50, 0, lang)} N`, cartOffset, scale)
  if (rCount > 0) drawForceArrow(ctx, cartSX, baseArrowY - 32 * scale, rCount * FORCE_PER_PERSON, maxF, '#274FE3', `${s.force2} = ${fmt(rCount * 50, 0, lang)} N`, cartOffset, scale)
  if (lCount > 0 || rCount > 0) {
    drawForceArrow(ctx, cartSX, baseArrowY - 64 * scale, Fnet, maxF, '#1CAB55', `${s.netForce} = ${fmt(Fnet, 0, lang)} N`, cartOffset, scale)
  }

  // Position readout
  ctx.save()
  ctx.fillStyle = '#4B5563'; ctx.font = `bold ${Math.round(13 * scale)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  const px = cartX >= 0 ? '+' : ''
  const posStr = `${px}${fmt(cartX, 1, lang)} ${s.unitM}`
  const velStr = `${fmt(cartV, 1, lang)} ${s.unitMs}`
  ctx.fillText(`${posStr}  |  ${velStr}`, cartSX, gy - 115 * scale)
  ctx.restore()
}

export function drawMotion(ctx, w, h, state, lang = 'bn', strings) {
  const { Fapplied, selectedObject, frictionOn, boxX, boxV, isRunning } = state
  const obj = OBJECTS[selectedObject]
  const gy = groundY(h)
  const boxSX = wx(boxX, w)
  
  const scale = Math.max(0.4, Math.min(1.2, w / 600))
  const maxF = 500
  const s = strings?.canvasLabels || { appliedF: 'Applied Force', frictionF: 'Friction Force', unitMs: 'm/s' }

  const Ff = frictionOn ? frictionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV) : 0

  // Arrow origins derived from OBJ_DIMS scaled by the same factor MotionTab uses,
  // so arrows always start from the correct edge of the CSS object regardless of size.
  const dims = OBJ_DIMS[selectedObject] || OBJ_DIMS.box
  const boxOffset = dims.halfW * scale
  const arrowY    = gy - 2 - (dims.h * scale) / 2

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  drawParticles(ctx, boxSX, gy, boxV)

  if (Math.abs(Fapplied) > 0.5) drawForceArrow(ctx, boxSX, arrowY, Fapplied, maxF, '#274FE3', `${s.appliedF} = ${fmt(Fapplied, 0, lang)} N`, boxOffset, scale)
  if (frictionOn && Math.abs(Ff) > 0.5) drawForceArrow(ctx, boxSX, arrowY - 32 * scale, Ff, maxF, '#EA580C', `${s.frictionF} = ${fmt(Math.abs(Ff), 0, lang)} N`, boxOffset, scale)
}

export function drawFriction(ctx, w, h, state, lang = 'bn', strings) {
  const { Fapplied, surface, mass, boxX, boxV, isRunning } = state
  const surf = SURFACES[surface]
  const gy = groundY(h)
  const boxSX = wx(boxX, w)
  
  const scale = Math.min(1.2, w / 600)
  const maxF = 500
  const Ff = frictionForce(Fapplied, mass, surf.mu_s, surf.mu_k, boxV)
  const Fs_max = surf.mu_s * mass * 9.8
  const Fk     = surf.mu_k * mass * 9.8
  const isStruggling = Math.abs(Fapplied) > 10 && Math.abs(boxV) < 0.1
  const s = strings?.canvasLabels || { appliedF: 'Applied Force', frictionF: 'Friction Force' }
  const surfStrings = strings?.friction?.surfaces || {}

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Surface label
  ctx.save()
  ctx.fillStyle = '#6B7280'; ctx.font = `bold ${Math.round(12 * scale)}px Hind Siliguri, sans-serif`; ctx.textAlign = 'left'
  const surfLabel = surfStrings[surface] || surf.label
  ctx.fillText(`${lang === 'bn' ? 'তল' : 'Surface'}: ${surfLabel}  (μₛ=${surf.mu_s})`, 16 * scale, h - 12 * scale)
  ctx.restore()

  // Shake if struggling
  let shakeX = 0
  if (isStruggling) shakeX = (Math.random() - 0.5) * 2 * scale

  // Draw person pushing
  if (Math.abs(Fapplied) > 0.5) {
    const dir = Math.sign(Fapplied)
    const px = boxSX - dir * (40 * scale)
    drawPerson(ctx, px + shakeX, gy, true, dir > 0 ? 'right' : 'left', '#274FE3', isRunning, false, scale)
  }

  drawParticles(ctx, boxSX, gy, boxV)
  drawSprite(ctx, surface, boxSX + shakeX, gy, 48 * scale)

  const spriteH = 48 * scale
  const arrowY = gy - spriteH / 2
  const objOffset = spriteH * 0.5
  if (Math.abs(Fapplied) > 0.5) drawForceArrow(ctx, boxSX, arrowY, Fapplied, maxF, '#274FE3', `${s.appliedF} = ${fmt(Fapplied, 0, lang)} N`, objOffset, scale)
  if (Math.abs(Ff) > 0.5) drawForceArrow(ctx, boxSX, arrowY - 32 * scale, Ff, maxF, '#EA580C', `${s.frictionF} = ${fmt(Math.abs(Ff), 0, lang)} N`, objOffset, scale)

  drawFrictionGraph(ctx, Fapplied, -Ff, Fs_max, Fk, w, h, scale)
}

export function drawTug(ctx, w, h, state, lang = 'bn', strings) {
  const { leftTeam, rightTeam, ropeX, winner } = state
  const gy = groundY(h)
  const s = strings?.canvasLabels || { finishLine: 'Finish Line' }
  const tugStrings = strings?.tug || {}

  // Physics runs in ±WIN_DISTANCE (6 m) but we only show the cart in ±VISUAL_WIN (3 world units)
  // so it never reaches the people. People sit fixed in the outer zone (±4.5 to ±7.5).
  const VISUAL_WIN = 3
  const visualRopeX = (ropeX / WIN_DISTANCE) * VISUAL_WIN
  const markerSX = wx(visualRopeX, w)

  // One scale factor drives all elements so proportions stay consistent.
  const sceneScale = Math.min(1, w / 520)

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Win zone lines at ±VISUAL_WIN — matches the cart's visual travel limit
  const leftWin  = wx(-VISUAL_WIN, w)
  const rightWin = wx(VISUAL_WIN, w)
  const lineH = 80 * sceneScale
  ctx.save()
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.setLineDash([6, 5])
  ;[leftWin, rightWin].forEach(lx => {
    ctx.beginPath(); ctx.moveTo(lx, gy - lineH); ctx.lineTo(lx, gy); ctx.stroke()
  })
  ctx.setLineDash([])
  ctx.fillStyle = '#9CA3AF'; ctx.font = `bold ${Math.round(11 * sceneScale)}px Hind Siliguri, sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(s.finishLine, leftWin, gy - lineH - 5)
  ctx.fillText(s.finishLine, rightWin, gy - lineH - 5)
  ctx.restore()

  // Rope spans from people outer edge to people outer edge
  const ropeY = gy - 20 * sceneScale
  const lActive = leftTeam.filter(Boolean).length
  const rActive = rightTeam.filter(Boolean).length
  const tension = Math.min((lActive + rActive) / 3, 1)
  drawRope(ctx, wx(-7.5, w), ropeY, wx(7.5, w), markerSX, state.isRunning, tension, sceneScale)

  // Cart drawn before people so people render on top
  drawCart(ctx, markerSX, gy, sceneScale)

  const personScale = sceneScale
  const outerWorld = 7.5
  const innerWorld = 4.5
  const n = leftTeam.length - 1  // 3 for 4-person teams

  leftTeam.forEach((active, i) => {
    const px = wx(-outerWorld + i * ((outerWorld - innerWorld) / n), w)
    drawPerson(ctx, px, gy, active, 'right', '#E8001D', state.isRunning, true, personScale)
  })
  rightTeam.forEach((active, i) => {
    const px = wx(outerWorld - i * ((outerWorld - innerWorld) / n), w)
    drawPerson(ctx, px, gy, active, 'left', '#274FE3', state.isRunning, true, personScale)
  })

  // Winner overlay
  if (winner) {
    ctx.save()
    ctx.fillStyle = 'rgba(17,24,39,0.7)'; ctx.fillRect(0, 0, w, h)
    
    // Glass card for winner message with pulsing scale
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.05
    const mw = 220 * pulse, mh = 60 * pulse
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath(); ctx.roundRect(w / 2 - mw / 2, h / 2 - mh / 2, mw, mh, 16); ctx.fill()
    
    // Shadow for card
    ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.stroke()
    ctx.shadowBlur = 0
    
    ctx.fillStyle = '#111827'; ctx.font = `bold ${Math.floor(24 * pulse)}px Hind Siliguri, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const msg = winner === 'right' ? (tugStrings.winRight || 'Blue Team Wins!') : (tugStrings.winLeft || 'Red Team Wins!')
    ctx.fillText(msg, w / 2, h / 2)
    ctx.restore()
  }
}

