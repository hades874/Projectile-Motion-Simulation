import { useNavigate } from 'react-router-dom'
import styles from './ModeSelect.module.css'

export function ModeSelect() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.logo}>10MS</span>
        <h1 className={`${styles.appTitle} bn`}>বলবিজ্ঞান সিমুলেশন</h1>
        <p className={`${styles.subtitle} bn`}>একটি সিমুলেশন বেছে নাও</p>
      </div>

      {/* Segment cards */}
      <div className={styles.cards}>
        <button className={`${styles.card} ${styles.juniorCard}`} onClick={() => navigate('/junior')}>
          <div className={`${styles.cardBadge} ${styles.badgeJunior} bn`}>জুনিয়র</div>
          <div className={styles.cardIcon}>
            {/* Force / push icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="9" width="7" height="6" rx="1" />
              <path d="M9 12h6M15 9l3 3-3 3" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </div>
          <h2 className={`${styles.cardTitle} bn`}>বল ও গতি</h2>
          <p className={`${styles.cardSub} bn`}>নিউটনের গতিসূত্র</p>
          <div className={`${styles.cardTag} ${styles.tagJunior} bn`}>৪টি পরীক্ষা</div>
        </button>

        <button className={`${styles.card} ${styles.seniorCard}`} onClick={() => navigate('/senior')}>
          <div className={`${styles.cardBadge} ${styles.badgeSenior} bn`}>সিনিয়র</div>
          <div className={styles.cardIcon}>
            {/* Trajectory / projectile icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18c2-6 5-9 9-9s6 3 6 9" />
              <path d="M3 18l2-2M3 18l2 2" />
              <circle cx="18" cy="18" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h2 className={`${styles.cardTitle} bn`}>প্রক্ষেপণ গতি</h2>
          <p className={`${styles.cardSub} bn`}>পদার্থবিজ্ঞান সিমুলেটর</p>
          <div className={`${styles.cardTag} ${styles.tagSenior} bn`}>গ্রাফ · সূত্র · তুলনা</div>
        </button>
      </div>

      <p className={`${styles.footer} bn`}>10 Minute School · বলবিজ্ঞান সিরিজ</p>
    </div>
  )
}
