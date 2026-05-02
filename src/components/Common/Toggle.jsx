import styles from './Toggle.module.css'

export function Toggle({ checked, onChange, label }) {
  return (
    <label className={styles.wrapper}>
      <span className={`${styles.label} bn`}>{label}</span>
      <div className={`${styles.track} ${checked ? styles.on : ''}`} onClick={() => onChange(!checked)}>
        <div className={styles.thumb} />
      </div>
    </label>
  )
}
