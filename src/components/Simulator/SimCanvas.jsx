import { useRef, useEffect, useCallback } from 'react'
import { useViewport } from '../../hooks/useViewport.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'
import { position, velocity } from '../../lib/physics.js'
import {
  computeScale, drawGrid, drawAxes, drawGround,
  drawTrajectory, drawBall, drawTrajectoryDots,
  drawVectors, drawLauncher,
} from '../../lib/canvas.js'
import styles from './SimCanvas.module.css'

export function SimCanvas({ state, onAnimTick }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const { width, height } = useViewport(containerRef)

  const { params, points, results, animation, overlays, comparison, degenerate } = state
  const isPlaying = animation.status === 'playing'

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, width, height)

    const { scale, offsetX, offsetY } = computeScale(points, width, height, params.h0)

    if (overlays.axes) {
      drawGrid(ctx, scale, offsetX, offsetY, width, height)
      drawAxes(ctx, scale, offsetX, offsetY, width, height)
    }
    drawGround(ctx, offsetY, width)
    drawLauncher(ctx, offsetX, offsetY, params.theta)

    // Ghost comparison trajectory
    if (comparison) {
      drawTrajectory(ctx, comparison.points, scale, offsetX, offsetY, '#EA580C', true)
      if (animation.status === 'finished' || animation.status === 'idle') {
        const cpos = position(comparison.params.v0, comparison.params.theta, comparison.params.h0, comparison.results.T)
        drawBall(ctx, cpos.x, cpos.y, scale, offsetX, offsetY, '#EA580C')
      }
    }

    // Main trajectory
    if (!degenerate || degenerate === 'vertical') {
      drawTrajectory(ctx, points, scale, offsetX, offsetY, '#1CAB55')
    } else {
      // flat case: draw a dot at origin
    }

    if (overlays.dots && results.T > 0) {
      drawTrajectoryDots(ctx, points, results.T, scale, offsetX, offsetY, '#1CAB55')
    }

    // Ball and vectors during / after animation
    const t = animation.t
    if (animation.status !== 'idle') {
      const clampT = Math.min(t, results.T)
      const pos = position(params.v0, params.theta, params.h0, clampT)
      drawBall(ctx, pos.x, pos.y, scale, offsetX, offsetY, '#1CAB55')

      if (overlays.vectors && animation.status === 'playing') {
        const vel = velocity(params.v0, params.theta, clampT)
        drawVectors(ctx, pos.x, pos.y, vel.vx, vel.vy, scale, offsetX, offsetY)
      }

      // Comparison ball
      if (comparison && animation.status === 'playing') {
        const cClampT = Math.min(t, comparison.results.T)
        const cpos = position(comparison.params.v0, comparison.params.theta, comparison.params.h0, cClampT)
        drawBall(ctx, cpos.x, cpos.y, scale, offsetX, offsetY, '#EA580C')
      }
    } else {
      // Idle: show ball at launch point
      drawBall(ctx, 0, params.h0, scale, offsetX, offsetY, '#1CAB55')
      if (overlays.vectors) {
        const vel = velocity(params.v0, params.theta, 0)
        drawVectors(ctx, 0, params.h0, vel.vx, vel.vy, scale, offsetX, offsetY)
      }
    }
  }, [width, height, points, params, results, animation, overlays, comparison, degenerate])

  useAnimationFrame((delta) => {
    if (animation.status !== 'playing') return
    const newT = animation.t + delta * animation.speed
    if (newT >= results.T) {
      onAnimTick(results.T, 'finished')
    } else {
      onAnimTick(newT, 'playing')
    }
  }, isPlaying)

  useEffect(() => { draw() }, [draw, animation.t])

  useEffect(() => {
    if (canvasRef.current && width && height) {
      canvasRef.current.width = width
      canvasRef.current.height = height
      draw()
    }
  }, [width, height, draw])

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
