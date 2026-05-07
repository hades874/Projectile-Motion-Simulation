import { ForceCanvas } from './ForceCanvas.jsx'
import { drawMotion, wx, groundY } from '../../lib/forceCanvas.js'
import { OBJECTS, frictionForce, netMotionForce, accel } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { Toggle } from '../Common/Toggle.jsx'
import { GuideCard } from '../Common/GuideCard.jsx'
import strings from '../../content/forces.bn.json'
import styles from './Forces.module.css'

const s = strings.motion

function CSSObject({ type, isMoving, flipped }) {
  if (type === 'car') {
    return (
      <div className={`${styles.carContainer} ${!isMoving ? styles.notMoving : ''} ${flipped ? styles.flipped : ''}`}>
        <div className={styles.carShadow} />
        <div className={styles.carBouncer}>
          <div className={styles.carTop}>
            <div className={styles.window} />
          </div>
          <div className={styles.carBody}>
            <div className={styles.headlight} />
            <div className={styles.taillight} />
          </div>
          <div className={`${styles.wheel} ${styles.wheelFront}`} />
          <div className={`${styles.wheel} ${styles.wheelBack}`} />
        </div>
      </div>
    )
  }
  return <div className={styles[type]} />
}

export function MotionTab({ state, setParam, start, pause, reset, tick }) {
  const { Fapplied, selectedObject, frictionOn, boxX, boxV, isRunning } = state
  const obj = OBJECTS[selectedObject]
  const Ff  = frictionOn ? frictionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV) : 0
  const a   = accel(netMotionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV, frictionOn), obj.mass)

  // Object sizes for positioning
  const sizes = { ice: 60, car: 160, fridge: 50, box: 70 }
  const size = sizes[selectedObject] || 50
  const objH = selectedObject === 'car' ? 90 : size

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawMotion} state={state} onTick={tick}>
        {({ width, height }) => {
          const gy = groundY(height)
          const boxSX = wx(boxX, width)

          return (
            <>
              {/* Object */}
              <div
                className={styles.objectContainer}
                style={{
                  left: boxSX - (selectedObject === 'car' ? 80 : size / 2),
                  top: gy - objH - 2,
                  width: selectedObject === 'car' ? 160 : size,
                  height: objH
                }}
              >
                <CSSObject 
                  type={selectedObject} 
                  isMoving={isRunning && Math.abs(boxV) > 0.05}
                  flipped={Fapplied < 0}
                />
              </div>
            </>
          )
        }}
      </ForceCanvas>

      <div className={styles.panel}>
        <div className={styles.instructionBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--info)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className={`${styles.instructionText} bn`}>{s.hint}</p>
        </div>
        <GuideCard title={strings.guideTitle} items={s.guides} />
        <div className={styles.paramRow}>
          <div className={styles.paramHeader}>
            <span className={`${styles.paramName} bn`}>{s.appliedForce}</span>
            <span className={styles.paramValue}>{Fapplied.toFixed(0)} N</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min={-500} max={500} step={5}
            value={Fapplied}
            onChange={e => setParam('motion', 'Fapplied', Number(e.target.value))}
          />
        </div>

        <div className={styles.section}>
          <span className={`${styles.sectionLabel} bn`}>বস্তু নির্বাচন</span>
          <div className={styles.objectRow}>
            {Object.entries(OBJECTS).map(([key, o]) => (
              <button
                key={key}
                className={`${styles.objectBtn} ${selectedObject === key ? styles.selected : ''}`}
                onClick={() => setParam('motion', 'selectedObject', key)}
              >
                <span className="bn">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.frictionRow}>
          <span className={`${styles.frictionLabel} bn`}>{s.frictionLabel}</span>
          <Toggle
            checked={frictionOn}
            onChange={() => setParam('motion', 'frictionOn', !frictionOn)}
            label={frictionOn ? s.frictionOn : s.frictionOff}
          />
        </div>

        <div className={styles.readouts}>
          <ReadoutCard label={s.readouts.velocity}  value={`${boxV.toFixed(1)} মি/সে`} />
          <ReadoutCard label={s.readouts.accel}      value={`${a.toFixed(2)} মি/সে²`} />
          <ReadoutCard label={s.readouts.appliedF}   value={`${Fapplied.toFixed(0)} N`} />
          <ReadoutCard label={s.readouts.frictionF}  value={`${Math.abs(Ff).toFixed(0)} N`} />
        </div>

        <div className={styles.actions}>
          {isRunning ? (
            <Button variant="secondary" onClick={pause}><span className="bn">{strings.actions.pause}</span></Button>
          ) : (
            <Button variant="primary"   onClick={start}><span className="bn">{strings.actions.start}</span></Button>
          )}
          <Button variant="ghost" onClick={reset}><span className="bn">{strings.actions.reset}</span></Button>
        </div>
      </div>
    </div>
  )
}

function ReadoutCard({ label, value }) {
  return (
    <div className={styles.readoutCard}>
      <span className={`${styles.readoutLabel} bn`}>{label}</span>
      <span className={styles.readoutValue}>{value}</span>
    </div>
  )
}
