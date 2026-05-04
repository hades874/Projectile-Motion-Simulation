import { ForceCanvas } from './ForceCanvas.jsx'
import { drawFriction } from '../../lib/forceCanvas.js'
import { SURFACES, frictionForce, GRAVITY } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import strings from '../../content/forces.bn.json'
import styles from './Forces.module.css'

const s = strings.friction

export function FrictionTab({ state, setParam, start, pause, reset, tick }) {
  const { Fapplied, surface, mass, boxX, boxV, isRunning } = state
  const surf   = SURFACES[surface]
  const Ff     = frictionForce(Fapplied, mass, surf.mu_s, surf.mu_k, boxV)
  const Fs_max = (surf.mu_s * mass * GRAVITY).toFixed(1)

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawFriction} state={state} onTick={tick} />

      <div className={styles.panel}>
        {/* Applied force slider */}
        <div className={styles.paramRow}>
          <div className={styles.paramHeader}>
            <span className={`${styles.paramName} bn`}>{s.appliedForce}</span>
            <span className={styles.paramValue}>{Fapplied.toFixed(0)} N</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min={0} max={500} step={5}
            value={Fapplied}
            onChange={e => setParam('friction', 'Fapplied', Number(e.target.value))}
          />
        </div>

        {/* Surface selector */}
        <div className={styles.section}>
          <span className={`${styles.sectionLabel} bn`}>তলের ধরন</span>
          <div className={styles.surfaceRow}>
            {Object.entries(SURFACES).map(([key, sf]) => (
              <button
                key={key}
                className={`${styles.surfaceBtn} ${surface === key ? styles.selected : ''}`}
                onClick={() => setParam('friction', 'surface', key)}
              >
                <span className="bn">{sf.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Readouts */}
        <div className={styles.readouts}>
          <ReadoutCard label="প্রযুক্ত বল"       value={`${Fapplied.toFixed(0)} N`} />
          <ReadoutCard label="ঘর্ষণ বল"          value={`${Math.abs(Ff).toFixed(0)} N`} />
          <ReadoutCard label="সর্বোচ্চ স্থিতি ঘর্ষণ" value={`${Fs_max} N`} />
          <ReadoutCard label="বেগ"               value={`${boxV.toFixed(1)} m/s`} />
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

        <p className={`${styles.hint} bn`}>{s.hint}</p>
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
