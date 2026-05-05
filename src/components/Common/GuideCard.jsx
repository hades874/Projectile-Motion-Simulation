import { useState } from 'react'
import styles from './GuideCard.module.css'

export function GuideCard({ title, items }) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <button 
        className={styles.openBtn} 
        onClick={() => setIsOpen(true)}
        aria-label="গাইড ওপেন করুন"
      >
        💡
      </button>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>💡</span>
          <span className={`${styles.title} bn`}>{title || 'শিখুন'}</span>
        </div>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
      </div>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li key={i} className={`${styles.item} bn`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
