import { useState } from 'react'
import { Slider } from '../Common/Slider.jsx'
import { Button } from '../Common/Button.jsx'
import strings from '../../content/senior.bn.json'
import styles from './ComparisonPanel.module.css'

const DEFAULTS = { v0: 30, theta: 60, h0: 0 }

export function ComparisonPanel({ comparison, onSet }) {
  const [params, setParams] = useState(comparison?.params || DEFAULTS)

  const s = strings.comparison
  const set = (k, v) => {
    const next = { ...params, [k]: v }
    setParams(next)
    if (comparison) onSet(next)
  }

  return (
    <div className={styles.panel}>
      {!comparison ? (
        <Button variant="secondary" fullWidth onClick={() => { setParams(DEFAULTS); onSet(DEFAULTS) }}>
          <span className="bn">{s.add}</span>
        </Button>
      ) : (
        <>
          <div className={styles.controls}>
            <Slider label={s.v0}  value={params.v0}    min={0}  max={100} step={1} onChange={v => set('v0', v)}    unit=" m/s" />
            <Slider label={s.theta} value={params.theta} min={0}  max={90}  step={1} onChange={v => set('theta', v)} unit="°" />
            <Slider label={s.h0}  value={params.h0}    min={0}  max={50}  step={1} onChange={v => set('h0', v)}    unit=" m" />
          </div>
          <Button variant="ghost" fullWidth onClick={() => onSet(null)}>
            <span className="bn">{s.remove}</span>
          </Button>
        </>
      )}
    </div>
  )
}
