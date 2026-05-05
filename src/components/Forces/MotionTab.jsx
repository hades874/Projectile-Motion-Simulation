import { ForceCanvas } from './ForceCanvas.jsx'
import { drawMotion } from '../../lib/forceCanvas.js'
import { OBJECTS, frictionForce, netMotionForce, accel } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { Toggle } from '../Common/Toggle.jsx'
import { GuideCard } from '../Common/GuideCard.jsx'
import strings from '../../content/forces.bn.json'
import styles from './Forces.module.css'

const s = strings.motion

export function MotionTab({ state, setParam, start, pause, reset, tick }) {
  const { Fapplied, selectedObject, frictionOn, boxX, boxV, isRunning } = state
  const obj = OBJECTS[selectedObject]
  const Ff  = frictionOn ? frictionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV) : 0
  const a   = accel(netMotionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV, frictionOn), obj.mass)

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawMotion} state={state} onTick={tick} />

      <div className={styles.panel}>
        <GuideCard title={strings.guideTitle} items={s.guides} />
        {/* Applied force slider */}
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

        {/* Object selector */}
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

        {/* Friction toggle */}
        <div className={styles.frictionRow}>
          <span className={`${styles.frictionLabel} bn`}>{s.frictionLabel}</span>
          <Toggle
            checked={frictionOn}
            onChange={() => setParam('motion', 'frictionOn', !frictionOn)}
            label={frictionOn ? s.frictionOn : s.frictionOff}
          />
        </div>

        {/* Readouts */}
        <div className={styles.readouts}>
          <ReadoutCard label={s.readouts.velocity}  value={`${boxV.toFixed(1)} মি/সে`} />
          <ReadoutCard label={s.readouts.accel}      value={`${a.toFixed(2)} মি/সে²`} />
          <ReadoutCard label={s.readouts.appliedF}   value={`${Fapplied.toFixed(0)} N`} />
          <ReadoutCard label={s.readouts.frictionF}  value={`${Math.abs(Ff).toFixed(0)} N`} />
        </div>

        {/* Actions */}
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
