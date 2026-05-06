import styles from './LoadingScreen.module.css'

export function LoadingScreen() {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
    </div>
  )
}
