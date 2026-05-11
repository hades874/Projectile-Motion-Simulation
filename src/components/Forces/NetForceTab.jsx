import { ForceCanvas } from './ForceCanvas.jsx'
import { drawNetForce } from '../../lib/forceCanvas.js'
import { FORCE_PER_PERSON, CART_MASS } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './Forces.module.css'

// Simple person SVG icon
function PersonIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden>
      <circle cx="12" cy="5" r="3.5" />
      <path d="M12 10c-3.5 0-6 2-6 4.5V20h12v-5.5C18 12 15.5 10 12 10z" />
    </svg>
  )
}

export function NetForceTab({ state, togglePusher, start, pause, reset, tick }) {
  const { language } = useLanguage()
  const strings = getTranslations(language).forces
  const s = strings.netforce
  const { leftPushers, rightPushers, cartX, cartV, isRunning } = state
  const lCount = leftPushers.filter(Boolean).length
  const rCount = rightPushers.filter(Boolean).length
  const Fnet = (rCount - lCount) * FORCE_PER_PERSON
  const a    = (Fnet / CART_MASS).toFixed(1)

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawNetForce} state={state} onTick={tick} />

      <div className={styles.panel}>
        {/* Left pushers */}
        <div className={styles.section}>
          <span className={`${styles.sectionLabel} ${language === 'bn' ? 'bn' : ''}`}>{s.leftForce}</span>
          <div className={styles.pusherRow}>
            {leftPushers.map((active, i) => (
              <button
                key={i}
                className={`${styles.personBtn} ${styles.personBtnLeft} ${active ? styles.personActive : ''}`}
                onClick={() => togglePusher('netforce', 'leftPushers', i)}
                aria-pressed={active}
              >
                <PersonIcon color={active ? '#E8001D' : '#D1D5DB'} />
              </button>
            ))}
          </div>
        </div>

        {/* Right pushers */}
        <div className={styles.section}>
          <span className={`${styles.sectionLabel} ${language === 'bn' ? 'bn' : ''}`}>{s.rightForce}</span>
          <div className={styles.pusherRow}>
            {rightPushers.map((active, i) => (
              <button
                key={i}
                className={`${styles.personBtn} ${styles.personBtnRight} ${active ? styles.personActive : ''}`}
                onClick={() => togglePusher('netforce', 'rightPushers', i)}
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
            label={s.readouts.netForce}
            value={`${Fnet > 0 ? '+' : ''}${Fnet} N`}
            color={Fnet === 0 ? '#6B7280' : Fnet > 0 ? '#274FE3' : '#E8001D'}
            lang={language}
          />
          <ReadoutCard label={s.readouts.accel}    value={`${a} m/s²`} lang={language} />
          <ReadoutCard label={s.readouts.velocity} value={`${cartV.toFixed(1)} m/s`} lang={language} />
          <ReadoutCard label={s.readouts.position} value={`${cartX.toFixed(1)} m`} lang={language} />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isRunning ? (
            <Button variant="secondary" onClick={pause}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.pause}</span></Button>
          ) : (
            <Button variant="primary"   onClick={start}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.start}</span></Button>
          )}
          <Button variant="ghost" onClick={reset}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.reset}</span></Button>
        </div>

        <p className={`${styles.hint} ${language === 'bn' ? 'bn' : ''}`}>{s.hint}</p>
      </div>
    </div>
  )
}

function ReadoutCard({ label, value, color, lang }) {
  return (
    <div className={styles.readoutCard}>
      <span className={`${styles.readoutLabel} ${lang === 'bn' ? 'bn' : ''}`}>{label}</span>
      <span className={styles.readoutValue} style={color ? { color } : undefined}>{value}</span>
    </div>
  )
}
