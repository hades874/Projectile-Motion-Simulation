export const GRAVITY = 9.8
export const FORCE_PER_PERSON = 50  // N
export const CART_MASS = 10          // kg
export const ROPE_MASS = 10          // kg
export const TRACK_HALF = 8          // m
export const WIN_DISTANCE = 6        // m — tug-of-war win threshold

export const OBJECTS = {
  ice:    { mass: 10,   mu_s: 0.10, mu_k: 0.05, label: 'বরফ' },
  box:    { mass: 25,   mu_s: 0.45, mu_k: 0.35, label: 'বাক্স' },
  fridge: { mass: 100,  mu_s: 0.55, mu_k: 0.42, label: 'ফ্রিজ' },
  car:    { mass: 1000, mu_s: 0.65, mu_k: 0.52, label: 'গাড়ি' },
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
