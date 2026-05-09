import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './ChartsInner.module.css'

function buildChartData(pts1, pts2) {
  if (!pts2) {
    return pts1.map(p => ({ t: +p.t.toFixed(2), y1: +p.y.toFixed(2) }))
  }

  const T1 = pts1[pts1.length - 1].t
  const T2 = pts2[pts2.length - 1].t
  const Tmax = Math.max(T1, T2)
  const N = 200

  return Array.from({ length: N + 1 }, (_, i) => {
    const t = (i / N) * Tmax

    let y1 = null
    if (t <= T1 + 1e-9) {
      const frac = T1 > 0 ? t / T1 : 0
      const idx  = Math.min(Math.floor(frac * (pts1.length - 1)), pts1.length - 2)
      const a = pts1[idx], b = pts1[idx + 1] ?? a
      y1 = b.t > a.t ? +(a.y + (b.y - a.y) * (t - a.t) / (b.t - a.t)).toFixed(2) : +a.y.toFixed(2)
    }

    let y2 = null
    if (t <= T2 + 1e-9) {
      const frac = T2 > 0 ? t / T2 : 0
      const idx  = Math.min(Math.floor(frac * (pts2.length - 1)), pts2.length - 2)
      const a = pts2[idx], b = pts2[idx + 1] ?? a
      y2 = b.t > a.t ? +(a.y + (b.y - a.y) * (t - a.t) / (b.t - a.t)).toFixed(2) : +a.y.toFixed(2)
    }

    return { t: +t.toFixed(2), y1, y2 }
  })
}

export default function ChartsInner({ points, comparisonPoints }) {
  const hasComp = !!(comparisonPoints?.length)
  const data = buildChartData(points, hasComp ? comparisonPoints : null)

  return (
    <div className={styles.charts}>
      <div className={styles.chart}>
        <div className={styles.chartHeader}>
          <p className={`${styles.chartLabel} bn`}>উচ্চতা–সময় (y–t)</p>
          {hasComp && (
            <div className={styles.legend}>
              <span className={styles.legendDot} style={{ background: '#1CAB55' }} />
              <span className="bn" style={{ fontSize: 11 }}>প্রক্ষেপ ১</span>
              <span className={styles.legendDot} style={{ background: '#EA580C' }} />
              <span className="bn" style={{ fontSize: 11 }}>প্রক্ষেপ ২</span>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (সে)', position: 'insideBottomRight', fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v, name) => [v, name === 'y1' ? 'প্রক্ষেপ ১' : 'প্রক্ষেপ ২']} />
            <Line type="monotone" dataKey="y1" stroke="#1CAB55" strokeWidth={2} dot={false} connectNulls={false} />
            {hasComp && <Line type="monotone" dataKey="y2" stroke="#EA580C" strokeWidth={2} dot={false} connectNulls={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
