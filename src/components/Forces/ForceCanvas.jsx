import { useRef, useEffect, useCallback } from 'react'
import { useViewport } from '../../hooks/useViewport.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'

export function ForceCanvas({ drawFn, state, onTick, children }) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const { width, height } = useViewport(containerRef)
  const { language } = useLanguage()
  const strings = getTranslations(language).forces

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    ctx.save()
    ctx.scale(dpr, dpr)
    drawFn(ctx, width, height, state, language, strings)
    ctx.restore()
  }, [drawFn, state, width, height, language, strings])

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
      const dpr = window.devicePixelRatio || 1
      canvas.width  = width * dpr
      canvas.height = height * dpr
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
