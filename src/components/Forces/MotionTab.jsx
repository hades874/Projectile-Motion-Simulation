import { ForceCanvas } from './ForceCanvas.jsx'
import { drawMotion, wx, groundY } from '../../lib/forceCanvas.js'
import { OBJECTS, frictionForce, netMotionForce, accel } from '../../lib/forcesPhysics.js'
import { Button } from '../Common/Button.jsx'
import { Toggle } from '../Common/Toggle.jsx'
import { GuideCard } from '../Common/GuideCard.jsx'
import { formatNum } from '../../lib/bangla.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './Forces.module.css'

function CSSObject({ type, isMoving, flipped }) {
  if (type === 'car') {
    return (
      <div className={`${styles.carContainer} ${!isMoving ? styles.notMoving : ''}`}>
        <div className={`${styles.carInner} ${flipped ? styles.flipped : ''}`}>
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
      </div>
    )
  }
  return <div className={styles[type]} />
}

export function MotionTab({ state, setParam, start, pause, reset, tick }) {
  const { language } = useLanguage()
  const strings = getTranslations(language).forces
  const s = strings.motion
  const { Fapplied, selectedObject, frictionOn, boxX, boxV, isRunning } = state
  const obj = OBJECTS[selectedObject]
  const Ff  = frictionOn ? frictionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV) : 0
  const a   = accel(netMotionForce(Fapplied, obj.mass, obj.mu_s, obj.mu_k, boxV, frictionOn), obj.mass)

  // Object sizes for positioning
  const sizes = { ice: 60, car: 160, fridge: 50, box: 70 }
  const size = sizes[selectedObject] || 50
  const objH = selectedObject === 'car' ? 90 : size

  const fmt = (v, d = 0) => formatNum(v, d, language === 'bn' ? 'bangla' : 'western')

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
          <p className={`${styles.instructionText} ${language === 'bn' ? 'bn' : ''}`}>{s.hint}</p>
        </div>
        <div className={styles.paramRow} data-tour="motion-force">
          <div className={styles.paramHeader}>
            <span className={`${styles.paramName} ${language === 'bn' ? 'bn' : ''}`}>{s.appliedForce}</span>
            <span className={styles.paramValue}>{fmt(Fapplied)} N</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min={-800} max={800} step={10}
            value={Fapplied}
            onChange={e => setParam('motion', 'Fapplied', Number(e.target.value))}
          />
        </div>

        <div className={styles.section} data-tour="motion-objects">
          <span className={`${styles.sectionLabel} ${language === 'bn' ? 'bn' : ''}`}>{language === 'bn' ? 'বস্তু নির্বাচন' : 'Select Object'}</span>
          <div className={styles.objectRow}>
            {Object.entries(OBJECTS).map(([key, o]) => (
              <button
                key={key}
                className={`${styles.objectBtn} ${selectedObject === key ? styles.selected : ''}`}
                onClick={() => setParam('motion', 'selectedObject', key)}
              >
                <span className={language === 'bn' ? 'bn' : ''}>{s.objects[key] || o.label}</span>
              </button>
            ))}
          </div>
          {s.objectTips?.[selectedObject] && (
            <div className={styles.instructionBox} style={{ marginTop: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warning)', flexShrink: 0 }}>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
              <p className={`${styles.instructionText} ${language === 'bn' ? 'bn' : ''}`}>{s.objectTips[selectedObject]}</p>
            </div>
          )}
        </div>

        <div className={styles.frictionRow} data-tour="motion-friction">
          <span className={`${styles.frictionLabel} ${language === 'bn' ? 'bn' : ''}`}>{s.frictionLabel}</span>
          <Toggle
            checked={frictionOn}
            onChange={() => setParam('motion', 'frictionOn', !frictionOn)}
            label={frictionOn ? s.frictionOn : s.frictionOff}
          />
        </div>

        <div className={styles.readouts} data-tour="motion-readouts">
          <ReadoutCard label={s.readouts.velocity}  value={`${fmt(boxV, 1)} m/s`} lang={language} />
          <ReadoutCard label={s.readouts.accel}      value={`${fmt(a, 2)} m/s²`} lang={language} />
          <ReadoutCard label={s.readouts.appliedF}   value={`${fmt(Fapplied)} N`} lang={language} />
          <ReadoutCard label={s.readouts.frictionF}  value={`${fmt(Math.abs(Ff))} N`} lang={language} />
        </div>

        <GuideCard title={strings.guideTitle} items={s.guides} />

        <div className={styles.actions} data-tour="motion-actions">
          {isRunning ? (
            <Button variant="secondary" onClick={pause}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.pause}</span></Button>
          ) : (
            <Button variant="primary"   onClick={start}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.start}</span></Button>
          )}
          <Button variant="danger" onClick={reset}><span className={language === 'bn' ? 'bn' : ''}>{strings.actions.reset}</span></Button>
        </div>
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
