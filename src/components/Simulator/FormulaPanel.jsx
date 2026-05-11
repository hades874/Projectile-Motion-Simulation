import { KatexBlock, KatexInline } from '../Common/KatexExpr.jsx'
import { formatNum } from '../../lib/bangla.js'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './FormulaPanel.module.css'

// ── LaTeX generic formulas ────────────────────────────────────────────────────

const GENERIC = {
  T: 'T = \\dfrac{v_0 \\sin\\theta + \\sqrt{(v_0 \\sin\\theta)^2 + 2gh_0}}{g}',
  H: 'H = h_0 + \\dfrac{(v_0 \\sin\\theta)^2}{2g}',
  R: 'R = v_0 \\cos\\theta \\times T',
}

const GENERIC_N = (n) => ({
  T: `T_{${n}} = \\dfrac{v_{0${n}}\\sin\\theta_{${n}} + \\sqrt{(v_{0${n}}\\sin\\theta_{${n}})^2 + 2gh_{0${n}}}}{g}`,
  H: `H_{${n}} = h_{0${n}} + \\dfrac{(v_{0${n}}\\sin\\theta_{${n}})^2}{2g}`,
  R: `R_{${n}} = v_{0${n}}\\cos\\theta_{${n}} \\times T_{${n}}`,
})

// ── Substituted LaTeX builders ────────────────────────────────────────────────

function makeSubs(params, results, n) {
  const { v0, theta, h0 } = params
  const sub = n !== null ? `_{${n}}` : ''
  const v0f = +v0.toFixed(1)
  const tf  = +theta.toFixed(0)
  const h0f = +h0.toFixed(1)
  const Tf  = +results.T.toFixed(2)

  return {
    T: `T${sub} = \\dfrac{${v0f}\\sin ${tf}^\\circ + \\sqrt{(${v0f}\\sin ${tf}^\\circ)^2 + 2{\\times}9.8{\\times}${h0f}}}{9.8}`,
    H: `H${sub} = ${h0f} + \\dfrac{(${v0f}\\sin ${tf}^\\circ)^2}{2{\\times}9.8}`,
    R: `R${sub} = ${v0f}\\cos ${tf}^\\circ {\\times} ${Tf}`,
  }
}

// ── Physics comparison insight builder ────────────────────────────────────────

