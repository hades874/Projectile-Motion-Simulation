import { useReducer, useCallback } from 'react'
import { computeResults, trajectoryPoints, isDegenerate } from '../lib/physics.js'

const DEFAULTS = {
  junior:  { v0: 20, theta: 45, h0: 0, projectileType: 'ball' },
  senior:  { v0: 20, theta: 45, h0: 0, projectileType: 'cannonball' },
}

function makeInitialState(mode = 'senior') {
  const params = { ...DEFAULTS[mode], g: 9.8 }
  return {
    mode,
    params,
    comparison: null,
    animation: { status: 'idle', t: 0, speed: 1 },
    overlays: { vectors: false, dots: false, axes: true, formulas: false, graphs: false },
    display: { numerals: 'bangla' },
    results: computeResults(params.v0, params.theta, params.h0),
    points: trajectoryPoints(params.v0, params.theta, params.h0),
    degenerate: isDegenerate(params.v0, params.theta, params.h0),
  }
}

function recalc(state) {
  const { v0, theta, h0 } = state.params
  return {
    ...state,
    results: computeResults(v0, theta, h0),
    points: trajectoryPoints(v0, theta, h0),
    degenerate: isDegenerate(v0, theta, h0),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARAM': {
      const params = { ...state.params, [action.key]: action.value }
      return recalc({ ...state, params, animation: { ...state.animation, status: 'idle', t: 0 } })
    }
    case 'SET_MODE':
      return makeInitialState(action.mode)
    case 'SET_ANIMATION':
      return { ...state, animation: { ...state.animation, ...action.payload } }
    case 'TOGGLE_OVERLAY':
      return { ...state, overlays: { ...state.overlays, [action.key]: !state.overlays[action.key] } }
    case 'TOGGLE_NUMERALS': {
      const next = state.display.numerals === 'bangla' ? 'western' : 'bangla'
      return { ...state, display: { ...state.display, numerals: next } }
    }
    case 'SET_COMPARISON': {
      if (!action.params) return { ...state, comparison: null }
      const cp = { ...action.params }
      return {
        ...state,
        comparison: {
          params: cp,
          points: trajectoryPoints(cp.v0, cp.theta, cp.h0),
          results: computeResults(cp.v0, cp.theta, cp.h0),
        },
      }
    }
    case 'RESET':
      return makeInitialState(state.mode)
    default:
      return state
  }
}

export function useSimulator(initialMode = 'senior') {
  const [state, dispatch] = useReducer(reducer, initialMode, makeInitialState)

  const setParam       = useCallback((key, value) => dispatch({ type: 'SET_PARAM', key, value }), [])
  const setMode        = useCallback((mode) => dispatch({ type: 'SET_MODE', mode }), [])
  const setAnimation   = useCallback((payload) => dispatch({ type: 'SET_ANIMATION', payload }), [])
  const toggleOverlay  = useCallback((key) => dispatch({ type: 'TOGGLE_OVERLAY', key }), [])
  const toggleNumerals = useCallback(() => dispatch({ type: 'TOGGLE_NUMERALS' }), [])
  const setComparison  = useCallback((params) => dispatch({ type: 'SET_COMPARISON', params }), [])
  const reset          = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, setParam, setMode, setAnimation, toggleOverlay, toggleNumerals, setComparison, reset }
}
