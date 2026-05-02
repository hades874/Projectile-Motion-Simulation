import { useState, useRef } from 'react'
import styles from './Tooltip.module.css'

export function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), 500)
  }
  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <div
      className={styles.wrapper}
      onTouchStart={show}
      onTouchEnd={hide}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && <div className={`${styles.tip} bn`}>{text}</div>}
    </div>
  )
}
