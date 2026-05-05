import { formatNum } from '../../lib/bangla.js'
import styles from './FormulaPanel.module.css'

const FORMULA_META = [
  {
    symbol: 'T',
    label: 'উড্ডয়নকাল',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#fed7aa',
    generic: 'T = [v₀ sinθ + √((v₀ sinθ)² + 2gh₀)] / g',
    unit: 'সে',
    decimals: 2,
    key: 'T',
  },
  {
    symbol: 'H',
    label: 'সর্বোচ্চ উচ্চতা',
    color: '#274FE3',
    bg: '#EEF2FF',
    border: '#c7d2fe',
    generic: 'H = h₀ + (v₀ sinθ)² / 2g',
    unit: 'মি',
    decimals: 1,
    key: 'H',
  },
  {
    symbol: 'R',
    label: 'অনুভূমিক পাল্লা',
    color: '#1CAB55',
    bg: '#F0FBF4',
    border: '#bbf7d0',
    generic: 'R = v₀ cosθ × T',
    unit: 'মি',
    decimals: 1,
    key: 'R',
  },
]

export function FormulaPanel({ params, results, strings }) {
  const { v0, theta, h0 } = params
  const { T, H, R } = results
  const fmt = (v, d = 1) => formatNum(v, d, 'bangla')

  const substituted = {
    T: `[${fmt(v0)} sin ${fmt(theta)}° + √((${fmt(v0)} sin ${fmt(theta)}°)² + 2×9.8×${fmt(h0)})] / 9.8`,
    H: `${fmt(h0)} + (${fmt(v0)} sin ${fmt(theta)}°)² / (2×9.8)`,
    R: `${fmt(v0)} cos ${fmt(theta)}° × ${fmt(T, 2)}`,
  }

  const values = { T, H, R }

  return (
    <div className={styles.panel}>
      <div className={styles.list}>
        {FORMULA_META.map(m => (
          <FormulaRow
            key={m.symbol}
            meta={m}
            substituted={substituted[m.symbol]}
            result={fmt(values[m.key], m.decimals)}
          />
        ))}
      </div>
    </div>
  )
}

function FormulaRow({ meta, substituted, result }) {
  return (
    <div
      className={styles.row}
      style={{ '--f-color': meta.color, '--f-bg': meta.bg, '--f-border': meta.border }}
    >
      <div className={styles.rowHeader}>
        <div className={styles.symbolBadge} style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          {meta.symbol}
        </div>
        <span className={`${styles.rowLabel} bn`}>{meta.label}</span>
      </div>

      <div className={styles.genericFormula}>{meta.generic}</div>

      <div className={styles.substitutedRow}>
        <span className={styles.equalsSign}>{meta.symbol} =</span>
        <span className={styles.expr}>{substituted}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={`${styles.result} bn`} style={{ color: meta.color }}>
          = {result} {meta.unit}
        </span>
      </div>
    </div>
  )
}
