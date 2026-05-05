import { useRef, useEffect, useCallback } from 'react'
import { useViewport } from '../../hooks/useViewport.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'

export function ForceCanvas({ drawFn, state, onTick, children }) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const { width, height } = useViewport(containerRef)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height) return
    const ctx = canvas.getContext('2d')
    drawFn(ctx, width, height, state)
  }, [drawFn, state, width, height])

  useAnimationFrame((delta) => {
    if (state.isRunning) {
      onTick(delta)
    } else {
      draw()
    }
  }, true)

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && width && height) {
      canvas.width  = width
      canvas.height = height
      draw()
    }
  }, [width, height, draw])

  return (
    <div ref={containerRef} style={{ flex: 1, minHeight: '220px', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />
      {children && typeof children === 'function' ? children({ width, height }) : children}
    </div>
  )
}
