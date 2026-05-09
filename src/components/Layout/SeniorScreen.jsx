import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SimCanvas }       from '../Simulator/SimCanvas.jsx'
import { Button }          from '../Common/Button.jsx'
import { Toggle }          from '../Common/Toggle.jsx'
import { Tooltip }         from '../Common/Tooltip.jsx'
import { Slider }          from '../Common/Slider.jsx'
import { FormulaPanel }    from '../Simulator/FormulaPanel.jsx'
import { GraphsPanel }     from '../Simulator/GraphsPanel.jsx'
import { ComparisonPanel } from '../Simulator/ComparisonPanel.jsx'
import { IntroModal }      from '../Common/IntroModal.jsx'
import TourOverlay         from '../Common/TourOverlay.jsx'
import { formatNum }       from '../../lib/bangla.js'
import glossary  from '../../content/glossary.bn.json'
import strings   from '../../content/senior.bn.json'
import styles    from './SeniorScreen.module.css'

const SPEED_OPTIONS = [0.5, 1, 2]

const PROJECTILE_OPTIONS = [
  { id: 'cannonball', color: '#374151' },
]

const TAB_ICONS = {
  controls:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 3v2M8 13v2M3 8h2M13 8h2"/><circle cx="16" cy="16" r="3"/><path d="M16 11v2M16 21v-2M11 16h2M21 16h-2"/></svg>,
  vectors:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  formulas:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h7"/></svg>,
  comparison: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>,
}

