import { useState, useEffect, useRef } from 'react'

export function useViewport(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ width: Math.floor(width), height: Math.floor(height) })
    })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])

  return size
}
