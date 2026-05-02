import { useState } from 'react'
import styles from './BottomSheet.module.css'

export function BottomSheet({ tabs, children }) {
  const [activeTab, setActiveTab] = useState(null)

  const toggle = (id) => setActiveTab(prev => prev === id ? null : id)
  const activeContent = activeTab ? children[activeTab] : null

  return (
    <div className={styles.sheet}>
      <div className={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => toggle(tab.id)}
          >
            <span className="bn">{tab.label}</span>
          </button>
        ))}
      </div>
      {activeContent && (
        <div className={styles.content}>{activeContent}</div>
      )}
    </div>
  )
}
