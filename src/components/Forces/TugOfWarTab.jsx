import { ForceCanvas } from './ForceCanvas.jsx'
import { drawTug } from '../../lib/forceCanvas.js'
import { FORCE_PER_PERSON, ROPE_MASS } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { GuideCard } from '../Common/GuideCard.jsx'
import { formatNum } from '../../lib/bangla.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './Forces.module.css'

function PersonIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden>
      <circle cx="12" cy="5" r="3.5" />
      <path d="M12 10c-3.5 0-6 2-6 4.5V20h12v-5.5C18 12 15.5 10 12 10z" />
    </svg>
  )
}

export function TugOfWarTab({ state, togglePusher, start, pause, reset, tick }) {
  const { language } = useLanguage()
  const strings = getTranslations(language).forces
  const s = strings.tug
  const { leftTeam, rightTeam, ropeX, ropeV, isRunning, winner } = state
  const lCount = leftTeam.filter(Boolean).length
  const rCount = rightTeam.filter(Boolean).length
  const Fnet   = (rCount - lCount) * FORCE_PER_PERSON
  const a      = (Fnet / ROPE_MASS)

  const fmt = (v, d = 0) => formatNum(v, d, language === 'bn' ? 'bangla' : 'western')

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawTug} state={state} onTick={tick} />

      <div className={styles.panel}>
        <div className={styles.instructionBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--info)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className={`${styles.instructionText} ${language === 'bn' ? 'bn' : ''}`}>{s.hint}</p>
        </div>

        <GuideCard title={strings.guideTitle} items={s.guides} />
        {winner && (
          <div style={{
            background: '#ECFDF5', border: '1px solid var(--success)',
            borderRadius: 'var(--r-md)', padding: 'var(--s-3)',
            textAlign: 'center', fontWeight: 700,
            color: 'var(--success-text)',
          }}>
            <span className={language === 'bn' ? 'bn' : ''}>{winner === 'right' ? s.winRight : s.winLeft}</span>
          </div>
        )}

        <div className={styles.section} data-tour="tug-people">
          <span className={`${styles.sectionLabel} ${language === 'bn' ? 'bn' : ''}`} style={{ color: '#E8001D' }}>{s.leftTeam}</span>
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
          <span className={`${styles.sectionLabel} ${language === 'bn' ? 'bn' : ''}`} style={{ color: '#274FE3' }}>{s.rightTeam}</span>
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
        <div className={styles.readouts} data-tour="tug-readouts">
          <ReadoutCard
            label={strings.netforce.readouts.netForce}
            value={`${Fnet >= 0 ? '+' : ''}${fmt(Fnet)} N`}
            color={Fnet === 0 ? '#6B7280' : Fnet > 0 ? '#274FE3' : '#E8001D'}
            lang={language}
          />
          <ReadoutCard label={strings.netforce.readouts.accel}    value={`${fmt(a, 1)} m/s²`} lang={language} />
          <ReadoutCard label={strings.netforce.readouts.velocity} value={`${fmt(ropeV, 1)} m/s`} lang={language} />
          <ReadoutCard label={strings.netforce.readouts.position} value={`${fmt(ropeX, 1)} m`} lang={language} />
        </div>

        {/* Actions */}
        <div className={styles.actions} data-tour="tug-actions">
          {isRunning ? (
            <Button variant="secondary" onClick={pause}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.pause}</span></Button>
          ) : (
            <Button variant={winner ? "danger" : "primary"} onClick={winner ? reset : start}>
              <span className={language === 'bn' ? 'bn' : ''}>{winner ? strings.actions.reset : strings.actions.start}</span>
            </Button>
          )}
          {!winner && (
            <Button variant="ghost" onClick={reset}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.reset}</span></Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ReadoutCard({ label, value, color, lang }) {
  return (
    <div className={styles.readoutCard}>
      <span className={`${styles.readoutLabel} ${lang === 'bn' ? 'bn' : ''}`}>{label}</span>
      <span className={`${styles.readoutValue} ${lang === 'bn' ? 'bn' : ''}`} style={color ? { color } : undefined}>{value}</span>
    </div>
  )
}
