const G = 9.8
const DEG = Math.PI / 180
const SAMPLE_COUNT = 200

export function timeOfFlight(v0, thetaDeg, h0) {
  if (v0 === 0) return 0
  const vy0 = v0 * Math.sin(thetaDeg * DEG)
  if (h0 === 0) {
    if (thetaDeg === 0) return 0
    return (2 * vy0) / G
  }
  // quadratic: ½g·t² - vy0·t - h0 = 0  →  t = (vy0 + √(vy0² + 2gh0)) / g
  return (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G
}

export function maxHeight(v0, thetaDeg, h0) {
  const vy0 = v0 * Math.sin(thetaDeg * DEG)
  return h0 + (vy0 * vy0) / (2 * G)
}

export function range(v0, thetaDeg, h0) {
  const T = timeOfFlight(v0, thetaDeg, h0)
  return v0 * Math.cos(thetaDeg * DEG) * T
}

export function position(v0, thetaDeg, h0, t) {
  const vx = v0 * Math.cos(thetaDeg * DEG)
  const vy0 = v0 * Math.sin(thetaDeg * DEG)
  return {
    x: vx * t,
    y: h0 + vy0 * t - 0.5 * G * t * t,
  }
}

export function velocity(v0, thetaDeg, t) {
  const vx = v0 * Math.cos(thetaDeg * DEG)
  const vy = v0 * Math.sin(thetaDeg * DEG) - G * t
  return { vx, vy, speed: Math.sqrt(vx * vx + vy * vy) }
}

export function impactVelocity(v0, thetaDeg, h0) {
  const T = timeOfFlight(v0, thetaDeg, h0)
  const { vx, vy, speed } = velocity(v0, thetaDeg, T)
  const angleDeg = Math.atan2(Math.abs(vy), Math.abs(vx)) / DEG
  return { vx, vy, speed, angleDeg }
}

export function trajectoryPoints(v0, thetaDeg, h0) {
  const T = timeOfFlight(v0, thetaDeg, h0)
  if (T === 0) return [{ x: 0, y: h0, t: 0 }]
  const points = []
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const t = (i / SAMPLE_COUNT) * T
    const { x, y } = position(v0, thetaDeg, h0, t)
    const { vx, vy, speed } = velocity(v0, thetaDeg, t)
    points.push({ x, y, t, vx, vy, speed })
  }
  return points
}

export function computeResults(v0, thetaDeg, h0) {
  return {
    T: timeOfFlight(v0, thetaDeg, h0),
    H: maxHeight(v0, thetaDeg, h0),
    R: range(v0, thetaDeg, h0),
    impact: impactVelocity(v0, thetaDeg, h0),
  }
}

export function isDegenerate(v0, thetaDeg, h0) {
  if (v0 === 0) return 'no-velocity'
  if (thetaDeg === 0 && h0 === 0) return 'flat'
  if (thetaDeg === 90) return 'vertical'
  return null
}
