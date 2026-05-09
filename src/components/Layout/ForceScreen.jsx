import { useNavigate } from 'react-router-dom'
import { useForceSimulator } from '../../hooks/useForceSimulator.js'
import { MotionTab }   from '../Forces/MotionTab.jsx'
import { TugOfWarTab } from '../Forces/TugOfWarTab.jsx'
import { IntroModal }  from '../Common/IntroModal.jsx'
import TourOverlay     from '../Common/TourOverlay.jsx'
import strings from '../../content/forces.bn.json'
import styles from './ForceScreen.module.css'

const TABS = [
  { id: 'tug',    label: strings.tabs.tug },
  { id: 'motion', label: strings.tabs.motion },
]

export function ForceScreen() {
  const navigate = useNavigate()
  const { state, setTab, togglePusher, setParam, start, pause, reset, tick } = useForceSimulator()
  const active = state.activeTab

  const forceSteps = [
    {
      targetId: 'force-tabs',
      placement: 'bottom',
      title: 'ল্যাব সিলেকশন',
      body: 'এখান থেকে আপনি "টানাহেঁচড়া" বা "গতি" ল্যাবের মধ্যে সুইচ করতে পারবেন।'
    },
    {
      targetId: 'force-main',
      placement: 'top',
      title: 'সিমুলেশন এরিয়া',
      body: 'এটি আপনার মূল ল্যাব এরিয়া। এখানে আপনি বল প্রয়োগ করে বস্তুর গতি পর্যবেক্ষণ করতে পারবেন।'
    }
  ]

  return (
    <div className={styles.screen}>
      <div className={styles.backgroundDecorations} aria-hidden="true">
        <div className={styles.hill} />
        <div className={styles.grassTuft} style={{ left: '10%' }} />
        <div className={styles.grassTuft} style={{ left: '30%' }} />
        <div className={styles.grassTuft} style={{ left: '60%' }} />
        <div className={styles.grassTuft} style={{ left: '85%' }} />
      </div>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="পেছনে">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className={styles.logo}>10MS</span>
        <h1 className={`${styles.title} bn`}>{strings.title}</h1>
        <div className={styles.headerSpacer} />

      </header>

      {/* Tab bar */}
      <nav className={styles.tabs} aria-label="সিমুলেশন ট্যাব" data-tour="force-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.activeTab : ''}`}
            onClick={() => setTab(tab.id)}
          >
            <span className="bn">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className={styles.mainArea} data-tour="force-main">
        {active === 'tug' && (
          <TugOfWarTab
            state={state.tug}
            togglePusher={togglePusher}
            start={start} pause={pause} reset={reset} tick={tick}
          />
        )}
        {active === 'motion' && (
          <MotionTab
            state={state.motion}
            setParam={setParam}
            start={start} pause={pause} reset={reset} tick={tick}
          />
        )}
      </div>

      <TourOverlay 
        steps={forceSteps} 
        storageKey="10ms_sim_junior_tour"
        blockedByKey="10ms_sim_junior"
      />

      <IntroModal
        storageKey="10ms_sim_junior"
        variant="junior"
        title="বল ও গতি"
        badge="জুনিয়র · এসএসসি অধ্যায় ২"
        description="নিউটনের গতিসূত্র ও ঘর্ষণ বল নিয়ে দুটি ইন্টারেক্টিভ ল্যাবে অংশ নাও। বস্তু টেনে, ঠেলে বা টানাটানি করে সরাসরি দেখো কীভাবে বল কাজ করে।"
        outcomes={[
          'লব্ধি বল গণনা করে তার প্রভাব সরাসরি পর্যবেক্ষণ করতে পারবে',
          'নিউটনের দ্বিতীয় সূত্র F = ma বিভিন্ন বস্তুতে প্রয়োগ করতে পারবে',
          'স্থিতিঘর্ষণ ও গতিঘর্ষর্ষণের পার্থক্য ও গ্রাফ বুঝতে পারবে',
          'বিভিন্ন তলের ঘর্ষণ সহগ তুলনা ও মূল্যায়ন করতে পারবে',
        ]}
        ctaLabel="ল্যাবে প্রবেশ করি"
      />
    </div>
  )
}

export default ForceScreen
