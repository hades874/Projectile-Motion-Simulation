import { OBJECTS, SURFACES, FORCE_PER_PERSON, frictionForce } from './forcesPhysics.js'

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
  bgTime += 0.01
  
  // Clean background (removed solid fill to show CSS background)
  // Subtle Grid
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

  // Drifting Geometry (Triangle, Circle, Square)
  ctx.save()
  const shapes = [
    { type: 'circle',   x: w * 0.1,  y: h * 0.2, size: 40, color: '#E8001D', speed: 0.8 },
    { type: 'triangle', x: w * 0.85, y: h * 0.4, size: 30, color: '#1CAB55', speed: -1.2 },
    { type: 'square',   x: w * 0.2,  y: h * 0.7, size: 35, color: '#274FE3', speed: 0.5 }
  ]

  shapes.forEach(s => {
    const ox = Math.sin(bgTime * s.speed) * 15
    const oy = Math.cos(bgTime * s.speed * 0.7) * 15
    const rot = bgTime * s.speed * 0.2
    
    ctx.save()
    ctx.translate(s.x + ox, s.y + oy)
    ctx.rotate(rot)
    ctx.strokeStyle = s.color
    ctx.globalAlpha = 0.08
    ctx.lineWidth = 2

    if (s.type === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2); ctx.stroke()
    } else if (s.type === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(0, -s.size / 2);
      ctx.lineTo(s.size / 2, s.size / 2);
      ctx.lineTo(-s.size / 2, s.size / 2);
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

function drawForceArrow(ctx, x, y, F, maxF, color, label, startOffset = 0) {
  if (Math.abs(F) < 0.5) return
  const dir = Math.sign(F)
  const absF = Math.abs(F)
  
  // Length from the start point
  const maxLen = 140
  const minLen = 25
  const shaftLen = (Math.min(absF, maxF) / maxF) * maxLen + minLen
  
  const startX = x + dir * startOffset
  const ex = startX + dir * shaftLen
  
  ctx.save()
  
  // Outer white outline for high contrast
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // Draw Arrow Path (Shaft + Head)
  const hs = 18 // Head length
  const hw = 8  // Head half-width
  
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
  ctx.shadowBlur = 10
  ctx.shadowColor = color
  
  // 2. Thick background outline
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 8
  drawArrowPath()
  ctx.stroke()
  
  // 3. Main colored arrow
  ctx.shadowBlur = 0
  ctx.strokeStyle = color
  ctx.lineWidth = 4
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
  ctx.font = 'bold 15px Hind Siliguri, Inter, sans-serif'
  ctx.textAlign = dir > 0 ? 'left' : 'right'
  ctx.textBaseline = 'bottom'
  
  const labelX = ex + dir * 10
  const labelY = y - 8
  
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 4
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

function drawCart(ctx, cx, cy) {
  const cw = 72, ch = 30, wr = 11
  ctx.save()
  
  // Original Shadow (Restored)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fillRect(cx - cw / 2 + 4, cy - ch + 4, cw, ch)
  
  // Fix 4: Contrast backdrop
  ctx.beginPath()
  ctx.ellipse(cx, cy - ch / 2, cw * 0.6, ch * 0.8, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.fill()
  
  // Cart Body
  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.roundRect(Math.round(cx - cw / 2), Math.round(cy - ch), Math.round(cw), Math.round(ch), 8); ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5; ctx.stroke()
  
  // Wheels
  const wheelCenters = [-cw / 3, cw / 3]
  wheelCenters.forEach(ox => {
    ctx.fillStyle = '#1F2937'
    ctx.beginPath(); ctx.arc(cx + ox, cy, wr, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke()
    
    // Hub
    ctx.fillStyle = '#4B5563'
    ctx.beginPath(); ctx.arc(cx + ox, cy, 4, 0, Math.PI * 2); ctx.fill()
  })
  ctx.restore()
}

// Stick figure. direction: 'left'|'right' (which way person faces / arm extends)
function drawPerson(ctx, cx, cy, active, direction, color, isRunning, isPulling = false) {
  const drawColor = active ? color : '#9CA3AF'
  const headR = 8, bodyH = 24, legH = 20, armLen = 16
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
  ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'

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

function drawRope(ctx, x1, y, x2, markerX, isRunning, tension = 0) {
  ctx.save()
  
  // Rope vibration and wave
  const time = Date.now() * 0.05
  const wave = isRunning ? Math.sin(time) * (1 + tension * 2) : 0
  
  // Rope shadow
  ctx.shadowBlur = 4
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowOffsetY = 2

  // Rope style (braided look via line dash or double stroke)
  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 6; ctx.lineCap = 'round'
  
  // Draw rope segments with tension-based curvature
  ctx.beginPath()
  ctx.moveTo(x1, y)
  
  // Left segment: from x1 to markerX (cart)
  // Less sag with more tension
  const sag = (1 - tension) * 12
  const cp1x = (x1 + markerX) / 2
  const cp1y = y + sag + wave
  ctx.quadraticCurveTo(cp1x, cp1y, markerX, y)
  
  // Right segment: from markerX to x2
  const cp2x = (markerX + x2) / 2
  const cp2y = y + sag - wave
  ctx.quadraticCurveTo(cp2x, cp2y, x2, y)
  
  ctx.stroke()
  
  // Overlap a lighter stroke for texture
  ctx.setLineDash([4, 8])
  ctx.strokeStyle = '#92400E'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // Flag on the cart or rope
  ctx.save()
  // Flag pole
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(markerX, y - 35); ctx.lineTo(markerX, y - 5); ctx.stroke()
  
  // Flag with wave animation
  ctx.shadowBlur = 6
  ctx.shadowColor = 'rgba(255, 214, 0, 0.4)'
  ctx.fillStyle = '#FFD600'; ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.5
  
  const flagWave = Math.sin(Date.now() * 0.01) * 4
  ctx.beginPath()
  ctx.moveTo(markerX, y - 35)
  ctx.lineTo(markerX + 22, y - 25 + flagWave)
  ctx.lineTo(markerX, y - 15)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.restore()
}

function drawFrictionGraph(ctx, Fapplied, Ff_actual, Fs_max, Fk, w, h) {
  const gx = w - 175, gy = 18, gw = 158, gh = 120
  const maxF = Math.max(Fs_max * 1.5, 10)
  ctx.save()
  
  // Glass effect for graph
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 12); ctx.fill(); ctx.stroke()
  
  // Outer border
  ctx.strokeStyle = '#E5E7EB'
  ctx.strokeRect(gx, gy, gw, gh)

  const ax = gx + 25, ay = gy + gh - 22
  const axw = gw - 38, axh = gh - 35
  
  // Axes
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(ax, gy + 10); ctx.lineTo(ax, ay + 5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ax - 5, ay); ctx.lineTo(ax + axw, ay); ctx.stroke()

  const pivotNorm = Fs_max / maxF
  const xPivot = ax + pivotNorm * axw
  
  // Static region (diagonal y=x)
  ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(xPivot, ay - pivotNorm * axh); ctx.stroke()
  
  // Kinetic region (horizontal dashed)
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(xPivot, ay - (Fk / maxF) * axh)
  ctx.lineTo(ax + axw, ay - (Fk / maxF) * axh)
  ctx.stroke(); ctx.setLineDash([])

  // Current point with glow
  const dX = ax + Math.min(Math.abs(Fapplied) / maxF, 1) * axw
  const dY = ay - Math.min(Math.abs(Ff_actual) / maxF, 1) * axh
  ctx.shadowBlur = 8
  ctx.shadowColor = '#1CAB55'
  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.arc(dX, dY, 6, 0, Math.PI * 2); ctx.fill()

  ctx.shadowBlur = 0
  ctx.fillStyle = '#6B7280'; ctx.font = 'bold 10px Hind Siliguri, Inter, sans-serif'
  ctx.textAlign = 'center'; ctx.fillText('প্রযুক্ত বল', ax + axw / 2, gy + gh - 5)
  ctx.save(); ctx.translate(gx + 10, gy + gh / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText('ঘর্ষণ বল', 0, 0); ctx.restore()

  ctx.restore()
}

// ─── Tab drawing functions ───────────────────────────────────────────────────

export function drawNetForce(ctx, w, h, state) {
  const { leftPushers, rightPushers, cartX, cartV } = state
  const gy = groundY(h)
  const cartSX = wx(cartX, w)
  const lCount = leftPushers.filter(Boolean).length
  const rCount = rightPushers.filter(Boolean).length
  const Fnet = (rCount - lCount) * FORCE_PER_PERSON
  const maxF = 4 * FORCE_PER_PERSON

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Dashed track center line
  ctx.save()
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 1; ctx.setLineDash([8, 6])
  ctx.beginPath(); ctx.moveTo(w * 0.04, gy - 1); ctx.lineTo(w * 0.96, gy - 1); ctx.stroke()
  ctx.setLineDash([]); ctx.restore()

  // Left pushers (Red)
  leftPushers.forEach((active, i) => {
    const px = cartSX - 110 - i * 32
    if (px > 0) drawPerson(ctx, px, gy, active, 'right', '#E8001D', state.isRunning)
  })
  // Right pushers (Blue)
  rightPushers.forEach((active, i) => {
    const px = cartSX + 110 + i * 32
    if (px < w) drawPerson(ctx, px, gy, active, 'left', '#274FE3', state.isRunning)
  })

  drawCart(ctx, cartSX, gy)

  // Force arrows stacked above cart (offset by half-cart width)
  const baseArrowY = gy - 75
  const cartOffset = 36
  if (lCount > 0) drawForceArrow(ctx, cartSX, baseArrowY, -(lCount * FORCE_PER_PERSON), maxF, '#E8001D', `বল ১ = ${lCount * 50} N`, cartOffset)
  if (rCount > 0) drawForceArrow(ctx, cartSX, baseArrowY - 32, rCount * FORCE_PER_PERSON, maxF, '#274FE3', `বল ২ = ${rCount * 50} N`, cartOffset)
  if (lCount > 0 || rCount > 0) {
    drawForceArrow(ctx, cartSX, baseArrowY - 64, Fnet, maxF, '#1CAB55', `লব্ধি বল = ${Fnet} N`, cartOffset)
  }

  // Position readout
  ctx.save()
  ctx.fillStyle = '#4B5563'; ctx.font = 'bold 13px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${cartX >= 0 ? '+' : ''}${cartX.toFixed(1)} মি  |  ${cartV.toFixed(1)} মি/সে`, cartSX, gy - 115)
  ctx.restore()
}

export function drawMotion(ctx, w, h, state) {
  const { Fapplied, selectedObject, frictionOn, boxX, boxV, isRunning } = state
  const obj = OBJECTS[selectedObject]
  const gy = groundY(h)
  const boxSX = wx(boxX, w)
  const boxSize = 44 + Math.min(Math.log10(obj.mass + 1) * 16, 32)
  const maxF = 500

  const Ff = frictionOn ? frictionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV) : 0
  const isStruggling = Math.abs(Fapplied) > 10 && Math.abs(boxV) < 0.1

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Shake if struggling
  let shakeX = 0
  if (isStruggling) {
    shakeX = (Math.random() - 0.5) * 2
  }

  /* Person and Sprite are now handled by CSS in React component */
  // if (Math.abs(Fapplied) > 0.5) { ... }
  // drawSprite(ctx, selectedObject, boxSX + shakeX, gy, boxSize)

  drawParticles(ctx, boxSX, gy, boxV)

  const arrowY = gy - boxSize - 20
  const boxOffset = boxSize / 2
  if (Math.abs(Fapplied) > 0.5) drawForceArrow(ctx, boxSX, arrowY, Fapplied, maxF, '#274FE3', `প্রযুক্ত বল = ${Fapplied.toFixed(0)} N`, boxOffset)
  if (frictionOn && Math.abs(Ff) > 0.5) drawForceArrow(ctx, boxSX, arrowY - 32, Ff, maxF, '#EA580C', `ঘর্ষণ বল = ${Math.abs(Ff).toFixed(0)} N`, boxOffset)

  // Speed readout
  if (Math.abs(boxV) > 0.05) {
    ctx.save()
    ctx.fillStyle = '#1CAB55'; ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`v = ${boxV.toFixed(1)} মি/সে`, boxSX, gy - boxSize - 65)
    ctx.restore()
  }
}

export function drawFriction(ctx, w, h, state) {
  const { Fapplied, surface, mass, boxX, boxV, isRunning } = state
  const surf = SURFACES[surface]
  const gy = groundY(h)
  const boxSX = wx(boxX, w)
  const maxF = 500
  const Ff = frictionForce(Fapplied, mass, surf.mu_s, surf.mu_k, boxV)
  const Fs_max = surf.mu_s * mass * 9.8
  const Fk     = surf.mu_k * mass * 9.8
  const isStruggling = Math.abs(Fapplied) > 10 && Math.abs(boxV) < 0.1

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Surface label
  ctx.save()
  ctx.fillStyle = '#6B7280'; ctx.font = 'bold 12px Hind Siliguri, sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`তল: ${surf.label}  (μₛ=${surf.mu_s})`, 16, h - 12)
  ctx.restore()

  // Shake if struggling
  let shakeX = 0
  if (isStruggling) shakeX = (Math.random() - 0.5) * 2

  // Draw person pushing
  if (Math.abs(Fapplied) > 0.5) {
    const dir = Math.sign(Fapplied)
    const px = boxSX - dir * 40
    drawPerson(ctx, px + shakeX, gy, true, dir > 0 ? 'right' : 'left', '#274FE3', isRunning, false)
  }

  drawParticles(ctx, boxSX, gy, boxV)
  drawSprite(ctx, surface, boxSX + shakeX, gy, 48)

  const arrowY = gy - 70
  const objOffset = 24 // Fixed size for friction sprites usually
  if (Math.abs(Fapplied) > 0.5) drawForceArrow(ctx, boxSX, arrowY, Fapplied, maxF, '#274FE3', `প্রযুক্ত বল = ${Fapplied.toFixed(0)} N`, objOffset)
  if (Math.abs(Ff) > 0.5) drawForceArrow(ctx, boxSX, arrowY - 32, Ff, maxF, '#EA580C', `ঘর্ষণ বল = ${Math.abs(Ff).toFixed(0)} N`, objOffset)

  drawFrictionGraph(ctx, Fapplied, -Ff, Fs_max, Fk, w, h)
}

export function drawTug(ctx, w, h, state) {
  const { leftTeam, rightTeam, ropeX, winner } = state
  const gy = groundY(h)
  const markerSX = wx(ropeX, w)

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)
  drawSurface(ctx, w, h)

  // Win zone lines
  const leftWin  = wx(-6, w)
  const rightWin = wx(6, w)
  ctx.save()
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.setLineDash([6, 5])
  ;[leftWin, rightWin].forEach(lx => {
    ctx.beginPath(); ctx.moveTo(lx, gy - 80); ctx.lineTo(lx, gy); ctx.stroke()
  })
  ctx.setLineDash([])
  ctx.fillStyle = '#9CA3AF'; ctx.font = 'bold 11px Hind Siliguri, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('শেষ রেখা', leftWin, gy - 85)
  ctx.fillText('শেষ রেখা', rightWin, gy - 85)
  ctx.restore()

  // Rope (drawn first so it appears behind cart and people)
  const ropeY = gy - 20
  const lActive = leftTeam.filter(Boolean).length
  const rActive = rightTeam.filter(Boolean).length
  const tension = Math.min((lActive + rActive) / 3, 1)
  drawRope(ctx, wx(-7.5, w), ropeY, wx(7.5, w), markerSX, state.isRunning, tension)

  // Cart in the middle (drawn before people so people render on top)
  drawCart(ctx, markerSX, gy)

  // Left team (Red, pull left) — drawn last so they appear in front of cart
  leftTeam.forEach((active, i) => {
    const px = wx(-7.6, w) + i * 32
    drawPerson(ctx, px, gy, active, 'right', '#E8001D', state.isRunning, true)
  })
  // Right team (Blue, pull right)
  rightTeam.forEach((active, i) => {
    const px = wx(7.6, w) - i * 32
    drawPerson(ctx, px, gy, active, 'left', '#274FE3', state.isRunning, true)
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
    const msg = winner === 'right' ? 'নীল দল জিতেছে!' : 'লাল দল জিতেছে!'
    ctx.fillText(msg, w / 2, h / 2)
    ctx.restore()
  }
}

