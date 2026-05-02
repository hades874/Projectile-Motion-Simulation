import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SIMULATIONS } from '../../data/simulations.js'
import styles from './SimViewer.module.css'

export function SimViewer() {
  const { simId } = useParams()
  const navigate = useNavigate()
  const sim = SIMULATIONS.find(s => s.id === simId)

  const [lang, setLang] = useState('bn')
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  if (!sim) {
    navigate('/', { replace: true })
    return null
  }

  const iframeSrc = lang === 'bn' ? sim.urlBn : sim.urlEn

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className={styles.page} ref={containerRef}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        <div className={styles.titleBlock}>
          <span className={`${styles.titleBn} bn`}>{sim.titleBn}</span>
          <span className={styles.titleEn}>{sim.titleEn}</span>
        </div>

        <div className={styles.actions}>
          {/* Language toggle */}
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'bn' ? styles.langActive : ''}`}
              onClick={() => { setLang('bn'); setLoading(true) }}
            >বাং</button>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
              onClick={() => { setLang('en'); setLoading(true) }}
            >EN</button>
          </div>

          {/* Fullscreen */}
          <button className={styles.fsBtn} onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Tabs strip */}
      <div className={styles.tabStrip}>
        <div className={styles.tabScrollArea}>
          <div className={styles.simTabs}>
            {sim.tabs.map((t, i) => (
              <span key={t} className={`${styles.simTab} ${i === 0 ? styles.simTabActive : ''} bn`}>{t}</span>
            ))}
          </div>
          <span className={styles.tabHint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span className="bn">সিমুলেশনের ভেতরে ট্যাব বদলাও</span>
          </span>
        </div>
      </div>

      {/* iframe container */}
      <div className={styles.iframeWrap}>
        {loading && (
          <div className={styles.loader}>
            <div className={styles.loaderSpinner} />
            <p className={`${styles.loaderText} bn`}>সিমুলেশন লোড হচ্ছে…</p>
            <p className={styles.loaderSub}>PhET Interactive Simulations</p>
          </div>
        )}
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={`${sim.titleBn} — PhET`}
          className={`${styles.iframe} ${loading ? styles.iframeHidden : ''}`}
          allowFullScreen
          allow="fullscreen; autoplay"
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Attribution footer */}
      <div className={styles.attribution}>
        <a
          href="https://phet.colorado.edu"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.phetLink}
        >
          <PhetIcon />
          <span>PhET Interactive Simulations, University of Colorado Boulder</span>
        </a>
        <span className={styles.license}>CC BY-NC 4.0</span>
      </div>
    </div>
  )
}

function PhetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="20" fill="#235089"/>
      <text x="20" y="26" fontSize="14" fontWeight="700" fill="#fff" textAnchor="middle">Ph</text>
    </svg>
  )
}
