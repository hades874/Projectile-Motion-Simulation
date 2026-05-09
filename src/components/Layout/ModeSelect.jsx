import { useNavigate } from 'react-router-dom'
import { IntroModal } from '../Common/IntroModal.jsx'
import TourOverlay from '../Common/TourOverlay.jsx'
import styles from './ModeSelect.module.css'

export function ModeSelect() {
  const navigate = useNavigate()

  const homeSteps = [
    {
      targetId: 'home-hero',
      placement: 'bottom',
      title: 'স্বাগতম!',
      body: '১০ মিনিট স্কুল বলবিজ্ঞান সিরিজে আপনাকে স্বাগতম। এখান থেকে আপনি আপনার পছন্দের সিমুলেশন মোডটি বেছে নিতে পারেন।'
    },
    {
      targetId: 'home-junior-card',
      placement: 'right',
      title: 'জুনিয়র মোড',
      body: 'এখানে আপনি বল, গতি ও ঘর্ষণ সংক্রান্ত সহজ ও মজার ল্যাবগুলো পাবেন।'
    },
    {
      targetId: 'home-senior-card',
      placement: 'left',
      title: 'সিনিয়র মোড',
      body: 'এখানে প্রক্ষেপক গতির বিস্তারিত সিমুলেশন ও গাণিতিক বিশ্লেষণ করা যাবে।'
    }
  ]

  return (
    <div className={styles.page}>
      {/* Dynamic Background Elements */}
      <div className={styles.bgElements}>
        <div className={`${styles.geo} ${styles.circle}`} />
        <div className={`${styles.geo} ${styles.triangle}`} />
        <div className={`${styles.geo} ${styles.square}`} />
      </div>

      {/* Hero Section */}
      <div className={styles.hero} data-tour="home-hero">
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
        <button className={`${styles.card} ${styles.juniorCard}`} onClick={() => navigate('/junior')} data-tour="home-junior-card">
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

        <button className={`${styles.card} ${styles.seniorCard}`} onClick={() => navigate('/senior')} data-tour="home-senior-card">
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

      <TourOverlay 
        steps={homeSteps} 
        storageKey="10ms_sim_home_tour"
        blockedByKey="10ms_sim_home"
      />

      <IntroModal
        storageKey="10ms_sim_home"
        variant="home"
        title="পদার্থবিজ্ঞান সিমুলেটর"
        badge="১০ মিনিট স্কুল · বলবিজ্ঞান সিরিজ"
        description="বল, গতি ও প্রক্ষেপণ — দুটি ইন্টারেক্টিভ সিমুলেশনে পদার্থবিজ্ঞানের মূল ধারণাগুলো হাতে-কলমে শেখার সবচেয়ে মজার উপায়।"
        outcomes={[
          'বল ও গতির মূল নীতি সরাসরি পরীক্ষা করতে পারবে',
          'প্রক্ষেপণ গতির সূত্র দৃশ্যমানভাবে প্রয়োগ করতে পারবে',
          'গ্রাফ, সূত্র ও সংখ্যায় পদার্থবিজ্ঞান বিশ্লেষণ করতে পারবে',
          'বোর্ড পরীক্ষার মানের সমস্যা সমাধানে দক্ষ হতে পারবে',
        ]}
        ctaLabel="সিমুলেশন শুরু করি"
      />
    </div>
  )
}
