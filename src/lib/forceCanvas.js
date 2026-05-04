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

// World → screen X. World range: [-8, 8] m → [5%, 95%] of canvas width.
function wx(worldX, w) {
  return w / 2 + (worldX / 8) * (w * 0.44)
}

function groundY(h) {
  return Math.floor(h * 0.68)
}

function drawSurface(ctx, w, h) {
  const gy = groundY(h)
  ctx.save()
  ctx.fillStyle = '#E5E7EB'
  ctx.fillRect(0, gy, w, h - gy)
  ctx.strokeStyle = '#9CA3AF'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke()
  ctx.strokeStyle = '#D1D5DB'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - 9, gy + 9); ctx.stroke()
  }
  ctx.restore()
}

// Proportional horizontal force arrow starting at (x, y)
function drawForceArrow(ctx, x, y, F, maxF, color, label) {
  if (Math.abs(F) < 0.5) return
  const maxLen = 80
  const len = (Math.min(Math.abs(F), maxF) / maxF) * maxLen
  const dir = Math.sign(F)
  const ex = x + dir * len
  ctx.save()
  
  // Glow effect
  ctx.shadowBlur = 6
  ctx.shadowColor = color

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, y); ctx.stroke()
  
  const hs = 10
  ctx.beginPath()
  ctx.moveTo(ex, y)
  ctx.lineTo(ex - dir * hs, y - 6)
  ctx.lineTo(ex - dir * hs, y + 6)
  ctx.closePath(); ctx.fill()
  
  ctx.shadowBlur = 0
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.textAlign = dir > 0 ? 'left' : 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(label, ex + dir * 5, y - 4)
  ctx.restore()
}

