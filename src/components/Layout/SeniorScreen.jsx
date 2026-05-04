import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SimCanvas }       from '../Simulator/SimCanvas.jsx'
import { Button }          from '../Common/Button.jsx'
import { Toggle }          from '../Common/Toggle.jsx'
import { Tooltip }         from '../Common/Tooltip.jsx'
import { FormulaPanel }    from '../Simulator/FormulaPanel.jsx'
import { GraphsPanel }     from '../Simulator/GraphsPanel.jsx'
import { ComparisonPanel } from '../Simulator/ComparisonPanel.jsx'
import { BottomSheet }     from './BottomSheet.jsx'
import { formatNum }       from '../../lib/bangla.js'
import glossary  from '../../content/glossary.bn.json'
import strings   from '../../content/senior.bn.json'
import styles    from './SeniorScreen.module.css'

const SPEED_OPTIONS = [0.5, 1, 2]

export function SeniorScreen({ state, setParam, setAnimation, toggleOverlay, toggleNumerals, setComparison, reset }) {
  const navigate = useNavigate()
  const s = strings
  const { params, animation, results, overlays, comparison, degenerate, display } = state
  const isPlaying  = animation.status === 'playing'
  const isPaused   = animation.status === 'paused'
  const isIdle     = animation.status === 'idle'
  const isFinished = animation.status === 'finished'
  const showImpact = isFinished || isPlaying

  const fmt = (v, d = 1) => formatNum(v ?? 0, display.numerals, d)

  const handleAnimTick = useCallback((t, status) => setAnimation({ t, status }), [setAnimation])
  const handleLaunch   = () => { if (!degenerate) setAnimation({ status: 'playing', t: 0, speed: animation.speed }) }
  const handlePause    = () => setAnimation({ status: 'paused' })
  const handleResume   = () => setAnimation({ status: 'playing' })
  const cycleSpeed     = () => {
    const next = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(animation.speed) + 1) % SPEED_OPTIONS.length]
    setAnimation({ speed: next })
  }

  const tabs = [
    { id: 'vectors',    label: s.tabs.vectors },
    { id: 'formulas',   label: s.tabs.formulas },
    { id: 'graphs',     label: s.tabs.graphs },
    { id: 'comparison', label: s.tabs.comparison },
  ]

  const tabContents = {
    vectors: (
      <div className={styles.overlayToggles}>
        <Toggle checked={overlays.vectors} onChange={() => toggleOverlay('vectors')} label={s.overlays.vectors} />
        <Toggle checked={overlays.dots}    onChange={() => toggleOverlay('dots')}    label={s.overlays.dots} />
        <Toggle checked={overlays.axes}    onChange={() => toggleOverlay('axes')}    label={s.overlays.axes} />
      </div>
    ),
    formulas:   <FormulaPanel params={params} results={results} strings={s.formulas} numerals={display.numerals} />,
    graphs:     <GraphsPanel points={state.points} results={results} />,
    comparison: <ComparisonPanel comparison={comparison} onSet={setComparison} />,
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="পেছনে">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className={styles.logo}>10MS</span>
        <h1 className={`${styles.title} bn`}>{s.appTitle}</h1>
        <div className={styles.headerSpacer} />
        <button className={styles.numeralBtn} onClick={toggleNumerals} title="সংখ্যা পদ্ধতি বদলাও">
          {display.numerals === 'bangla' ? '০৯' : '09'}
        </button>
      </header>

      {/* Main: canvas + controls panel */}
      <div className={styles.mainArea}>
        {/* Canvas */}
        <div className={styles.canvasWrap}>
          <SimCanvas state={state} onAnimTick={handleAnimTick} />
        </div>

        {/* Right panel: params + results */}
        <div className={styles.controlsPanel}>
          {/* Parameters */}
          <div className={styles.paramsSection}>
            <ParamRow
              label={s.controls.v0}
              glossaryText={glossary.v0}
              value={params.v0} min={1} max={100} step={1}
              unit="m/s"
              numerals={display.numerals}
              onChange={v => setParam('v0', v)}
            />
            <ParamRow
              label={s.controls.theta}
              glossaryText={glossary.theta}
              value={params.theta} min={1} max={89} step={1}
              unit="°"
              numerals={display.numerals}
              onChange={v => setParam('theta', v)}
            />
            <ParamRow
              label={s.controls.h0}
              glossaryText={glossary.h0}
              value={params.h0} min={0} max={50} step={1}
              unit="m"
              numerals={display.numerals}
              onChange={v => setParam('h0', v)}
            />
          </div>

          {/* Degenerate hint */}
          {degenerate && (
            <p className={`${styles.hint} bn`}>
              {degenerate === 'no-velocity' ? s.errors.noVelocity : s.errors.flat}
            </p>
          )}

          {/* Result cards */}
          <div className={styles.resultsGrid}>
            <ResultCard label="R" value={fmt(results.R)} unit={s.readouts.rangeUnit}    color="var(--success)" />
            <ResultCard label="H" value={fmt(results.H)} unit={s.readouts.heightUnit}   color="var(--info)" />
            <ResultCard label="T" value={fmt(results.T, 2)} unit={s.readouts.timeUnit}  color="var(--warn)" />
            {showImpact && results.impact && (
              <ResultCard
                label="v_imp"
                value={fmt(results.impact.speed, 1)}
                unit={s.readouts.speedUnit}
                color="#9333EA"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className={styles.actionBar}>
        {(isIdle || isFinished) && (
          <Button variant="primary" onClick={handleLaunch} disabled={!!degenerate}>
            <span className="bn">{s.buttons.launch}</span>
          </Button>
        )}
        {isPlaying && (
          <Button variant="secondary" onClick={handlePause}>
            <span className="bn">{s.buttons.pause}</span>
          </Button>
        )}
        {isPaused && (
          <Button variant="primary" onClick={handleResume}>
            <span className="bn">{s.buttons.resume}</span>
          </Button>
        )}
        {(isPlaying || isPaused) && (
          <Button variant="ghost" onClick={cycleSpeed}>
            <span className="bn">{animation.speed}×</span>
          </Button>
        )}
        <Button variant="ghost" onClick={reset}>
          <span className="bn">{s.buttons.reset}</span>
        </Button>
      </div>

      {/* Bottom sheet */}
      <BottomSheet tabs={tabs}>{tabContents}</BottomSheet>
    </div>
  )
}

function ParamRow({ label, glossaryText, value, min, max, step, unit, numerals, onChange }) {
  return (
    <div className={styles.paramRow}>
      <div className={styles.paramHeader}>
        <Tooltip text={glossaryText}>
          <span className={`${styles.paramLabel} bn`}>{label}</span>
        </Tooltip>
        <span className={styles.paramValue}>{value}{unit}</span>
      </div>
      <input
        type="range"
        className={styles.rangeSlider}
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ResultCard({ label, value, unit, color }) {
  return (
    <div className={styles.resultCard}>
      <span className={styles.resultLabel} style={{ color }}>{label}</span>
      <span className={`${styles.resultValue} bn`}>{value}</span>
      <span className={styles.resultUnit}>{unit}</span>
    </div>
  )
}
