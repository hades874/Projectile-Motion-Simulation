import { useNavigate } from 'react-router-dom'
import styles from './ModeSelect.module.css'

export function ModeSelect() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      {/* Dynamic Background Elements */}
      <div className={styles.bgElements}>
        <div className={`${styles.geo} ${styles.circle}`} />
        <div className={`${styles.geo} ${styles.triangle}`} />
        <div className={`${styles.geo} ${styles.square}`} />
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.brandBadge}>
          <span className={styles.logo}>10MS</span>
          <span className={styles.divider}>·</span>
          <span className={`${styles.series} bn`}>বলবিজ্ঞান সিরিজ</span>
        </div>
        <h1 className={`${styles.appTitle} bn`}>পদার্থবিজ্ঞানকে দেখো <br />নতুন চোখে</h1>
        <p className={`${styles.subtitle} bn`}>নিচে থেকে একটি সিমুলেশন বেছে নিয়ে শুরু করো</p>
      </div>

      {/* Segment cards */}
      <div className={styles.cards}>
        <button className={`${styles.card} ${styles.juniorCard}`} onClick={() => navigate('/junior')}>
          <div className={`${styles.cardBadge} ${styles.badgeJunior} bn`}>জুনিয়র</div>
          <div className={styles.cardIcon}>
            <img src="/assets/images/forces_icon.png" alt="Forces" className={styles.icon3d} />
          </div>
          <div className={styles.cardContent}>
            <h2 className={`${styles.cardTitle} bn`}>বল ও গতি</h2>
            <p className={`${styles.cardSub} bn`}>নিউটনের গতিসূত্র ও ঘর্ষণ</p>
            <div className={`${styles.cardTag} ${styles.tagJunior} bn`}>৪টি ল্যাব</div>
          </div>
        </button>

        <button className={`${styles.card} ${styles.seniorCard}`} onClick={() => navigate('/senior')}>
          <div className={`${styles.cardBadge} ${styles.badgeSenior} bn`}>সিনিয়র</div>
          <div className={styles.cardIcon}>
            <img src="/assets/images/projectile_icon.png" alt="Projectile" className={styles.icon3d} />
          </div>
          <div className={styles.cardContent}>
            <h2 className={`${styles.cardTitle} bn`}>প্রক্ষেপণ গতি</h2>
            <p className={`${styles.cardSub} bn`}>এইচএসসি ও বোর্ড স্ট্যান্ডার্ড</p>
            <div className={`${styles.cardTag} ${styles.tagSenior} bn`}>গ্রাফ · সূত্র · তুলনা</div>
          </div>
        </button>
      </div>

      <p className={`${styles.footer} bn`}>তুমি কি প্রস্তুত? চলো শুরু করি!</p>
    </div>
  )
}