function drawBox(ctx, cx, cy, size, label) {
  const hs = size / 2
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(cx - hs + 4, cy - size + 4, size, size)
  ctx.fillStyle = '#EA580C'
  ctx.fillRect(cx - hs, cy - size, size, size)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(cx - hs, cy - size, size, size)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.max(11, size * 0.26)}px Inter, sans-serif`
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
  ctx.drawImage(img, cx - w / 2, groundY - height, w, height)
}

function drawCart(ctx, cx, cy) {
  const cw = 68, ch = 28, wr = 10
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(cx - cw / 2 + 4, cy - ch + 4, cw, ch)
  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.roundRect(cx - cw / 2, cy - ch, cw, ch, 6); ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.stroke()
  const wheelCenters = [-cw / 3, cw / 3]
  wheelCenters.forEach(ox => {
    ctx.fillStyle = '#374151'
    ctx.beginPath(); ctx.arc(cx + ox, cy, wr, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
    ctx.fillStyle = '#6B7280'
    ctx.beginPath(); ctx.arc(cx + ox, cy, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#374151'
  })
  ctx.restore()
}

// Stick figure. direction: 'left'|'right' (which way person faces / arm extends)
function drawPerson(ctx, cx, cy, active, direction) {
  const color = active
    ? (direction === 'left' ? '#E8001D' : '#274FE3')
    : '#9CA3AF'
  const headR = 7, bodyH = 22, legH = 18, armLen = 14
  const dir = direction === 'left' ? -1 : 1

  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'

  // Head with subtle glow if active
  if (active) {
    ctx.shadowBlur = 4
    ctx.shadowColor = color
  }
  ctx.beginPath(); ctx.arc(cx, cy - bodyH - headR * 1.5, headR, 0, Math.PI * 2); ctx.fill()
  
  ctx.shadowBlur = 0
  // Body (slightly curved for pushing feel)
  ctx.beginPath()
  ctx.moveTo(cx, cy - bodyH)
  ctx.quadraticCurveTo(cx - dir * 2, cy - bodyH / 2, cx, cy)
  ctx.stroke()

  // Push arm (extended)
  ctx.beginPath()
  ctx.moveTo(cx, cy - bodyH * 0.7)
  ctx.lineTo(cx + dir * armLen, cy - bodyH * 0.5)
  ctx.stroke()

  // Back arm
  ctx.beginPath()
  ctx.moveTo(cx, cy - bodyH * 0.7)
  ctx.lineTo(cx - dir * armLen * 0.4, cy - bodyH * 0.9)
  ctx.stroke()

  // Legs in pushing stance
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx - dir * 10, cy + legH)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + dir * 6, cy + legH)
  ctx.stroke()

  ctx.restore()
}

function drawRope(ctx, x1, y, x2, markerX) {
  ctx.save()
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke()
  // Flag pole
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(markerX, y - 26); ctx.lineTo(markerX, y + 4); ctx.stroke()
  // Flag
  ctx.fillStyle = '#FFD600'; ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(markerX, y - 26); ctx.lineTo(markerX + 18, y - 17); ctx.lineTo(markerX, y - 8)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.restore()
}

function drawFrictionGraph(ctx, Fapplied, Ff_actual, Fs_max, Fk, w, h) {
  const gx = w - 165, gy = 14, gw = 148, gh = 110
  const maxF = Math.max(Fs_max * 1.5, 10)
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.96)'
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 8); ctx.fill(); ctx.stroke()

  const ax = gx + 22, ay = gy + gh - 18
  const axw = gw - 32, axh = gh - 28
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(ax, gy + 6); ctx.lineTo(ax, ay + 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ax - 4, ay); ctx.lineTo(ax + axw, ay); ctx.stroke()

  const pivotNorm = Fs_max / maxF
  const xPivot = ax + pivotNorm * axw
  // Static region (diagonal y=x)
  ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(xPivot, ay - pivotNorm * axh); ctx.stroke()
  // Kinetic region (horizontal dashed)
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.moveTo(xPivot, ay - (Fk / maxF) * axh)
  ctx.lineTo(ax + axw, ay - (Fk / maxF) * axh)
  ctx.stroke(); ctx.setLineDash([])

  // Current point
  const dX = ax + Math.min(Math.abs(Fapplied) / maxF, 1) * axw
  const dY = ay - Math.min(Math.abs(Ff_actual) / maxF, 1) * axh
  ctx.fillStyle = '#1CAB55'
  ctx.beginPath(); ctx.arc(dX, dY, 5, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#6B7280'; ctx.font = '9px Inter, sans-serif'
  ctx.textAlign = 'center'; ctx.fillText('F (N)', ax + axw / 2, gy + gh - 3)
  ctx.save(); ctx.translate(gx + 7, gy + gh / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText('Ff (N)', 0, 0); ctx.restore()

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
  ctx.fillStyle = '#F9FAFB'; ctx.fillRect(0, 0, w, h)
  drawSurface(ctx, w, h)

  // Dashed track center line
  ctx.save()
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 1; ctx.setLineDash([6, 4])
  ctx.beginPath(); ctx.moveTo(w * 0.04, gy - 1); ctx.lineTo(w * 0.96, gy - 1); ctx.stroke()
  ctx.setLineDash([]); ctx.restore()

  // Left pushers (stand to the left of the cart)
  leftPushers.forEach((active, i) => {
    const px = cartSX - 100 - i * 28
    if (px > 0) drawPerson(ctx, px, gy, active, 'right')
  })
  // Right pushers
  rightPushers.forEach((active, i) => {
    const px = cartSX + 100 + i * 28
    if (px < w) drawPerson(ctx, px, gy, active, 'left')
  })

  drawCart(ctx, cartSX, gy)

  // Force arrows stacked above cart
  const baseArrowY = gy - 52
  if (lCount > 0) drawForceArrow(ctx, cartSX, baseArrowY, -(lCount * FORCE_PER_PERSON), maxF, '#E8001D', `F₁=${lCount * 50}N`)
  if (rCount > 0) drawForceArrow(ctx, cartSX, baseArrowY - 20, rCount * FORCE_PER_PERSON, maxF, '#274FE3', `F₂=${rCount * 50}N`)
  if (lCount > 0 || rCount > 0) {
    drawForceArrow(ctx, cartSX, baseArrowY - 40, Fnet, maxF, '#1CAB55', `Fnet=${Fnet}N`)
  }

  // Position readout
  ctx.save()
  ctx.fillStyle = '#6B7280'; ctx.font = '12px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${cartX >= 0 ? '+' : ''}${cartX.toFixed(1)} m  |  ${cartV.toFixed(1)} m/s`, cartSX, gy - 100)
  ctx.restore()
}

