import styles from './Button.module.css'

export function Button({ children, variant = 'primary', onClick, disabled, pulse, fullWidth, size = 'md' }) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    pulse && styles.pulse,
    fullWidth && styles.fullWidth,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
