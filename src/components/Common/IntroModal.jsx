import { useState, useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import styles from './IntroModal.module.css'

const ICONS = {
  home: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  junior: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="5" r="2.5" fill="rgba(255,255,255,0.9)"/>
      <path d="M12 8v5.5" stroke="white" strokeWidth="2.2"/>
      <path d="M9.5 11l2.5 2.5 2.5-2.5" stroke="white" strokeWidth="2"/>
      <path d="M3.5 16h4.5M16 16h4.5" stroke="white" strokeWidth="1.8"/>
      <path d="M2 19.5l3-3.5M22 19.5l-3-3.5" stroke="white" strokeWidth="1.8"/>
    </svg>
  ),
  senior: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 20 C6.5 20 9 3 12 3 C15 3 17.5 20 21 20"/>
      <circle cx="12" cy="3.5" r="2" fill="white" stroke="none"/>
      <path d="M2.5 20h19"/>
      <path d="M19.5 20l-1.5-2"/>
    </svg>
  ),
}

const CHECK_COLORS = {
  home:   { bg: '#ede9fe', color: '#4338ca' },
  junior: { bg: '#d1fae5', color: '#065f46' },
  senior: { bg: '#dbeafe', color: '#1e40af' },
}

export function IntroModal({ storageKey, variant = 'home', title, badge, description, outcomes, ctaLabel }) {
  const { language } = useLanguage()
  const [shown, setShown]     = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(() => setShown(true), 420)
      return () => clearTimeout(t)
    }
  }, [storageKey])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => {
      localStorage.setItem(storageKey, '1')
      setShown(false)
      setLeaving(false)
    }, 220)
    return () => clearTimeout(t)
  }, [leaving, storageKey])

  const dismiss = () => setLeaving(true)

  if (!shown) return null

  const checkStyle = CHECK_COLORS[variant]

  return (
    <div
      className={`${styles.backdrop} ${leaving ? styles.backdropLeaving : ''}`}
      onClick={dismiss}
    >
      <div
        className={`${styles.card} ${leaving ? styles.cardLeaving : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-modal-title"
      >
        {/* ── Header ── */}
        <div className={`${styles.header} ${styles[`header_${variant}`]}`}>
          {/* Decorative background circles */}
          <span className={styles.decoDot} />
          <span className={`${styles.decoDot} ${styles.decoDot2}`} />
          <span className={`${styles.decoDot} ${styles.decoDot3}`} />

          {/* Close button */}
          <button className={styles.closeBtn} onClick={dismiss} aria-label={language === 'bn' ? 'বন্ধ করো' : 'Close'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className={styles.headerContent}>
            <div className={styles.iconWrap}>
              {ICONS[variant]}
            </div>
            <div className={styles.headerText}>
              <h2 id="intro-modal-title" className={`${styles.title} ${language === 'bn' ? 'bn' : ''}`}>{title}</h2>
              {badge && <span className={`${styles.badge} ${language === 'bn' ? 'bn' : ''}`}>{badge}</span>}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          <p className={`${styles.description} ${language === 'bn' ? 'bn' : ''}`}>{description}</p>

          <div className={styles.outcomesSection}>
            <span className={`${styles.outcomesHeading} ${language === 'bn' ? 'bn' : ''}`}>
              {language === 'bn' ? 'এই সিমুলেশনে তুমি যা শিখবে' : 'What you will learn in this simulation'}
            </span>
            <ul className={styles.outcomesList}>
              {outcomes.map((item, i) => (
                <li key={i} className={styles.outcomeItem}>
                  <span
                    className={styles.checkIcon}
                    style={{ background: checkStyle.bg, color: checkStyle.color }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span className={`${styles.outcomeText} ${language === 'bn' ? 'bn' : ''}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button
            className={`${styles.cta} ${styles[`cta_${variant}`]} ${language === 'bn' ? 'bn' : ''}`}
            onClick={dismiss}
          >
            <span>{ctaLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
