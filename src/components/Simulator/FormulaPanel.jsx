import { formatNum } from '../../lib/bangla.js'
import styles from './FormulaPanel.module.css'

export function FormulaPanel({ params, results, strings, numerals }) {
  const { v0, theta, h0 } = params
  const { T, H, R } = results
  const fmt = (v, d = 1) => formatNum(v, numerals, d)

  return (
    <div className={styles.panel}>
      <h3 className={`${styles.title} bn`}>{strings.title}</h3>
      <div className={styles.list}>
        <FormulaRow
          formula="T"
          expr={`[${fmt(v0)} sin ${fmt(theta)}° + √((${fmt(v0)} sin ${fmt(theta)}°)² + 2×9.8×${fmt(h0)})] / 9.8`}
          result={`${fmt(T, 2)} s`}
        />
        <FormulaRow
          formula="H"
          expr={`${fmt(h0)} + (${fmt(v0)} sin ${fmt(theta)}°)² / (2×9.8)`}
          result={`${fmt(H)} m`}
        />
        <FormulaRow
          formula="R"
          expr={`${fmt(v0)} cos ${fmt(theta)}° × ${fmt(T, 2)}`}
          result={`${fmt(R)} m`}
        />
      </div>
    </div>
  )
}

function FormulaRow({ formula, expr, result }) {
  return (
    <div className={styles.row}>
      <div className={styles.formulaHead}>
        <span className={styles.var}>{formula} =</span>
        <span className={styles.expr}>{expr}</span>
      </div>
      <span className={styles.result}>{result}</span>
    </div>
  )
}
