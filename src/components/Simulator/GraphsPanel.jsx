import { lazy, Suspense } from 'react'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './GraphsPanel.module.css'

const LazyCharts = lazy(() => import('./ChartsInner.jsx'))

export function GraphsPanel({ points, comparisonPoints }) {
  const { language } = useLanguage()
  const s = getTranslations(language).senior.chartLabels

  return (
    <div className={styles.panel}>
      <Suspense fallback={<div className={styles.loading}>{s.loading}</div>}>
        <LazyCharts points={points} comparisonPoints={comparisonPoints} />
      </Suspense>
    </div>
  )
}
