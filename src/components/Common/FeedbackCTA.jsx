import { useState } from 'react'
import styles from './FeedbackCTA.module.css'

export function FeedbackCTA({ simulationName }) {
  const [isOpen, setIsOpen] = useState(false)

  // Tally form URL with dynamic simulation_name parameter
  const tallyUrl = `https://tally.so/r/RG87VJ?simulation_name=${simulationName}`

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  return (
    <div className={styles.container}>
      <button 
        className={styles.feedbackBtn} 
        onClick={handleOpen}
        title="তোমার মতামত জানাও"
        aria-label="Give Feedback"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className={`${styles.btnText} bn`}>তোমার মতামত জানাও</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <iframe 
              src={tallyUrl}
              className={styles.iframe}
              title="Feedback Form"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  )
}
