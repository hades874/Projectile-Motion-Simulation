import { KatexBlock, KatexInline } from '../Common/KatexExpr.jsx'
import { formatNum } from '../../lib/bangla.js'
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

const FORMULA_META = [
  { key: 'T', label: 'উড্ডয়নকাল',    color: '#EA580C', bg: '#FFF7ED', border: '#fed7aa', unit: 'সে', decimals: 2 },
  { key: 'H', label: 'সর্বোচ্চ উচ্চতা', color: '#274FE3', bg: '#EEF2FF', border: '#c7d2fe', unit: 'মি', decimals: 1 },
  { key: 'R', label: 'অনুভূমিক পাল্লা', color: '#1CAB55', bg: '#F0FBF4', border: '#bbf7d0', unit: 'মি', decimals: 1 },
]

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

function buildInsights(p1, r1, p2, r2) {
  const DEG = Math.PI / 180
  const vy1 = +(p1.v0 * Math.sin(p1.theta * DEG)).toFixed(1)
  const vy2 = +(p2.v0 * Math.sin(p2.theta * DEG)).toFixed(1)
  const vx1 = +(p1.v0 * Math.cos(p1.theta * DEG)).toFixed(1)
  const vx2 = +(p2.v0 * Math.cos(p2.theta * DEG)).toFixed(1)
  const f2 = v => +v.toFixed(2)
  const f1 = v => +v.toFixed(1)

  // T insight
  let tVerdict, tExpl
  const Tdiff = f2(r1.T) - f2(r2.T)
  if (Math.abs(Tdiff) < 0.05) {
    tVerdict = 'T_1 \\approx T_2'
    tExpl = `উভয় প্রক্ষেপের উড্ডয়নকাল প্রায় সমান (≈ ${f2(r1.T)} সে)। উল্লম্ব বেগ উপাংশ ও প্রাথমিক উচ্চতা প্রায় একই, তাই T = (v₀sinθ + √…)/g সূত্রে মানও সমান।`
  } else if (Tdiff > 0) {
    tVerdict = 'T_1 > T_2'
    const rs = []
    if (vy1 >= vy2) rs.push(`উল্লম্ব বেগ বেশি (v₀₁sinθ₁ ≈ ${vy1} মি/সে)`)
    if (p1.h0 > p2.h0) rs.push(`প্রাথমিক উচ্চতা বেশি (h₀₁ = ${p1.h0} মি)`)
    tExpl = `প্রক্ষেপ ১ বেশিক্ষণ আকাশে থাকে (T₁ = ${f2(r1.T)} সে > T₂ = ${f2(r2.T)} সে)। কারণ ${rs.join(' এবং ') || 'উল্লম্ব গতির পার্থক্য'}। বেশি উল্লম্ব বেগ বা উচ্চতায় বল বেশিক্ষণ উপরে থাকে।`
  } else {
    tVerdict = 'T_2 > T_1'
    const rs = []
    if (vy2 >= vy1) rs.push(`উল্লম্ব বেগ বেশি (v₀₂sinθ₂ ≈ ${vy2} মি/সে)`)
    if (p2.h0 > p1.h0) rs.push(`প্রাথমিক উচ্চতা বেশি (h₀₂ = ${p2.h0} মি)`)
    tExpl = `প্রক্ষেপ ২ বেশিক্ষণ আকাশে থাকে (T₂ = ${f2(r2.T)} সে > T₁ = ${f2(r1.T)} সে)। কারণ ${rs.join(' এবং ') || 'উল্লম্ব গতির পার্থক্য'}। বেশি উল্লম্ব বেগ বা উচ্চতায় বল বেশিক্ষণ উপরে থাকে।`
  }

  // H insight
  let hVerdict, hExpl
  const Hdiff = f1(r1.H) - f1(r2.H)
  if (Math.abs(Hdiff) < 0.1) {
    hVerdict = 'H_1 \\approx H_2'
    hExpl = `উভয় প্রক্ষেপ প্রায় একই উচ্চতায় পৌঁছেছে (≈ ${f1(r1.H)} মি)। H = h₀ + (v₀sinθ)²/2g সূত্রে উল্লম্ব বেগ ও প্রাথমিক উচ্চতা সমান থাকায় H-ও সমান।`
  } else if (Hdiff > 0) {
    hVerdict = 'H_1 > H_2'
    const rs = []
    if (vy1 >= vy2) rs.push(`উল্লম্ব বেগ বেশি (${vy1} মি/সে > ${vy2} মি/সে)`)
    if (p1.h0 > p2.h0) rs.push(`প্রাথমিক উচ্চতা বেশি (h₀₁ = ${p1.h0} মি)`)
    hExpl = `প্রক্ষেপ ১ বেশি উচ্চতায় পৌঁছেছে (H₁ = ${f1(r1.H)} মি > H₂ = ${f1(r2.H)} মি)। কারণ ${rs.join(' এবং ') || 'উল্লম্ব গতির পার্থক্য'}। H = h₀ + (v₀sinθ)²/2g-এ উল্লম্ব বেগ বর্গের সাথে বাড়ে।`
  } else {
    hVerdict = 'H_2 > H_1'
    const rs = []
    if (vy2 >= vy1) rs.push(`উল্লম্ব বেগ বেশি (${vy2} মি/সে > ${vy1} মি/সে)`)
    if (p2.h0 > p1.h0) rs.push(`প্রাথমিক উচ্চতা বেশি (h₀₂ = ${p2.h0} মি)`)
    hExpl = `প্রক্ষেপ ২ বেশি উচ্চতায় পৌঁছেছে (H₂ = ${f1(r2.H)} মি > H₁ = ${f1(r1.H)} মি)। কারণ ${rs.join(' এবং ') || 'উল্লম্ব গতির পার্থক্য'}। H = h₀ + (v₀sinθ)²/2g-এ উল্লম্ব বেগ বর্গের সাথে বাড়ে।`
  }

  // R insight
  let rVerdict, rExpl
  const Rdiff = f1(r1.R) - f1(r2.R)
  const isComplementary = p1.h0 === 0 && p2.h0 === 0 && Math.abs(p1.theta + p2.theta - 90) < 2
  if (isComplementary && Math.abs(Rdiff) < 0.5) {
    rVerdict = 'R_1 = R_2'
    rExpl = `দুই প্রক্ষেপের পাল্লা সমান (≈ ${f1(r1.R)} মি) — এটি প্রক্ষেপ গতির বিখ্যাত প্রতিসাম্য! পরিপূরক কোণ ${p1.theta}° ও ${p2.theta}° (যোগফল ৯০°) একই প্রাথমিক বেগে একই পাল্লা দেয়। কারণ R = v₀²sin(2θ)/g এবং sin(2θ) = sin(180°−2θ)।`
  } else if (Math.abs(Rdiff) < 0.2) {
    rVerdict = 'R_1 \\approx R_2'
    rExpl = `উভয় প্রক্ষেপের পাল্লা প্রায় সমান (≈ ${f1(r1.R)} মি)। R = v₀cosθ × T সূত্রে অনুভূমিক বেগ ও উড্ডয়নকালের গুণফল কাছাকাছি হওয়ায় এটি ঘটেছে।`
  } else if (Rdiff > 0) {
    rVerdict = 'R_1 > R_2'
    const rs = []
    if (vx1 >= vx2) rs.push(`অনুভূমিক বেগ বেশি (v₀₁cosθ₁ ≈ ${vx1} মি/সে)`)
    if (f2(r1.T) > f2(r2.T)) rs.push(`উড্ডয়নকালও বেশি (T₁ = ${f2(r1.T)} সে)`)
    rExpl = `প্রক্ষেপ ১ বেশি দূর যায় (R₁ = ${f1(r1.R)} মি > R₂ = ${f1(r2.R)} মি)। কারণ ${rs.join(' এবং ') || 'অনুভূমিক গতির পার্থক্য'}। R = v₀cosθ × T সূত্রে উভয় উপাদান বাড়লে পাল্লা বাড়ে।`
  } else {
    rVerdict = 'R_2 > R_1'
    const rs = []
    if (vx2 >= vx1) rs.push(`অনুভূমিক বেগ বেশি (v₀₂cosθ₂ ≈ ${vx2} মি/সে)`)
    if (f2(r2.T) > f2(r1.T)) rs.push(`উড্ডয়নকালও বেশি (T₂ = ${f2(r2.T)} সে)`)
    rExpl = `প্রক্ষেপ ২ বেশি দূর যায় (R₂ = ${f1(r2.R)} মি > R₁ = ${f1(r1.R)} মি)। কারণ ${rs.join(' এবং ') || 'অনুভূমিক গতির পার্থক্য'}। R = v₀cosθ × T সূত্রে উভয় উপাদান বাড়লে পাল্লা বাড়ে।`
  }

  return [
    { meta: FORMULA_META[0], verdict: tVerdict, explanation: tExpl },
    { meta: FORMULA_META[1], verdict: hVerdict, explanation: hExpl },
    { meta: FORMULA_META[2], verdict: rVerdict, explanation: rExpl },
  ]
}

