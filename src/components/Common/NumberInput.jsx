import styles from './NumberInput.module.css'

export function NumberInput({ label, value, min, max, step = 0.1, onChange, unit = '' }) {
  return (
    <div className={styles.wrapper}>
      <label className={`${styles.label} bn`}>{label}</label>
      <div className={styles.inputRow}>
        <input
          type="number"
          className={styles.input}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
          }}
        />
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </div>
  )
}