function buildInsights(p1, r1, p2, r2, lang, strings) {
  const DEG = Math.PI / 180
  const vy1 = +(p1.v0 * Math.sin(p1.theta * DEG)).toFixed(1)
  const vy2 = +(p2.v0 * Math.sin(p2.theta * DEG)).toFixed(1)
  const vx1 = +(p1.v0 * Math.cos(p1.theta * DEG)).toFixed(1)
  const vx2 = +(p2.v0 * Math.cos(p2.theta * DEG)).toFixed(1)
  const f2 = v => +v.toFixed(2)
  const f1 = v => +v.toFixed(1)

  const s = strings.insights
  const joiner = lang === 'bn' ? ' এবং ' : ' and '

  const FORMULA_META_LOCAL = [
    { key: 'T', color: '#EA580C', bg: '#FFF7ED', border: '#fed7aa' },
    { key: 'H', color: '#274FE3', bg: '#EEF2FF', border: '#c7d2fe' },
    { key: 'R', color: '#1CAB55', bg: '#F0FBF4', border: '#bbf7d0' },
  ]

  // T insight
  let tVerdict, tExpl
  const Tdiff = f2(r1.T) - f2(r2.T)
  if (Math.abs(Tdiff) < 0.05) {
    tVerdict = 'T_1 \\approx T_2'
    tExpl = s.T.approx.replace('{val}', f2(r1.T))
  } else if (Tdiff > 0) {
    tVerdict = 'T_1 > T_2'
    const rs = []
    if (vy1 >= vy2) rs.push(s.T.reasonVy.replace('{n}', '₁').replace('{vy}', vy1))
    if (p1.h0 > p2.h0) rs.push(s.T.reasonH0.replace('{n}', '₁').replace('{h0}', p1.h0))
    tExpl = s.T.p1Higher.replace('{t1}', f2(r1.T)).replace('{t2}', f2(r2.T)).replace('{reasons}', rs.join(joiner) || s.T.reasonGeneric)
  } else {
    tVerdict = 'T_2 > T_1'
    const rs = []
    if (vy2 >= vy1) rs.push(s.T.reasonVy.replace('{n}', '₂').replace('{vy}', vy2))
    if (p2.h0 > p1.h0) rs.push(s.T.reasonH0.replace('{n}', '₂').replace('{h0}', p2.h0))
    tExpl = s.T.p2Higher.replace('{t1}', f2(r1.T)).replace('{t2}', f2(r2.T)).replace('{reasons}', rs.join(joiner) || s.T.reasonGeneric)
  }

  // H insight
  let hVerdict, hExpl
  const Hdiff = f1(r1.H) - f1(r2.H)
  if (Math.abs(Hdiff) < 0.1) {
    hVerdict = 'H_1 \\approx H_2'
    hExpl = s.H.approx.replace('{val}', f1(r1.H))
  } else if (Hdiff > 0) {
    hVerdict = 'H_1 > H_2'
    const rs = []
    if (vy1 >= vy2) rs.push(s.H.reasonVy.replace('{vy1}', vy1).replace('{vy2}', vy2))
    if (p1.h0 > p2.h0) rs.push(s.H.reasonH0.replace('{n}', '₁').replace('{h0}', p1.h0))
    hExpl = s.H.p1Higher.replace('{h1}', f1(r1.H)).replace('{h2}', f1(r2.H)).replace('{reasons}', rs.join(joiner) || s.H.reasonGeneric)
  } else {
    hVerdict = 'H_2 > H_1'
    const rs = []
    if (vy2 >= vy1) rs.push(s.H.reasonVy.replace('{vy1}', vy1).replace('{vy2}', vy2))
    if (p2.h0 > p1.h0) rs.push(s.H.reasonH0.replace('{n}', '₂').replace('{h0}', p2.h0))
    hExpl = s.H.p2Higher.replace('{h1}', f1(r1.H)).replace('{h2}', f1(r2.H)).replace('{reasons}', rs.join(joiner) || s.H.reasonGeneric)
  }

  // R insight
  let rVerdict, rExpl
  const Rdiff = f1(r1.R) - f1(r2.R)
  const isComplementary = p1.h0 === 0 && p2.h0 === 0 && Math.abs(p1.theta + p2.theta - 90) < 2
  if (isComplementary && Math.abs(Rdiff) < 0.5) {
    rVerdict = 'R_1 = R_2'
    rExpl = s.R.complementary.replace('{val}', f1(r1.R)).replace('{theta1}', p1.theta).replace('{theta2}', p2.theta)
  } else if (Math.abs(Rdiff) < 0.2) {
    rVerdict = 'R_1 \\approx R_2'
    rExpl = s.R.approx.replace('{val}', f1(r1.R))
  } else if (Rdiff > 0) {
    rVerdict = 'R_1 > R_2'
    const rs = []
    if (vx1 >= vx2) rs.push(s.R.reasonVx.replace('{n}', '₁').replace('{vx}', vx1))
    if (f2(r1.T) > f2(r2.T)) rs.push(s.R.reasonT.replace('{n}', '₁').replace('{t}', f2(r1.T)))
    rExpl = s.R.p1Higher.replace('{r1}', f1(r1.R)).replace('{r2}', f1(r2.R)).replace('{reasons}', rs.join(joiner) || s.R.reasonGeneric)
  } else {
    rVerdict = 'R_2 > R_1'
    const rs = []
    if (vx2 >= vx1) rs.push(s.R.reasonVx.replace('{n}', '₂').replace('{vx}', vx2))
    if (f2(r2.T) > f2(r1.T)) rs.push(s.R.reasonT.replace('{n}', '₂').replace('{t}', f2(r2.T)))
    rExpl = s.R.p2Higher.replace('{r1}', f1(r1.R)).replace('{r2}', f1(r2.R)).replace('{reasons}', rs.join(joiner) || s.R.reasonGeneric)
  }

  return [
    { meta: FORMULA_META_LOCAL[0], verdict: tVerdict, explanation: tExpl },
    { meta: FORMULA_META_LOCAL[1], verdict: hVerdict, explanation: hExpl },
    { meta: FORMULA_META_LOCAL[2], verdict: rVerdict, explanation: rExpl },
  ]
}

// ── Main component ────────────────────────────────────────────────────────────

