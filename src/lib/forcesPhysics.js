export const GRAVITY = 9.8
export const FORCE_PER_PERSON = 50  // N
export const CART_MASS = 10          // kg
export const ROPE_MASS = 10          // kg
export const TRACK_HALF = 8          // m
export const WIN_DISTANCE = 6        // m — tug-of-war win threshold

export const OBJECTS = {
  ice:    { mass: 5,   mu_s: 0.102, mu_k: 0.102, label: 'বরফ' },   // Fk ≈ 5 N
  box:    { mass: 20,  mu_s: 0.408, mu_k: 0.408, label: 'বাক্স' },  // Fk ≈ 80 N
  fridge: { mass: 60,  mu_s: 0.459, mu_k: 0.459, label: 'ফ্রিজ' }, // Fk ≈ 270 N
  car:    { mass: 120, mu_s: 0.502, mu_k: 0.502, label: 'গাড়ি' },  // Fk ≈ 590 N
}

export const SURFACES = {
  ice:      { mu_s: 0.10, mu_k: 0.05, label: 'বরফ' },
  wood:     { mu_s: 0.45, mu_k: 0.35, label: 'কাঠ' },
  concrete: { mu_s: 0.65, mu_k: 0.55, label: 'কংক্রিট' },
}

export function netForceFromPushers(leftArr, rightArr) {
  const l = leftArr.filter(Boolean).length
  const r = rightArr.filter(Boolean).length
  return (r - l) * FORCE_PER_PERSON
}

export function accel(Fnet, mass) {
  return mass > 0 ? Fnet / mass : 0
}

// Returns friction force (signed). Positive Fapplied → negative friction (opposes).
export function frictionForce(Fapplied, mass, mu_s, mu_k, velocity) {
  const Fs_max = mu_s * mass * GRAVITY
  const Fk     = mu_k * mass * GRAVITY
  if (Math.abs(velocity) < 0.01) {
    if (Math.abs(Fapplied) <= Fs_max) return -Fapplied
    return -Math.sign(Fapplied) * Fk
  }
  return -Math.sign(velocity) * Fk
}

export function netMotionForce(Fapplied, mass, mu_s, mu_k, velocity, frictionOn) {
  if (!frictionOn) return Fapplied
  return Fapplied + frictionForce(Fapplied, mass, mu_s, mu_k, velocity)
}

export function step(x, v, a, dt) {
  return { x: x + v * dt, v: v + a * dt }
}

export function clamp(x, v, half = TRACK_HALF) {
  if (x >=  half) return { x:  half, v: Math.min(v, 0) }
  if (x <= -half) return { x: -half, v: Math.max(v, 0) }
  return { x, v }
}