export function drawMotion(ctx, w, h, state) {
  const { Fapplied, selectedObject, frictionOn, boxX, boxV } = state
  const obj = OBJECTS[selectedObject]
  const gy = groundY(h)
  const boxSX = wx(boxX, w)
  const boxSize = 40 + Math.min(Math.log10(obj.mass + 1) * 14, 28)
  const maxF = 500

  const Ff = frictionOn ? frictionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV) : 0

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#F9FAFB'; ctx.fillRect(0, 0, w, h)
  drawSurface(ctx, w, h)
  drawSprite(ctx, selectedObject, boxSX, gy, boxSize)

  const arrowY = gy - boxSize - 10
  if (Math.abs(Fapplied) > 0.5) drawForceArrow(ctx, boxSX, arrowY, Fapplied, maxF, '#274FE3', `F=${Fapplied.toFixed(0)}N`)
  if (frictionOn && Math.abs(Ff) > 0.5) drawForceArrow(ctx, boxSX, arrowY - 22, Ff, maxF, '#EA580C', `Ff=${Math.abs(Ff).toFixed(0)}N`)

  // Speed readout
  if (Math.abs(boxV) > 0.05) {
    ctx.save()
    ctx.fillStyle = '#1CAB55'; ctx.font = 'bold 13px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`v = ${boxV.toFixed(1)} m/s`, boxSX, gy - boxSize - 55)
    ctx.restore()
  }
}

export function drawFriction(ctx, w, h, state) {
  const { Fapplied, surface, mass, boxX, boxV } = state
  const surf = SURFACES[surface]
  const gy = groundY(h)
  const boxSX = wx(boxX, w)
  const maxF = 500
  const Ff = frictionForce(Fapplied, mass, surf.mu_s, surf.mu_k, boxV)
  const Fs_max = surf.mu_s * mass * 9.8
  const Fk     = surf.mu_k * mass * 9.8

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#F9FAFB'; ctx.fillRect(0, 0, w, h)
  drawSurface(ctx, w, h)

  // Surface label
  ctx.save()
  ctx.fillStyle = '#6B7280'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`তল: ${surf.label}  (μₛ=${surf.mu_s})`, 12, h - 8)
  ctx.restore()

  drawSprite(ctx, surface, boxSX, gy, 44)

  const arrowY = gy - 60
  if (Math.abs(Fapplied) > 0.5) drawForceArrow(ctx, boxSX, arrowY, Fapplied, maxF, '#274FE3', `F=${Fapplied.toFixed(0)}N`)
  if (Math.abs(Ff) > 0.5) drawForceArrow(ctx, boxSX, arrowY - 22, Ff, maxF, '#EA580C', `Ff=${Math.abs(Ff).toFixed(0)}N`)

  drawFrictionGraph(ctx, Fapplied, -Ff, Fs_max, Fk, w, h)
}

export function drawTug(ctx, w, h, state) {
  const { leftTeam, rightTeam, ropeX, winner } = state
  const gy = groundY(h)
  const markerSX = wx(ropeX, w)

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#F9FAFB'; ctx.fillRect(0, 0, w, h)
  drawSurface(ctx, w, h)

  // Win zone lines
  const leftWin  = wx(-6, w)
  const rightWin = wx(6, w)
  ctx.save()
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
  ;[leftWin, rightWin].forEach(lx => {
    ctx.beginPath(); ctx.moveTo(lx, gy - 70); ctx.lineTo(lx, gy); ctx.stroke()
  })
  ctx.setLineDash([])
  ctx.fillStyle = '#9CA3AF'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('শেষ রেখা', leftWin, gy - 75)
  ctx.fillText('শেষ রেখা', rightWin, gy - 75)
  ctx.restore()

  // Left team (blue, push right)
  leftTeam.forEach((active, i) => {
    const px = wx(-8, w) + 30 + i * 32
    if (px < markerSX - 20) drawPerson(ctx, px, gy, active, 'right')
  })
  // Right team (red, push left)
  rightTeam.forEach((active, i) => {
    const px = wx(8, w) - 30 - i * 32
    if (px > markerSX + 20) drawPerson(ctx, px, gy, active, 'left')
  })

  // Rope
  const ropeY = gy - 18
  drawRope(ctx, wx(-5.5, w), ropeY, wx(5.5, w), markerSX)

  // Winner overlay
  if (winner) {
    ctx.save()
    ctx.fillStyle = 'rgba(17,24,39,0.55)'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Hind Siliguri, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const msg = winner === 'right' ? 'নীল দল জিতেছে!' : 'লাল দল জিতেছে!'
    ctx.fillText(msg, w / 2, h / 2)
    ctx.restore()
  }
}