export function FormulaPanel({ params, results, comparison }) {
  const { language } = useLanguage()
  const strings = getTranslations(language).senior
  const hasComp = !!comparison
  const fmt = (v, d = 1) => formatNum(v ?? 0, d, language === 'bn' ? 'bangla' : 'western')

  const sub1     = makeSubs(params, results, hasComp ? 1 : null)
  const sub2     = hasComp ? makeSubs(comparison.params, comparison.results, 2) : null
  const generic1 = hasComp ? GENERIC_N(1) : GENERIC
  const insights = hasComp ? buildInsights(params, results, comparison.params, comparison.results, language, strings) : null

  const FORMULA_ROWS = [
    { key: 'T', label: strings.formulaLabels.T, color: '#EA580C', bg: '#FFF7ED', border: '#fed7aa', unit: strings.formulaUnits.s, decimals: 2 },
    { key: 'H', label: strings.formulaLabels.H, color: '#274FE3', bg: '#EEF2FF', border: '#c7d2fe', unit: strings.formulaUnits.m, decimals: 1 },
    { key: 'R', label: strings.formulaLabels.R, color: '#1CAB55', bg: '#F0FBF4', border: '#bbf7d0', unit: strings.formulaUnits.m, decimals: 1 },
  ]

  return (
    <div className={styles.panel}>
      {hasComp && (
        <div className={styles.groupHeader} style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
          <span className={styles.groupDot} style={{ background: '#374151' }} />
          <span className={language === 'bn' ? 'bn' : ''}>{strings.formulaLabels.p1}</span>
        </div>
      )}

      <div className={styles.list}>
        {FORMULA_ROWS.map(m => (
          <FormulaRow
            key={m.key}
            meta={m}
            badgeTex={hasComp ? `${m.key}_1` : m.key}
            genericTex={generic1[m.key]}
            subTex={sub1[m.key]}
            result={fmt(results[m.key], m.decimals)}
            unit={m.unit}
            lang={language}
          />
        ))}
      </div>

      {hasComp && comparison && (
        <>
          <div className={styles.groupHeader} style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #fed7aa' }}>
            <span className={styles.groupDot} style={{ background: '#EA580C' }} />
            <span className={language === 'bn' ? 'bn' : ''}>{strings.formulaLabels.p2}</span>
          </div>

          <div className={styles.list}>
            {FORMULA_ROWS.map(m => (
              <FormulaRow
                key={`c_${m.key}`}
                meta={m}
                badgeTex={`${m.key}_2`}
                genericTex={GENERIC_N(2)[m.key]}
                subTex={sub2[m.key]}
                result={fmt(comparison.results[m.key], m.decimals)}
                unit={m.unit}
                lang={language}
              />
            ))}
          </div>

          <div className={styles.compSection}>
            <div className={`${styles.compTitle} ${language === 'bn' ? 'bn' : ''}`}>{strings.formulaLabels.analysis}</div>
            <div className={styles.compList}>
              {insights.map((ins, i) => (
                <InsightCard key={i} insight={ins} lang={language} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FormulaRow({ meta, badgeTex, genericTex, subTex, result, unit, lang }) {
  return (
    <div
      className={styles.row}
      style={{ '--f-color': meta.color, '--f-bg': meta.bg, '--f-border': meta.border }}
    >
      <div className={styles.rowHeader}>
        <div className={styles.symbolBadge} style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          <KatexInline tex={badgeTex} />
        </div>
        <span className={`${styles.rowLabel} ${lang === 'bn' ? 'bn' : ''}`}>{meta.label}</span>
      </div>

      <div className={styles.genericFormula}>
        <KatexBlock tex={genericTex} />
      </div>

      <div className={styles.substitutedRow}>
        <KatexBlock tex={subTex} />
      </div>

      <div className={styles.resultRow}>
        <span className={`${styles.result} ${lang === 'bn' ? 'bn' : ''}`} style={{ color: meta.color }}>
          = {result} {unit}
        </span>
      </div>
    </div>
  )
}

function InsightCard({ insight, lang }) {
  const { meta, verdict, explanation } = insight
  return (
    <div
      className={styles.insightCard}
      style={{ '--ins-color': meta.color, '--ins-bg': meta.bg, '--ins-border': meta.border }}
    >
      <div className={styles.insightHeader}>
        <div className={styles.insightBadge} style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          {meta.key}
        </div>
        <div className={styles.insightVerdict}>
          <KatexInline tex={verdict} />
        </div>
      </div>
      <p className={`${styles.insightExpl} ${lang === 'bn' ? 'bn' : ''}`}>{explanation}</p>
    </div>
  )
}
