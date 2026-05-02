import { useState, useCallback } from 'react'
import { SimCanvas } from '../Simulator/SimCanvas.jsx'
import { Slider } from '../Common/Slider.jsx'
import { Button } from '../Common/Button.jsx'
import { formatNum } from '../../lib/bangla.js'
import strings from '../../content/junior.bn.json'
import styles from './JuniorScreen.module.css'

export function JuniorScreen({ state, setParam, setAnimation, reset }) {
  const [showExplainer, setShowExplainer] = useState(false)
  const [explainerPage, setExplainerPage] = useState(0)
  const [celebration, setCelebration] = useState(false)

  const s = strings
  const { params, animation, results, degenerate, display } = state
  const fmt = (v, d = 1) => formatNum(v, display.numerals, d)

  const handleAnimTick = useCallback((t, status) => {
    setAnimation({ t, status })
    if (status === 'finished') setCelebration(true)
  }, [setAnimation])

  const handleLaunch = () => {
    if (degenerate) return
    setCelebration(false)
    setAnimation({ status: 'playing', t: 0, speed: 1 })
  }

  const handleReset = () => {
    setCelebration(false)
    reset()
  }

  const isIdle = animation.status === 'idle'
  const isFinished = animation.status === 'finished'

  return (
    <div className={styles.screen}>
      {/* Canvas */}
      <div className={styles.canvasWrap}>
        <SimCanvas state={state} onAnimTick={handleAnimTick} />
        {celebration && <Confetti />}
        <button className={styles.explainerBtn} onClick={() => setShowExplainer(true)}>
          <span className="bn">{s.buttons.explainer}</span>
        </button>
      </div>

      {/* Outcome readouts (shown after launch) */}
      {isFinished && (
        <div className={styles.outcomes}>
          <ReadoutCard label={s.readouts.range}  value={`${fmt(results.R)} ${s.readouts.rangeUnit}`} />
          <ReadoutCard label={s.readouts.height} value={`${fmt(results.H)} ${s.readouts.heightUnit}`} />
          <ReadoutCard label={s.readouts.time}   value={`${fmt(results.T, 2)} ${s.readouts.timeUnit}`} />
        </div>
      )}

      {/* Degenerate hint */}
      {degenerate && (
        <p className={`${styles.hint} bn`}>
          {degenerate === 'no-velocity' ? s.errors.noVelocity : s.errors.flat}
        </p>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.sliders}>
          <SliderRow
            label={s.controls.speed}
            min={1} max={50} value={params.v0}
            onChange={v => setParam('v0', v)}
            leftLabel={s.controls.speedSlow}
            rightLabel={s.controls.speedFast}
          />
          <SliderRow
            label={s.controls.angle}
            min={5} max={85} value={params.theta}
            onChange={v => setParam('theta', v)}
            leftLabel={s.controls.angleLow}
            rightLabel={s.controls.angleHigh}
          />
        </div>
        <div className={styles.btnRow}>
          {(isIdle || isFinished) ? (
            <Button variant="primary" fullWidth size="lg" pulse={isIdle && !degenerate} onClick={handleLaunch} disabled={!!degenerate}>
              <span className="bn">{s.buttons.launch}</span>
            </Button>
          ) : null}
          {isFinished && (
            <Button variant="secondary" fullWidth onClick={handleReset}>
              <span className="bn">{s.buttons.reset}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Explainer modal */}
      {showExplainer && (
        <div className={styles.overlay} onClick={() => setShowExplainer(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={`${styles.modalTitle} bn`}>{s.explainer.title}</h2>
              <button className={styles.closeBtn} onClick={() => setShowExplainer(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <h3 className={`${styles.exHeading} bn`}>{s.explainer.pages[explainerPage].heading}</h3>
              <p className={`${styles.exBody} bn`}>{s.explainer.pages[explainerPage].body}</p>
            </div>
            <div className={styles.modalFooter}>
              <div className={styles.dots}>
                {s.explainer.pages.map((_, i) => (
                  <div key={i} className={`${styles.dot} ${i === explainerPage ? styles.dotActive : ''}`} onClick={() => setExplainerPage(i)} />
                ))}
              </div>
              <div className={styles.navBtns}>
                {explainerPage > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setExplainerPage(p => p - 1)}>
                    <span className="bn">← আগে</span>
                  </Button>
                )}
                {explainerPage < s.explainer.pages.length - 1 ? (
                  <Button variant="primary" size="sm" onClick={() => setExplainerPage(p => p + 1)}>
                    <span className="bn">পরে →</span>
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => setShowExplainer(false)}>
                    <span className="bn">{s.explainer.close}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SliderRow({ label, min, max, value, onChange, leftLabel, rightLabel }) {
  return (
    <div className={styles.sliderRow}>
      <span className={`${styles.sliderLabel} bn`}>{label}</span>
      <div className={styles.sliderWrap}>
        <span className={`${styles.edge} bn`}>{leftLabel}</span>
        <input type="range" className={styles.slider} min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} />
        <span className={`${styles.edge} bn`}>{rightLabel}</span>
      </div>
    </div>
  )
}

function ReadoutCard({ label, value }) {
  return (
    <div className={styles.outcomeCard}>
      <span className={`${styles.outcomeLabel} bn`}>{label}</span>
      <span className={`${styles.outcomeValue} bn`}>{value}</span>
    </div>
  )
}

function Confetti() {
  const colors = ['#1CAB55', '#E8001D', '#274FE3', '#EA580C', '#FFD600']
  return (
    <div className={styles.confettiWrap} aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.4}s`,
            background: colors[i % colors.length],
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
          }}
        />
      ))}
    </div>
  )
}
