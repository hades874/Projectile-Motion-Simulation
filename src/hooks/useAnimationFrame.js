import { useEffect, useRef, useCallback } from 'react'

export function useAnimationFrame(callback, active) {
  const rafRef = useRef(null)
  const lastRef = useRef(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!active) { stop(); return }
    const tick = (timestamp) => {
      const delta = lastRef.current ? (timestamp - lastRef.current) / 1000 : 0
      lastRef.current = timestamp
      callbackRef.current(delta)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return stop
  }, [active, stop])
}
