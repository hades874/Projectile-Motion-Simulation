import styles from './Header.module.css'

export function Header({ mode, onModeSwitch }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoWrapper}>
          <img 
            src="https://cdn.10minuteschool.com/images/svg/Origin%20Labs%20Black.svg" 
            alt="Origin Labs" 
            className={styles.logoImg} 
          />
          <span className={styles.seriesLabel}>বলবিজ্ঞান সিরিজ / Mechanics Series</span>
        </div>
        <span className={`${styles.title} bn`}>প্রক্ষেপ গতি</span>
      </div>
      <div className={styles.actions}>

        <button className={styles.modeBtn} onClick={onModeSwitch}>
          <span className="bn">
            {mode === 'junior' ? 'সিনিয়র →' : '← জুনিয়র'}
          </span>
        </button>
      </div>
    </header>
  )
}
