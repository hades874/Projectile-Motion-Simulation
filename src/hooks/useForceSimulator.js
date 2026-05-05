import { useReducer, useCallback } from 'react'
import {
  netForceFromPushers, accel, netMotionForce, frictionForce,
  step, clamp, WIN_DISTANCE, OBJECTS, SURFACES, CART_MASS, ROPE_MASS,
} from '../lib/forcesPhysics.js'

function makeInitial() {
  return {
    activeTab: 'tug',
    motion: {
      Fapplied: 0, selectedObject: 'box', frictionOn: true,
      boxX: 0, boxV: 0, isRunning: false,
    },
    friction: {
      Fapplied: 0, surface: 'wood', mass: 50,
      boxX: 0, boxV: 0, isRunning: false,
    },
    tug: {
      leftTeam:  [false, false, false],
      rightTeam: [false, false, false],
      ropeX: 0, ropeV: 0, isRunning: false, winner: null,
    },
  }
}

function reducer(state, action) {
  const tab = state.activeTab

  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'TOGGLE_PUSHER': {
      const { tabKey, side, idx } = action
      const arr = [...state[tabKey][side]]
      arr[idx] = !arr[idx]
      return { ...state, [tabKey]: { ...state[tabKey], [side]: arr } }
    }

    case 'SET_PARAM': {
      const updated = { ...state[action.tabKey], [action.key]: action.value }
      if (action.key === 'selectedObject' || action.key === 'surface') {
        updated.boxX = 0; updated.boxV = 0
      }
      return { ...state, [action.tabKey]: updated }
    }

    case 'START':
      return { ...state, [tab]: { ...state[tab], isRunning: true } }

    case 'PAUSE':
      return { ...state, [tab]: { ...state[tab], isRunning: false } }

    case 'RESET': {
      const base = state[tab]
      if (tab === 'tug') return { ...state, tug: { ...base, ropeX: 0, ropeV: 0, isRunning: false, winner: null } }
      return { ...state, [tab]: { ...base, boxX: 0, boxV: 0, isRunning: false } }
    }

    case 'TICK': {
      const dt = Math.min(action.dt, 0.05)

      if (tab === 'motion') {
        const { Fapplied, selectedObject, frictionOn, boxX, boxV } = state.motion
        const obj  = OBJECTS[selectedObject]
        const Fnet = netMotionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV, frictionOn)
        const a    = accel(Fnet, obj.mass)
        const moved = step(boxX, boxV, a, dt)
        // stop if friction holds at near-zero velocity
        let { x, v } = moved
        const FnetAtRest = netMotionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, 0, frictionOn)
        if (Math.abs(v) < 0.08 && Math.abs(FnetAtRest) < 0.1) v = 0
        const clamped = clamp(x, v)
        return { ...state, motion: { ...state.motion, boxX: clamped.x, boxV: clamped.v } }
      }

      if (tab === 'friction') {
        const { Fapplied, surface, mass, boxX, boxV } = state.friction
        const surf = SURFACES[surface]
        const Fnet = netMotionForce(Fapplied, mass, surf.mu_s, surf.mu_k, boxV, true)
        const a    = accel(Fnet, mass)
        const moved = step(boxX, boxV, a, dt)
        let { x, v } = moved
        const FnetAtRest = netMotionForce(Fapplied, mass, surf.mu_s, surf.mu_k, 0, true)
        if (Math.abs(v) < 0.08 && Math.abs(FnetAtRest) < 0.1) v = 0
        const clamped = clamp(x, v)
        return { ...state, friction: { ...state.friction, boxX: clamped.x, boxV: clamped.v } }
      }

      if (tab === 'tug') {
        if (state.tug.winner) return state
        const { leftTeam, rightTeam, ropeX, ropeV } = state.tug
        const Fnet  = netForceFromPushers(leftTeam, rightTeam)
        const a     = accel(Fnet, ROPE_MASS)
        const moved = step(ropeX, ropeV, a, dt)
        const winner = moved.x >= WIN_DISTANCE ? 'right' : moved.x <= -WIN_DISTANCE ? 'left' : null
        return { ...state, tug: { ...state.tug, ropeX: moved.x, ropeV: moved.v, winner } }
      }

      return state
    }

    default: return state
  }
}

export function useForceSimulator() {
  const [state, dispatch] = useReducer(reducer, null, makeInitial)

  const setTab       = useCallback((tab)              => dispatch({ type: 'SET_TAB',       tab }),             [])
  const togglePusher = useCallback((tabKey, side, idx) => dispatch({ type: 'TOGGLE_PUSHER', tabKey, side, idx }), [])
  const setParam     = useCallback((tabKey, key, val)  => dispatch({ type: 'SET_PARAM',     tabKey, key, value: val }), [])
  const start        = useCallback(()                  => dispatch({ type: 'START' }),                          [])
  const pause        = useCallback(()                  => dispatch({ type: 'PAUSE' }),                          [])
  const reset        = useCallback(()                  => dispatch({ type: 'RESET' }),                          [])
  const tick         = useCallback((dt)                => dispatch({ type: 'TICK', dt }),                       [])

  return { state, setTab, togglePusher, setParam, start, pause, reset, tick }
}
