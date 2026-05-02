import { useCallback } from 'react'
import { SimCanvas } from '../Simulator/SimCanvas.jsx'
import { Slider } from '../Common/Slider.jsx'
import { NumberInput } from '../Common/NumberInput.jsx'
import { Button } from '../Common/Button.jsx'
import { Toggle } from '../Common/Toggle.jsx'
import { Tooltip } from '../Common/Tooltip.jsx'
import { Readouts } from '../Simulator/Readouts.jsx'
import { FormulaPanel } from '../Simulator/FormulaPanel.jsx'
import { GraphsPanel } from '../Simulator/GraphsPanel.jsx'
import { ComparisonPanel } from '../Simulator/ComparisonPanel.jsx'
import { BottomSheet } from './BottomSheet.jsx'
import glossary from '../../content/glossary.bn.json'
import strings from '../../content/senior.bn.json'
import styles from './SeniorScreen.module.css'

const SPEED_OPTIONS = [0.5, 1, 2]

export function SeniorScreen({ state, setParam, setAnimation, toggleOverlay, setComparison, reset }) {
  const s = strings
  const { params, animation, results, overlays, comparison, degenerate, display } = state
  const isPlaying = animation.status === 'playing'
  const isPaused  = animation.status === 'paused'
  const isIdle    = animation.status === 'idle'
  const isFinished = animation.status === 'finished'

  const handleAnimTick = useCallback((t, status) => {
    setAnimation({ t, status })
  }, [setAnimation])

  const handleLaunch = () => {
    if (degenerate) return
    setAnimation({ status: 'playing', t: 0, speed: animation.speed })
  }

  const handlePause = () => setAnimation({ status: 'paused' })
  const handleResume = () => setAnimation({ status: 'playing' })
  const handleReset = () => reset()
  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(animation.speed)
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
    setAnimation({ speed: next })
  }

  const readoutStrings = s.readouts
  const showImpact = isFinished || isPlaying

  const tabs = [
    { id: 'vectors', label: s.tabs.vectors },
    { id: 'formulas', label: s.tabs.formulas },
    { id: 'graphs', label: s.tabs.graphs },
    { id: 'comparison', label: s.tabs.comparison },
  ]

  const tabContents = {
    vectors: (
      <div className={styles.overlayToggles}>
        <Toggle checked={overlays.vectors}   onChange={() => toggleOverlay('vectors')}  label={s.overlays.vectors} />
        <Toggle checked={overlays.dots}      onChange={() => toggleOverlay('dots')}     label={s.overlays.dots} />
        <Toggle checked={overlays.axes}      onChange={() => toggleOverlay('axes')}     label={s.overlays.axes} />
      </div>
    ),
    formulas: <FormulaPanel params={params} results={results} strings={s.formulas} numerals={display.numerals} />,
    graphs: <GraphsPanel points={state.points} results={results} />,
    comparison: <ComparisonPanel comparison={comparison} onSet={setComparison} />,
  }

  return (
    <div className={styles.screen}>
      {/* Canvas */}
      <div className={styles.canvasWrap}>
        <SimCanvas state={state} onAnimTick={handleAnimTick} />
      </div>

      {/* Readouts strip */}
      <Readouts
        results={results}
        impact={showImpact ? results.impact : null}
        strings={{ ...readoutStrings }}
        numerals={display.numerals}
      />

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.paramRow}>
          <Tooltip text={glossary.v0}>
            <div className={styles.paramBlock}>
              <Slider label={s.controls.v0} value={params.v0} min={1} max={100} step={1} onChange={v => setParam('v0', v)} unit=" m/s" />
              <NumberInput label={s.controls.v0} value={params.v0} min={1} max={100} step={0.1} onChange={v => setParam('v0', v)} unit="m/s" />
            </div>
          </Tooltip>
          <Tooltip text={glossary.theta}>
            <div className={styles.paramBlock}>
              <Slider label={s.controls.theta} value={params.theta} min={1} max={89} step={1} onChange={v => setParam('theta', v)} unit="°" />
              <NumberInput label={s.controls.theta} value={params.theta} min={1} max={89} step={0.1} onChange={v => setParam('theta', v)} unit="°" />
            </div>
          </Tooltip>
          <Tooltip text={glossary.h0}>
            <div className={styles.paramBlock}>
              <Slider label={s.controls.h0} value={params.h0} min={0} max={50} step={1} onChange={v => setParam('h0', v)} unit=" m" />
              <NumberInput label={s.controls.h0} value={params.h0} min={0} max={50} step={0.1} onChange={v => setParam('h0', v)} unit="m" />
            </div>
          </Tooltip>
        </div>

        {degenerate && (
          <p className={`${styles.hint} bn`}>
            {degenerate === 'no-velocity' ? s.errors.noVelocity : s.errors.flat}
          </p>
        )}

        <div className={styles.actionRow}>
          {isIdle || isFinished ? (
            <Button variant="primary" onClick={handleLaunch} disabled={!!degenerate}>
              <span className="bn">{s.buttons.launch}</span>
            </Button>
          ) : isPlaying ? (
            <Button variant="secondary" onClick={handlePause}>
              <span className="bn">{s.buttons.pause}</span>
            </Button>
          ) : isPaused ? (
            <Button variant="primary" onClick={handleResume}>
              <span className="bn">{s.buttons.resume}</span>
            </Button>
          ) : null}

          {(isPlaying || isPaused) && (
            <Button variant="ghost" onClick={cycleSpeed}>
              <span className="bn">{animation.speed}×</span>
            </Button>
          )}

          <Button variant="ghost" onClick={handleReset}>
            <span className="bn">{s.buttons.reset}</span>
          </Button>
        </div>
      </div>

      {/* Bottom sheet */}
      <BottomSheet tabs={tabs}>{tabContents}</BottomSheet>
    </div>
  )
}
