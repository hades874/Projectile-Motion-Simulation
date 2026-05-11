import { ForceCanvas } from './ForceCanvas.jsx'
import { drawFriction } from '../../lib/forceCanvas.js'
import { SURFACES, frictionForce, GRAVITY } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { GuideCard } from '../Common/GuideCard.jsx'
import { formatNum } from '../../lib/bangla.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './Forces.module.css'

export function FrictionTab({ state, setParam, start, pause, reset, tick }) {
  const { language } = useLanguage()
  const strings = getTranslations(language).forces
  const s = strings.friction
  const { Fapplied, surface, mass, boxX, boxV, isRunning } = state
  const surf   = SURFACES[surface]
  const Ff     = frictionForce(Fapplied, mass, surf.mu_s, surf.mu_k, boxV)
  const Fs_max = (surf.mu_s * mass * GRAVITY)

  const fmt = (v, d = 0) => formatNum(v, d, language === 'bn' ? 'bangla' : 'western')

  return (
    <div className={styles.tabLayout}>
      <ForceCanvas drawFn={drawFriction} state={state} onTick={tick} />

      <div className={styles.panel}>
        <GuideCard title={strings.guideTitle} items={s.guides} />
        {/* Applied force slider */}
        <div className={styles.paramRow}>
          <div className={styles.paramHeader}>
            <span className={`${styles.paramName} ${language === 'bn' ? 'bn' : ''}`}>{s.appliedForce}</span>
            <span className={styles.paramValue}>{fmt(Fapplied)} N</span>
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
          <span className={`${styles.sectionLabel} ${language === 'bn' ? 'bn' : ''}`}>{s.surfaceType}</span>
          <div className={styles.surfaceRow}>
            {Object.entries(SURFACES).map(([key, sf]) => (
              <button
                key={key}
                className={`${styles.surfaceBtn} ${surface === key ? styles.selected : ''}`}
                onClick={() => setParam('friction', 'surface', key)}
              >
                <span className={language === 'bn' ? 'bn' : ''}>{s.surfaces[key] || sf.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Readouts */}
        <div className={styles.readouts}>
          <ReadoutCard label={s.readouts.appliedF}  value={`${fmt(Fapplied)} N`} lang={language} />
          <ReadoutCard label={s.readouts.frictionF} value={`${fmt(Math.abs(Ff))} N`} lang={language} />
          <ReadoutCard label={s.readouts.maxStatic} value={`${fmt(Fs_max, 1)} N`} lang={language} />
          <ReadoutCard label={s.readouts.velocity}  value={`${fmt(boxV, 1)} m/s`} lang={language} />
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

function ReadoutCard({ label, value, lang }) {
  return (
    <div className={styles.readoutCard}>
      <span className={`${styles.readoutLabel} ${lang === 'bn' ? 'bn' : ''}`}>{label}</span>
      <span className={`${styles.readoutValue} ${lang === 'bn' ? 'bn' : ''}`}>{value}</span>
    </div>
  )
}
