import styles from './Header.module.css'

export function Header({ mode, onModeSwitch, numerals, onNumeralToggle }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoText}>10MS</span>
        <span className={`${styles.title} bn`}>প্রক্ষেপ গতি</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.numBtn} onClick={onNumeralToggle} title="সংখ্যা পদ্ধতি বদলাও">
          {numerals === 'bangla' ? '০৯' : '09'}
        </button>
        <button className={styles.modeBtn} onClick={onModeSwitch}>
          <span className="bn">
            {mode === 'junior' ? 'সিনিয়র →' : '← জুনিয়র'}
          </span>
        </button>
      </div>
    </header>
  )
}
