import { useState } from 'react'
import styles from './GuideCard.module.css'

export function GuideCard({ title, items, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={styles.card}>
      <button
        className={styles.header}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <div className={styles.titleRow}>
          <span className={styles.icon}>💡</span>
          <span className={`${styles.title} bn`}>{title || 'তুমি কি জানো?'}</span>
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <ul className={styles.list}>
          {items.map((item, i) => (
            <li key={i} className={`${styles.item} bn`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