const RESULT_META = {
  R:     { color: '#1CAB55', bg: '#F0FBF4', border: '#bbf7d0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
  H:     { color: '#274FE3', bg: '#EEF2FF', border: '#c7d2fe', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> },
  T:     { color: '#EA580C', bg: '#FFF7ED', border: '#fed7aa', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  v_imp: { color: '#9333EA', bg: '#FAF5FF', border: '#e9d5ff', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
}

export function SeniorScreen({ state, setParam, setAnimation, toggleOverlay, setComparison, reset }) {
  const navigate = useNavigate()
  const s = strings
  const { params, animation, results, overlays, comparison, degenerate } = state

  const isPlaying  = animation.status === 'playing'
  const isPaused   = animation.status === 'paused'
  const isIdle     = animation.status === 'idle'
  const isFinished = animation.status === 'finished'
  const showImpact = isFinished || isPlaying
  const hasComp    = !!comparison

  const [activeTab, setActiveTab] = useState('controls')

  const fmt = useCallback((v, d = 1) => formatNum(v ?? 0, d, 'bangla'), [])

  const handleAnimTick = useCallback((t, status) => setAnimation({ t, status }), [setAnimation])
  const handleLaunch   = () => { if (!degenerate) setAnimation({ status: 'playing', t: 0, speed: animation.speed }) }
  const handlePause    = () => setAnimation({ status: 'paused' })
  const handleResume   = () => setAnimation({ status: 'playing' })
  const cycleSpeed     = () => {
    const next = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(animation.speed) + 1) % SPEED_OPTIONS.length]
    setAnimation({ speed: next })
  }

  const sidebarTabs = [
    { id: 'controls',   label: 'কন্ট্রোল' },
    { id: 'vectors',    label: s.tabs.vectors },
    { id: 'formulas',   label: s.tabs.formulas },
    { id: 'comparison', label: s.tabs.comparison },
  ]

  const seniorSteps = [
    {
      targetId: 'senior-canvas',
      placement: 'right',
      title: {
        beginner: 'ক্যানভাস এরিয়া',
        expert: 'সিমুলেশন ক্যানভাস'
      },
      body: {
        beginner: 'এখানে বলের গতিপথ দেখতে পাবে। আপনি জুম ইন/আউট করতে মাউস স্ক্রল ব্যবহার করতে পারেন।',
        expert: 'প্রজেক্টাইলের ট্র্যাজেক্টরি এখানে রেন্ডার হয়। এটি রিয়েল-টাইম ফিজিক্স ক্যালকুলেশন প্রদর্শন করে।'
      }
    },
    {
      targetId: 'senior-actionbar',
      placement: 'top',
      title: {
        beginner: 'অ্যাকশন বাটন',
        expert: 'সিমুলেশন কন্ট্রোলস'
      },
      body: {
        beginner: 'সিমুলেশন শুরু, বিরতি এবং গতি নিয়ন্ত্রণের জন্য এই বাটনগুলো ব্যবহার করুন।',
        expert: 'লঞ্চ, পজ এবং প্লেব্যাক স্পিড অ্যাডজাস্ট করার ইন্টারফেস।'
      }
    },
    {
      targetId: 'senior-sidebar-tabs',
      placement: 'left',
      title: {
        beginner: 'ট্যাব মেনু',
        expert: 'সাইডবার নেভিগেশন'
      },
      body: {
        beginner: 'এখানে বিভিন্ন মোড যেমন কন্ট্রোল, ভেক্টর, সূত্র এবং তুলনার মধ্যে সুইচ করা যায়।',
        expert: 'প্যারামিটার অ্যাডজাস্টমেন্ট, ভেক্টর ভিজ্যুয়ালাইজেশন এবং গাণিতিক বিশ্লেষণের জন্য ট্যাব।'
      }
    },
    {
      targetId: 'senior-params',
      placement: 'left',
      title: {
        beginner: 'প্যারামিটার স্লাইডার',
        expert: 'ইনপুট ভেরিয়েবলস'
      },
      body: {
        beginner: 'আদি বেগ, কোণ এবং উচ্চতা পরিবর্তন করে দেখুন বলটি কোথায় গিয়ে পড়ে।',
        expert: 'v₀, θ এবং h₀ ভ্যালু সেট করে বিভিন্ন সিনারিও সিমুলেট করা যায়।'
      }
    },
    {
      targetId: 'senior-results',
      placement: 'left',
      title: {
        beginner: 'ফলাফল কার্ড',
        expert: 'আউটপুট ডেটা'
      },
      body: {
        beginner: 'এখানে উড়ানের সময়, সর্বোচ্চ উচ্চতা এবং পাল্লা সরাসরি দেখতে পাবেন।',
        expert: 'ক্যালকুলেটেড ফলাফল: R (পাল্লা), H (সর্বোচ্চ উচ্চতা) এবং T (বিচরণকাল)।'
      }
    }
  ]

  const handleBeforeStep = (step) => {
    if (['senior-params', 'senior-results'].includes(step.targetId)) {
      setActiveTab('controls');
    }
  };

  return (
    <div className={styles.screen}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="পেছনে">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className={styles.headerBrand}>
          <span className={styles.logo}>10MS</span>
          <div className={styles.headerDivider} />
          <h1 className={`${styles.title} bn`}>{s.appTitle}</h1>
        </div>

        <div className={styles.headerSpacer} />

        <div className={styles.headerActions}>
          <button
            className={`${styles.resetBtn} ${isFinished ? styles.resetBtnFinished : ''}`}
            onClick={reset}
            aria-label={s.buttons.reset}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span className="bn">{s.buttons.reset}</span>
          </button>
        </div>
      </header>

      <div className={styles.mainArea}>
        {/* ── Canvas ── */}
        <div className={styles.canvasContainer}>
          <div className={styles.canvasWrap} data-tour="senior-canvas">
            <SimCanvas state={state} onAnimTick={handleAnimTick} />
          </div>

          {/* Floating action bar */}
          <div className={styles.actionBar} data-tour="senior-actionbar">
            {(isIdle || isFinished) && (
              <button
                className={`${styles.actionBtn} ${styles.launchBtn} ${degenerate ? styles.disabled : ''}`}
                onClick={handleLaunch}
                disabled={!!degenerate}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11.4 12.6 15M15 9l-6 6M5 3h4l2 2-5 5-2-2V3z"/><path d="M9 11.4A9.97 9.97 0 0 0 21 3c-4.97 0-8.73 3.26-9.6 7.4M5 14.6A9.97 9.97 0 0 0 3 21c2.57 0 4.97-.92 6.82-2.44"/>
                </svg>
                <span className="bn">{s.buttons.launch}</span>
              </button>
            )}

            {isPlaying && (
              <button className={`${styles.actionBtn} ${styles.pauseBtn}`} onClick={handlePause}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <span className="bn">{s.buttons.pause}</span>
              </button>
            )}

            {isPaused && (
              <button className={`${styles.actionBtn} ${styles.resumeBtn}`} onClick={handleResume}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span className="bn">{s.buttons.resume}</span>
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button className={`${styles.actionBtn} ${styles.speedBtn}`} onClick={cycleSpeed}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>{animation.speed}×</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTabs} data-tour="senior-sidebar-tabs">
            {sidebarTabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''} bn`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{TAB_ICONS[tab.id]}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.sidebarContent}>

            {/* ── Controls ── */}
            {activeTab === 'controls' && (
              <div className={styles.tabPanel}>
                <div className={`${styles.sectionTitle} bn`}>প্যারামিটার</div>

                <div className={styles.paramsSection} data-tour="senior-params">
                  <Tooltip text={glossary.v0}>
                    <Slider label={s.controls.v0} value={params.v0} min={1} max={100} step={1} unit={` ${s.controls.v0Unit}`} onChange={v => setParam('v0', v)} />
                  </Tooltip>
                  <Tooltip text={glossary.theta}>
                    <Slider label={s.controls.theta} value={params.theta} min={1} max={89} step={1} unit={s.controls.thetaUnit} onChange={v => setParam('theta', v)} />
                  </Tooltip>
                  <Tooltip text={glossary.h0}>
                    <Slider label={s.controls.h0} value={params.h0} min={0} max={50} step={1} unit={` ${s.controls.h0Unit}`} onChange={v => setParam('h0', v)} />
                  </Tooltip>
                </div>

                {degenerate && (
                  <div className={styles.hintBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
                    <p className={`${styles.hint} bn`}>
                      {degenerate === 'no-velocity' ? s.errors.noVelocity : s.errors.flat}
                    </p>
                  </div>
                )}

                {/* Results — main trajectory */}
                <div className={`${styles.sectionTitle} bn`}>
                  {hasComp ? 'ফলাফল — প্রক্ষেপ ১' : 'ফলাফল'}
                </div>
                <div className={styles.resultsGrid} data-tour="senior-results">
                  <ResultCard label={hasComp ? 'R₁' : 'R'} sublabel={s.readouts.range}  value={fmt(results.R)}    unit={s.readouts.rangeUnit}  meta={RESULT_META.R} />
                  <ResultCard label={hasComp ? 'H₁' : 'H'} sublabel={s.readouts.height} value={fmt(results.H)}    unit={s.readouts.heightUnit} meta={RESULT_META.H} />
                  <ResultCard label={hasComp ? 'T₁' : 'T'} sublabel={s.readouts.time}   value={fmt(results.T, 2)} unit={s.readouts.timeUnit}   meta={RESULT_META.T} />
                  {(showImpact || hasComp) && results.impact && (
                    <ResultCard label={hasComp ? 'v₁' : 'v'} sublabel={s.readouts.impactSpeed} value={fmt(results.impact.speed)} unit={s.readouts.speedUnit} meta={RESULT_META.v_imp} />
                  )}
                </div>

                {/* Results — comparison trajectory */}
                {hasComp && comparison.results && (
                  <>
                    <div className={`${styles.sectionTitle} bn`}>ফলাফল — প্রক্ষেপ ২</div>
                    <div className={styles.resultsGrid}>
                      <ResultCard label="R₂" sublabel={s.readouts.range}  value={fmt(comparison.results.R)}    unit={s.readouts.rangeUnit}  meta={RESULT_META.R} />
                      <ResultCard label="H₂" sublabel={s.readouts.height} value={fmt(comparison.results.H)}    unit={s.readouts.heightUnit} meta={RESULT_META.H} />
                      <ResultCard label="T₂" sublabel={s.readouts.time}   value={fmt(comparison.results.T, 2)} unit={s.readouts.timeUnit}   meta={RESULT_META.T} />
                      {comparison.results.impact && (
                        <ResultCard label="v₂" sublabel={s.readouts.impactSpeed} value={fmt(comparison.results.impact.speed)} unit={s.readouts.speedUnit} meta={RESULT_META.v_imp} />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Graph Settings + Charts ── */}
            {activeTab === 'vectors' && (
              <div className={styles.tabPanel}>
                <div className={`${styles.sectionTitle} bn`}>ভিজ্যুয়াল অপশন</div>
                <div className={styles.overlayToggles}>
                  <OverlayRow color="#274FE3" label={s.overlays.vectors}  checked={overlays.vectors} onChange={() => toggleOverlay('vectors')} />
                  <OverlayRow color="#1CAB55" label={s.overlays.dots}     checked={overlays.dots}    onChange={() => toggleOverlay('dots')} />
                  <OverlayRow color="#6B7280" label={s.overlays.axes}     checked={overlays.axes}    onChange={() => toggleOverlay('axes')} />
                </div>

                <div className={`${styles.sectionTitle} bn`}>গ্রাফ</div>
                <GraphsPanel
                  points={state.points}
                  comparisonPoints={comparison?.points}
                />
              </div>
            )}

            {/* ── Formulas ── */}
            {activeTab === 'formulas' && (
              <div className={styles.tabPanel}>
                <FormulaPanel params={params} results={results} comparison={comparison} />
              </div>
            )}

            {/* ── Comparison ── */}
            {activeTab === 'comparison' && (
              <div className={styles.tabPanel}>
                <ComparisonPanel comparison={comparison} onSet={setComparison} />
              </div>
            )}

          </div>
        </aside>
      </div>

      <TourOverlay 
        steps={seniorSteps} 
        storageKey="10ms_sim_senior_tour"
        blockedByKey="10ms_sim_senior"
        onBeforeStep={handleBeforeStep}
      />

      <IntroModal
        storageKey="10ms_sim_senior"
        variant="senior"
        title="প্রক্ষেপণ গতি"
        badge="সিনিয়র · এইচএসসি অধ্যায় ৩"
        description="কোণ, বেগ ও উচ্চতা পরিবর্তন করে প্রক্ষেপণ গতির রহস্য নিজেই আবিষ্কার করো। গ্রাফ, সূত্র ও পাশাপাশি তুলনায় পদার্থবিজ্ঞান আরও স্পষ্ট হয়।"
        outcomes={[
          'পাল্লা (R), সর্বোচ্চ উচ্চতা (H) ও উড়ানের সময় (T) নির্ণয় করতে পারবে',
          '৩০° ও ৬০° কোণে একই পাল্লা পাওয়ার কারণ ব্যাখ্যা করতে পারবে',
          'বেগের উপাংশ vₓ ও vᵧ এর পরিবর্তন গ্রাফে বিশ্লেষণ করতে পারবে',
          'দুটি প্রক্ষেপণ পাশাপাশি তুলনা করে পার্থক্য বের করতে পারবে',
        ]}
        ctaLabel="সিমুলেশন শুরু করি"
      />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultCard({ label, sublabel, value, unit, meta }) {
  return (
    <div className={styles.resultCard} style={{ '--card-color': meta.color, '--card-bg': meta.bg, '--card-border': meta.border }}>
      <div className={styles.resultCardTop}>
        <span className={styles.resultIcon} style={{ color: meta.color }}>{meta.icon}</span>
        <span className={styles.resultLabel} style={{ color: meta.color }}>{label}</span>
      </div>
      <div className={styles.resultValueWrap}>
        <span className={`${styles.resultValue} bn`}>{value}</span>
        <span className={styles.resultUnit}>{unit}</span>
      </div>
      <span className={`${styles.resultSublabel} bn`}>{sublabel}</span>
    </div>
  )
}

function OverlayRow({ color, label, checked, onChange }) {
  return (
    <div className={styles.overlayRow}>
      <div className={styles.overlayDot} style={{ background: color }} />
      <span className={`${styles.overlayLabel} bn`}>{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
