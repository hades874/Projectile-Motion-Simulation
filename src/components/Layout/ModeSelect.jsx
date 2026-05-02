import styles from './ModeSelect.module.css'
import strings from '../../content/junior.bn.json'

export function ModeSelect({ onSelect }) {
  const s = strings.modeSelect
  return (
    <div className={styles.page}>
      <div className={styles.logoArea}>
        <span className={styles.logo10ms}>10MS</span>
        <h1 className={`${styles.appTitle} bn`}>{strings.appTitle}</h1>
      </div>
      <p className={`${styles.subtitle} bn`}>{s.title}</p>
      <div className={styles.cards}>
        <button className={`${styles.card} ${styles.juniorCard}`} onClick={() => onSelect('junior')}>
          <div className={styles.cardIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span className={`${styles.cardTitle} bn`}>{s.junior}</span>
          <span className={`${styles.cardSub} bn`}>{s.juniorSub}</span>
        </button>
        <button className={`${styles.card} ${styles.seniorCard}`} onClick={() => onSelect('senior')}>
          <div className={styles.cardIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M6 20V10l6-8 6 8v10"/><path d="M9 20v-5h6v5"/></svg>
          </div>
          <span className={`${styles.cardTitle} bn`}>{s.senior}</span>
          <span className={`${styles.cardSub} bn`}>{s.seniorSub}</span>
        </button>
      </div>
    </div>
  )
}
