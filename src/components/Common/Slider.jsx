import styles from './Slider.module.css'

export function Slider({ label, value, min, max, step = 1, onChange, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={`${styles.label} bn`}>{label}</span>
        <span className={styles.value}>{value}{unit}</span>
      </div>
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
    </div>
  )
}
