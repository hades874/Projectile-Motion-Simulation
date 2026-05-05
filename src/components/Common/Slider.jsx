import styles from './Slider.module.css'

export function Slider({ label, value, min, max, step = 1, onChange, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100

  const increment = () => onChange(Math.min(max, value + step))
  const decrement = () => onChange(Math.max(min, value - step))

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={`${styles.label} bn`}>{label}</span>
        <span className={styles.value}>{value}{unit}</span>
      </div>
      
      <div className={styles.controlRow}>
        <button className={styles.stepBtn} onClick={decrement} aria-label="কমান">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
          <input
            type="range"
            className={styles.input}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
          />
        </div>

        <button className={styles.stepBtn} onClick={increment} aria-label="বাড়ান">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
