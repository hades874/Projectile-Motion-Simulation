import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import styles from './ChartsInner.module.css'

export default function ChartsInner({ points, results }) {
  const data = points.map(p => ({
    t: parseFloat(p.t.toFixed(2)),
    y: parseFloat(p.y.toFixed(2)),
  }))

  return (
    <div className={styles.charts}>
      <div className={styles.chart}>
        <p className={`${styles.chartLabel} bn`}>উচ্চতা–সময় (y–t)</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottomRight', fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="y" stroke="#1CAB55" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
