import { describe, it, expect } from 'vitest'
import {
  timeOfFlight, maxHeight, range, position, velocity,
  trajectoryPoints, computeResults, isDegenerate,
} from './physics.js'

const EPSILON = 0.001

describe('timeOfFlight', () => {
  it('45° from ground', () => {
    const T = timeOfFlight(20, 45, 0)
    expect(T).toBeCloseTo((2 * 20 * Math.sin(45 * Math.PI / 180)) / 9.8, 3)
  })

  it('returns 0 for v0=0', () => {
    expect(timeOfFlight(0, 45, 0)).toBe(0)
  })

  it('returns 0 for θ=0, h0=0', () => {
    expect(timeOfFlight(20, 0, 0)).toBe(0)
  })

  it('90° launch returns to ground', () => {
    const T = timeOfFlight(20, 90, 0)
    const { y } = position(20, 90, 0, T)
    expect(y).toBeCloseTo(0, 2)
  })

  it('with initial height increases flight time', () => {
    const T_flat = timeOfFlight(20, 45, 0)
    const T_elevated = timeOfFlight(20, 45, 10)
    expect(T_elevated).toBeGreaterThan(T_flat)
  })
})

describe('range symmetry', () => {
  it('30° and 60° give same range (h0=0)', () => {
    const R30 = range(20, 30, 0)
    const R60 = range(20, 60, 0)
    expect(Math.abs(R30 - R60)).toBeLessThan(EPSILON)
  })

  it('45° maximises range', () => {
    const R45 = range(20, 45, 0)
    const R30 = range(20, 30, 0)
    const R60 = range(20, 60, 0)
    expect(R45).toBeGreaterThan(R30)
    expect(R45).toBeGreaterThan(R60)
  })
})

describe('maxHeight', () => {
  it('90° gives maximum possible height for given v0', () => {
    const H90 = maxHeight(20, 90, 0)
    const H45 = maxHeight(20, 45, 0)
    expect(H90).toBeGreaterThan(H45)
  })

  it('includes initial height offset', () => {
    const H_ground = maxHeight(20, 90, 0)
    const H_elevated = maxHeight(20, 90, 5)
    expect(H_elevated).toBeCloseTo(H_ground + 5, 3)
  })
})

describe('trajectoryPoints', () => {
  it('produces 201 points', () => {
    expect(trajectoryPoints(20, 45, 0)).toHaveLength(201)
  })

  it('starts at origin', () => {
    const pts = trajectoryPoints(20, 45, 0)
    expect(pts[0].x).toBeCloseTo(0, 3)
    expect(pts[0].y).toBeCloseTo(0, 3)
  })

  it('last point lands at y ≈ 0 when h0=0', () => {
    const pts = trajectoryPoints(20, 45, 0)
    expect(pts[pts.length - 1].y).toBeCloseTo(0, 1)
  })
})

describe('isDegenerate', () => {
  it('flat on ground is degenerate', () => {
    expect(isDegenerate(20, 0, 0)).toBe('flat')
  })
  it('no velocity is degenerate', () => {
    expect(isDegenerate(0, 45, 0)).toBe('no-velocity')
  })
  it('normal case returns null', () => {
    expect(isDegenerate(20, 45, 0)).toBeNull()
  })
  it('vertical launch is not degenerate', () => {
    expect(isDegenerate(20, 90, 0)).toBe('vertical')
  })
})

describe('computeResults', () => {
  it('matches board-exam example: v0=20 θ=30 h0=0', () => {
    const { T, H, R } = computeResults(20, 30, 0)
    expect(T).toBeCloseTo(2.041, 2)
    expect(H).toBeCloseTo(5.102, 2)
    expect(R).toBeCloseTo(35.35, 1)
  })
})
