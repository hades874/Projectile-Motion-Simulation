import { useMemo } from 'react'
import { formatNum } from '../../lib/bangla.js'
import styles from './Readouts.module.css'

export function Readouts({ results, impact, strings, numerals }) {
  const { T, H, R } = results
  const fmt = (v, d = 1) => formatNum(v, numerals, d)

  const items = useMemo(() => [
    { label: strings.range,  value: fmt(R), unit: strings.rangeUnit },
    { label: strings.height, value: fmt(H), unit: strings.heightUnit },
    { label: strings.time,   value: fmt(T, 2), unit: strings.timeUnit },
    ...(impact ? [
      { label: strings.impactSpeed, value: fmt(impact.speed), unit: strings.speedUnit },
      { label: strings.impactAngle, value: fmt(impact.angleDeg), unit: strings.angleUnit },
    ] : []),
  ], [R, H, T, impact, strings, numerals])

  return (
    <div className={styles.strip}>
      {items.map(item => (
        <div key={item.label} className={styles.item}>
          <span className={`${styles.label} bn`}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
          <span className={styles.unit}>{item.unit}</span>
        </div>
      ))}
    </div>
  )
}
