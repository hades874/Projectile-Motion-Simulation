import { lazy, Suspense } from 'react'
import styles from './GraphsPanel.module.css'

const LazyCharts = lazy(() => import('./ChartsInner.jsx'))

export function GraphsPanel({ points, results }) {
  return (
    <div className={styles.panel}>
      <Suspense fallback={<div className={styles.loading}>লোড হচ্ছে…</div>}>
        <LazyCharts points={points} results={results} />
      </Suspense>
    </div>
  )
}
