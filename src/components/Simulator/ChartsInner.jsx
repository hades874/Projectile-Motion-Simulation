import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './ChartsInner.module.css'

function buildChartData(pts1, pts2) {
  if (!pts2) {
    return pts1.map(p => ({
      t: +p.t.toFixed(2),
      y1: +p.y.toFixed(2),
      vy1: +p.vy.toFixed(2),
      vx1: +p.vx.toFixed(2),
      v1: +p.speed.toFixed(2)
    }))
  }

  const T1 = pts1[pts1.length - 1].t
  const T2 = pts2[pts2.length - 1].t
  const Tmax = Math.max(T1, T2)
  const N = 200

  return Array.from({ length: N + 1 }, (_, i) => {
    const t = (i / N) * Tmax

    let y1 = null, vy1 = null
    if (t <= T1 + 1e-9) {
      const frac = T1 > 0 ? t / T1 : 0
      const idx  = Math.min(Math.floor(frac * (pts1.length - 1)), pts1.length - 2)
      const a = pts1[idx], b = pts1[idx + 1] ?? a
      const factor = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0
      y1  = +(a.y  + (b.y  - a.y)  * factor).toFixed(2)
      vy1 = +(a.vy + (b.vy - a.vy) * factor).toFixed(2)
    }

    let y2 = null, vy2 = null
    if (t <= T2 + 1e-9) {
      const frac = T2 > 0 ? t / T2 : 0
      const idx  = Math.min(Math.floor(frac * (pts2.length - 1)), pts2.length - 2)
      const a = pts2[idx], b = pts2[idx + 1] ?? a
      const factor = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0
      y2  = +(a.y  + (b.y  - a.y)  * factor).toFixed(2)
      vy2 = +(a.vy + (b.vy - a.vy) * factor).toFixed(2)
    }

    return { t: +t.toFixed(2), y1, y2, vy1, vy2 }
  })
}

export default function ChartsInner({ points, comparisonPoints }) {
  const { language } = useLanguage()
  const s = getTranslations(language).senior.chartLabels
  const hasComp = !!(comparisonPoints?.length)
  const data = buildChartData(points, hasComp ? comparisonPoints : null)

  const commonChartProps = {
    data,
    margin: { top: 4, right: 8, left: -20, bottom: 4 }
  }

  return (
    <div className={styles.charts}>
      {/* ── Y-T Graph ── */}
      <div className={styles.chart}>
        <div className={styles.chartHeader}>
          <p className={`${styles.chartLabel} ${language === 'bn' ? 'bn' : ''}`}>{s.yt}</p>
          {hasComp && <Legend s={s} lang={language} />}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottomRight', fontSize: 10, offset: 0 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v, name) => [v, name.includes('1') ? s.p1 : s.p2]} />
            <Line type="monotone" dataKey="y1" stroke="#1CAB55" strokeWidth={2.5} dot={false} connectNulls={false} />
            {hasComp && <Line type="monotone" dataKey="y2" stroke="#EA580C" strokeWidth={2.5} dot={false} connectNulls={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Vy-T Graph ── */}
      <div className={styles.chart}>
        <div className={styles.chartHeader}>
          <p className={`${styles.chartLabel} ${language === 'bn' ? 'bn' : ''}`}>{s.vyt}</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottomRight', fontSize: 10, offset: 0 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v, name) => [v, name.includes('1') ? s.p1 : s.p2]} />
            <Line type="monotone" dataKey="vy1" stroke="#274FE3" strokeWidth={2.5} dot={false} connectNulls={false} />
            {hasComp && <Line type="monotone" dataKey="vy2" stroke="#9333EA" strokeWidth={2.5} dot={false} connectNulls={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Legend({ s, lang }) {
  return (
    <div className={styles.legend}>
      <span className={styles.legendDot} style={{ background: '#1CAB55' }} />
      <span className={lang === 'bn' ? 'bn' : ''} style={{ fontSize: 10 }}>{s.p1Short}</span>
      <span className={styles.legendDot} style={{ background: '#EA580C' }} />
      <span className={lang === 'bn' ? 'bn' : ''} style={{ fontSize: 10 }}>{s.p2Short}</span>
    </div>
  )
}
