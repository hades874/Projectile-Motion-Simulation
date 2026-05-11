import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Languages } from 'lucide-react'
import { IntroModal } from '../Common/IntroModal.jsx'
import TourOverlay from '../Common/TourOverlay.jsx'
import { FeedbackCTA } from '../Common/FeedbackCTA.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './ModeSelect.module.css'

function ForcesIcon() {
  return (
    <svg viewBox="0 0 52 52" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="14" fill="#D1FAE5"/>
      <rect x="24" y="15" width="18" height="18" rx="5" fill="#1CAB55"/>
      <rect x="26" y="17" width="11" height="5" rx="2" fill="white" opacity="0.3"/>
      <path d="M4 24L21 24" stroke="#065F46" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="17,19 26,24 17,29" fill="#065F46"/>
      <path d="M43 24L49 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="45,21 50,24 45,27" fill="white"/>
      <path d="M33 34L33 44" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30,41 L33,45 L36,41" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ProjectileIcon() {
  return (
    <svg viewBox="0 0 52 52" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="14" fill="#DBEAFE"/>
      <path d="M5 45L47 45" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 45 Q26 7 45 45" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" strokeDasharray="2.5 4"/>
      <path d="M7 45 Q26 7 45 45" stroke="#274FE3" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="7" cy="45" r="3.5" fill="#274FE3"/>
      <circle cx="26" cy="12" r="5" fill="#274FE3"/>
      <circle cx="26" cy="12" r="2.5" fill="white"/>
      <circle cx="45" cy="45" r="3.5" fill="#274FE3" opacity="0.35"/>
      <path d="M7 45L16 45" stroke="#274FE3" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M7 45L12 38" stroke="#274FE3" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M14 42 A9 9 0 0 0 11.5 38.5" stroke="#274FE3" strokeWidth="1.2" fill="none" opacity="0.6"/>
      <text x="17" y="43" fontSize="7" fill="#274FE3" fontFamily="serif" fontStyle="italic" opacity="0.8">&#952;</text>
    </svg>
  )
}

export function ModeSelect() {
  const navigate = useNavigate()
  const tourStartRef = useRef(null)
  const { language, toggleLanguage } = useLanguage()
  const t = getTranslations(language).home

  const homeSteps = t.tour.map((step, idx) => ({
    ...step,
    targetId: idx === 0 ? 'home-hero' : (idx === 1 ? 'home-junior-card' : 'home-senior-card'),
    placement: idx === 0 ? 'bottom' : (idx === 1 ? 'right' : 'left'),
  }))

  return (
    <div className={styles.page}>

      {/* ── Hero Section ── */}
      <div className={styles.heroSection} data-tour="home-hero">
        <svg width="160" height="160" viewBox="0 0 160 160" className={styles.geoTopRight} aria-hidden="true">
          <circle cx="80" cy="80" r="55" stroke="var(--ten-red)" strokeWidth="2" fill="none" />
          <circle cx="80" cy="80" r="30" stroke="var(--ten-red)" strokeWidth="2" fill="none" />
        </svg>
        <svg width="80" height="80" viewBox="0 0 80 80" className={styles.geoBottomLeft} aria-hidden="true">
          <polygon points="40,8 72,68 8,68" stroke="var(--success)" strokeWidth="2" fill="none" />
        </svg>

        <div className={styles.heroBrandRow}>
          <div className={styles.brandBadge}>
            <span className={styles.brandLogo}>10MS</span>
            <span className={styles.brandDot}>&middot;</span>
            <span className={`${styles.brandSeries} ${language === 'bn' ? 'bn' : ''}`}>{t.brandSeries}</span>
          </div>
          <div className={styles.heroActions}>
            <button
              className={styles.langToggle}
              onClick={toggleLanguage}
              title={t.langSwitch}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
            <button
              className={styles.heroTourBtn}
              onClick={() => tourStartRef.current && tourStartRef.current()}
              title={t.heroTourBtn}
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        <h1 className={`${styles.appTitle} ${language === 'bn' ? 'bn' : ''}`}>
          {t.appTitle}
          <br />
          {t.appSubtitle}
        </h1>
        <p className={`${styles.subtitle} ${language === 'bn' ? 'bn' : ''}`}>{t.appDesc}</p>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        <svg width="220" height="220" viewBox="0 0 220 220" className={styles.geoContentBR} aria-hidden="true">
          <circle cx="110" cy="110" r="80" stroke="var(--info)" strokeWidth="2" fill="none" />
          <circle cx="110" cy="110" r="50" stroke="var(--info)" strokeWidth="2" fill="none" />
          <circle cx="110" cy="110" r="20" stroke="var(--info)" strokeWidth="2" fill="none" />
        </svg>
        <svg width="120" height="120" viewBox="0 0 120 120" className={styles.geoContentTL} aria-hidden="true">
          <polygon points="60,10 110,100 10,100" stroke="var(--ten-red)" strokeWidth="2" fill="none" />
          <polygon points="60,30 90,85 30,85" stroke="var(--ten-red)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* ── Cards ── */}
        <div className={styles.cards}>
          <button className={styles.juniorCard} onClick={() => navigate('/junior')} data-tour="home-junior-card">
            <div className={styles.featuredBar} style={{ background: 'var(--success)' }} />
            <div className={styles.cardTop}>
              <div className={styles.cardIconWrap}><ForcesIcon /></div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTagRow}>
                  <span className={`${styles.cardBadge} ${styles.badgeJunior} ${language === 'bn' ? 'bn' : ''}`}>{t.junior.badge}</span>
                  <span className={`${styles.cardAge} ${language === 'bn' ? 'bn' : ''}`}>{t.junior.age}</span>
                </div>
                <h2 className={`${styles.cardTitle} ${language === 'bn' ? 'bn' : ''}`}>{t.junior.title}</h2>
                <p className={`${styles.cardSub} ${language === 'bn' ? 'bn' : ''}`}>{t.junior.subtitle}</p>
              </div>
              <div className={styles.cardArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          </button>

          <button className={styles.seniorCard} onClick={() => navigate('/senior')} data-tour="home-senior-card">
            <div className={styles.featuredBar} style={{ background: 'var(--info)' }} />
            <div className={styles.cardTop}>
              <div className={styles.cardIconWrap}><ProjectileIcon /></div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTagRow}>
                  <span className={`${styles.cardBadge} ${styles.badgeSenior} ${language === 'bn' ? 'bn' : ''}`}>{t.senior.badge}</span>
                  <span className={`${styles.cardAge} ${language === 'bn' ? 'bn' : ''}`}>{t.senior.age}</span>
                </div>
                <h2 className={`${styles.cardTitle} ${language === 'bn' ? 'bn' : ''}`}>{t.senior.title}</h2>
                <p className={`${styles.cardSub} ${language === 'bn' ? 'bn' : ''}`}>{t.senior.subtitle}</p>
              </div>
              <div className={styles.cardArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          </button>
        </div>
      </div>


      <TourOverlay
        steps={homeSteps}
        storageKey="10ms_sim_home_tour"
        blockedByKey="10ms_sim_home"
        hideTrigger={true}
        triggerRef={tourStartRef}
      />

      <IntroModal
        storageKey="10ms_sim_home"
        variant="home"
        title={t.intro.title}
        badge={t.intro.badge}
        description={t.intro.description}
        outcomes={t.intro.outcomes}
        ctaLabel={t.intro.cta}
      />

      <FeedbackCTA simulationName="Home_Page" />
    </div>
  )
}
