import { useRef, useEffect, useCallback } from 'react'
import { useViewport } from '../../hooks/useViewport.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'
import { position, velocity } from '../../lib/physics.js'
import {
  computeScale, drawGrid, drawAxes, drawGround,
  drawTrajectory, drawBall, drawTrajectoryDots,
  drawVectors, drawLauncher, drawBackground,
  drawDimensionLines, drawImpactMarker,
} from '../../lib/canvas.js'
import styles from './SimCanvas.module.css'

const PROJECTILE_TYPES = {
  ball:       { color: '#1CAB55', radius: 9 },
  cannonball: { color: '#374151', radius: 11 },
  stone:      { color: '#92400e', radius: 8 },
  football:   { color: '#F97316', radius: 9 },
}

export function SimCanvas({ state, onAnimTick, isComparisonInstance = false }) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const { width, height } = useViewport(containerRef)

  const { params, points, results, animation, overlays, comparison, degenerate } = state
  const isPlaying  = animation.status === 'playing'
  const isPaused   = animation.status === 'paused'
  const isFinished = animation.status === 'finished'
  const isIdle     = animation.status === 'idle'

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    ctx.save()
    ctx.scale(dpr, dpr)

    const { color: ballColor, radius: ballRadius } = PROJECTILE_TYPES[params.projectileType ?? 'ball']

    drawBackground(ctx, width, height)

    // Unified scale for both projectiles: grid expands to fit the largest one
    const allPoints = comparison ? [...points, ...comparison.points] : points
    const maxH0     = comparison ? Math.max(params.h0, comparison.params.h0) : params.h0
    const { scale, offsetX, offsetY } = computeScale(allPoints, width, height, maxH0)

    if (overlays.axes) {
      drawGrid(ctx, scale, offsetX, offsetY, width, height)
      drawAxes(ctx, scale, offsetX, offsetY, width, height)
    }
    drawGround(ctx, offsetY, width)
    
    // Main Canon
    drawLauncher(ctx, offsetX, offsetY, params.theta, params.h0, scale)

    // Comparison Canon
    if (comparison) {
      drawLauncher(ctx, offsetX, offsetY, comparison.params.theta, comparison.params.h0, scale, true)
    }

    // Main trajectory drawing
    if (!degenerate || degenerate === 'vertical') {
      if (isPlaying || isPaused) {
        drawTrajectory(ctx, points, scale, offsetX, offsetY, ballColor, false, 0.12)
        const frac = results.T > 0 ? Math.min(animation.t, results.T) / results.T : 0
        const endIdx = Math.min(Math.floor(frac * (points.length - 1)), points.length - 2)
        const partial = points.slice(0, endIdx + 2)
        drawTrajectory(ctx, partial, scale, offsetX, offsetY, ballColor, false, 1)
      } else {
        drawTrajectory(ctx, points, scale, offsetX, offsetY, ballColor, false, 1)
      }
    }

    // Ghost comparison trajectory
    if (comparison) {
      drawTrajectory(ctx, comparison.points, scale, offsetX, offsetY, '#EA580C', true, 0.7)
    }

    if (overlays.dots && (isPlaying || isPaused || isFinished)) {
      const dotT = isPlaying || isPaused ? Math.min(animation.t, results.T) : results.T
      drawTrajectoryDots(ctx, points, results.T, scale, offsetX, offsetY, ballColor, dotT)
    }

    // Dimension lines on idle / finished
    if ((isIdle || isFinished) && !degenerate) {
      drawDimensionLines(ctx, points, scale, offsetX, offsetY, results)
    }

    // Ball, vectors, impact
    const t      = animation.t
    const clampT = Math.min(t, results.T)

    if (!isIdle) {
      const pos = position(params.v0, params.theta, params.h0, clampT)
      drawBall(ctx, pos.x, pos.y, scale, offsetX, offsetY, ballColor, ballRadius)

      if (isFinished) {
        drawImpactMarker(ctx, pos.x, pos.y, scale, offsetX, offsetY, ballColor)
      }

      if (overlays.vectors && (isPlaying || isPaused)) {
        const vel = velocity(params.v0, params.theta, clampT)
        drawVectors(ctx, pos.x, pos.y, vel.vx, vel.vy, scale, offsetX, offsetY)
      }

      if (comparison && (isPlaying || isPaused)) {
        const cClamp = Math.min(t, comparison.results.T)
        const cp     = comparison.params
        const cpos   = position(cp.v0, cp.theta, cp.h0, cClamp)
        drawBall(ctx, cpos.x, cpos.y, scale, offsetX, offsetY, '#EA580C')

        if (overlays.vectors) {
          const cvel = velocity(cp.v0, cp.theta, cClamp)
          drawVectors(ctx, cpos.x, cpos.y, cvel.vx, cvel.vy, scale, offsetX, offsetY)
        }
      }
    } else {
      drawBall(ctx, 0, params.h0, scale, offsetX, offsetY, ballColor, ballRadius)
      
      if (overlays.vectors) {
        const vel = velocity(params.v0, params.theta, 0)
        drawVectors(ctx, 0, params.h0, vel.vx, vel.vy, scale, offsetX, offsetY)
      }

      if (comparison && overlays.vectors) {
        const cp = comparison.params
        const cvel = velocity(cp.v0, cp.theta, 0)
        drawVectors(ctx, 0, cp.h0, cvel.vx, cvel.vy, scale, offsetX, offsetY)
      }
    }

    ctx.restore()
  }, [width, height, points, params, results, animation, overlays, comparison, degenerate,
      isPlaying, isPaused, isFinished, isIdle])

  // RAF loop: advance time when playing, keep redrawing for background & impact ripple
  useAnimationFrame((delta) => {
    if (isPlaying) {
      const newT = animation.t + delta * animation.speed
      if (newT >= results.T) {
        onAnimTick(results.T, 'finished')
      } else {
        onAnimTick(newT, 'playing')
      }
    } else {
      draw()
    }
  }, true)

  useEffect(() => { draw() }, [draw, animation.t])

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
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
