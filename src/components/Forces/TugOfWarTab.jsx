import { ForceCanvas } from './ForceCanvas.jsx'
import { drawTug } from '../../lib/forceCanvas.js'
import { FORCE_PER_PERSON, ROPE_MASS } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { GuideCard } from '../Common/GuideCard.jsx'
import strings from '../../content/forces.bn.json'
import styles from './Forces.module.css'

const s = strings.tug

function PersonIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden>
      <circle cx="12" cy="5" r="3.5" />
      <path d="M12 10c-3.5 0-6 2-6 4.5V20h12v-5.5C18 12 15.5 10 12 10z" />
    </svg>
  )
}

export function TugOfWarTab({ state, togglePusher, start, pause, reset, tick }) {
  const { leftTeam, rightTeam, ropeX, ropeV, isRunning, winner } = state
  const lCount = leftTeam.filter(Boolean).length
  const rCount = rightTeam.filter(Boolean).length
  const Fnet   = (rCount - lCount) * FORCE_PER_PERSON
  const a      = (Fnet / ROPE_MASS).toFixed(1)

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawTug} state={state} onTick={tick} />

      <div className={styles.panel}>
        <GuideCard title={strings.guideTitle} items={s.guides} />
        {winner && (
          <div style={{
            background: '#ECFDF5', border: '1px solid var(--success)',
            borderRadius: 'var(--r-md)', padding: 'var(--s-3)',
            textAlign: 'center', fontFamily: 'var(--font-bangla)', fontWeight: 700,
            color: 'var(--success-text)',
          }}>
            <span className="bn">{winner === 'right' ? s.winRight : s.winLeft}</span>
          </div>
        )}

        {/* Left team (red) */}
        <div className={styles.section}>
          <span className={`${styles.sectionLabel} bn`} style={{ color: '#E8001D' }}>{s.leftTeam}</span>
          <div className={styles.pusherRow}>
            {leftTeam.map((active, i) => (
              <button
                key={i}
                className={`${styles.personBtn} ${styles.personBtnLeft} ${active ? styles.personActive : ''}`}
                onClick={() => togglePusher('tug', 'leftTeam', i)}
                aria-pressed={active}
              >
                <PersonIcon color={active ? '#E8001D' : '#D1D5DB'} />
              </button>
            ))}
          </div>
        </div>

        {/* Right team (blue) */}
        <div className={styles.section}>
          <span className={`${styles.sectionLabel} bn`} style={{ color: '#274FE3' }}>{s.rightTeam}</span>
          <div className={styles.pusherRow}>
            {rightTeam.map((active, i) => (
              <button
                key={i}
                className={`${styles.personBtn} ${styles.personBtnRight} ${active ? styles.personActive : ''}`}
                onClick={() => togglePusher('tug', 'rightTeam', i)}
                aria-pressed={active}
              >
                <PersonIcon color={active ? '#274FE3' : '#D1D5DB'} />
              </button>
            ))}
          </div>
        </div>

        {/* Readouts */}
        <div className={styles.readouts}>
          <ReadoutCard
            label={strings.netforce.readouts.netForce}
            value={`${Fnet >= 0 ? '+' : ''}${Fnet} N`}
            color={Fnet === 0 ? '#6B7280' : Fnet > 0 ? '#274FE3' : '#E8001D'}
          />
          <ReadoutCard label={strings.netforce.readouts.accel}    value={`${a} মি/সে²`} />
          <ReadoutCard label={strings.netforce.readouts.velocity} value={`${ropeV.toFixed(1)} মি/সে`} />
          <ReadoutCard label={strings.netforce.readouts.position} value={`${ropeX.toFixed(1)} মি`} />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isRunning ? (
            <Button variant="secondary" onClick={pause}><span className="bn">{strings.actions.pause}</span></Button>
          ) : (
            <Button variant="primary"   onClick={winner ? reset : start}>
              <span className="bn">{winner ? strings.actions.reset : strings.actions.start}</span>
            </Button>
          )}
          {!winner && (
            <Button variant="ghost" onClick={reset}><span className="bn">{strings.actions.reset}</span></Button>
          )}
        </div>

        <p className={`${styles.hint} bn`}>{s.hint}</p>
      </div>
    </div>
  )
}

function ReadoutCard({ label, value, color }) {
  return (
    <div className={styles.readoutCard}>
      <span className={`${styles.readoutLabel} bn`}>{label}</span>
      <span className={styles.readoutValue} style={color ? { color } : undefined}>{value}</span>
    </div>
  )
}