// ── Main component ────────────────────────────────────────────────────────────

export function FormulaPanel({ params, results, comparison }) {
  const hasComp = !!comparison
  const fmt = (v, d = 1) => formatNum(v ?? 0, d, 'bangla')

  const sub1     = makeSubs(params, results, hasComp ? 1 : null)
  const sub2     = hasComp ? makeSubs(comparison.params, comparison.results, 2) : null
  const generic1 = hasComp ? GENERIC_N(1) : GENERIC
  const insights = hasComp ? buildInsights(params, results, comparison.params, comparison.results) : null

  return (
    <div className={styles.panel}>
      {hasComp && (
        <div className={styles.groupHeader} style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
          <span className={styles.groupDot} style={{ background: '#374151' }} />
          <span className="bn">প্রক্ষেপ ১</span>
        </div>
      )}

      <div className={styles.list}>
        {FORMULA_META.map(m => (
          <FormulaRow
            key={m.key}
            meta={m}
            badgeTex={hasComp ? `${m.key}_1` : m.key}
            genericTex={generic1[m.key]}
            subTex={sub1[m.key]}
            result={fmt(results[m.key], m.decimals)}
            unit={m.unit}
          />
        ))}
      </div>

      {hasComp && comparison && (
        <>
          <div className={styles.groupHeader} style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #fed7aa' }}>
            <span className={styles.groupDot} style={{ background: '#EA580C' }} />
            <span className="bn">প্রক্ষেপ ২</span>
          </div>

          <div className={styles.list}>
            {FORMULA_META.map(m => (
              <FormulaRow
                key={`c_${m.key}`}
                meta={m}
                badgeTex={`${m.key}_2`}
                genericTex={GENERIC_N(2)[m.key]}
                subTex={sub2[m.key]}
                result={fmt(comparison.results[m.key], m.decimals)}
                unit={m.unit}
              />
            ))}
          </div>

          <div className={styles.compSection}>
            <div className={`${styles.compTitle} bn`}>তুলনামূলক বিশ্লেষণ</div>
            <div className={styles.compList}>
              {insights.map((ins, i) => (
                <InsightCard key={i} insight={ins} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FormulaRow({ meta, badgeTex, genericTex, subTex, result, unit }) {
  return (
    <div
      className={styles.row}
      style={{ '--f-color': meta.color, '--f-bg': meta.bg, '--f-border': meta.border }}
    >
      <div className={styles.rowHeader}>
        <div className={styles.symbolBadge} style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          <KatexInline tex={badgeTex} />
        </div>
        <span className={`${styles.rowLabel} bn`}>{meta.label}</span>
      </div>

      <div className={styles.genericFormula}>
        <KatexBlock tex={genericTex} />
      </div>

      <div className={styles.substitutedRow}>
        <KatexBlock tex={subTex} />
      </div>

      <div className={styles.resultRow}>
        <span className={`${styles.result} bn`} style={{ color: meta.color }}>
          = {result} {unit}
        </span>
      </div>
    </div>
  )
}

function InsightCard({ insight }) {
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
      <p className={`${styles.insightExpl} bn`}>{explanation}</p>
    </div>
  )
}
