import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo } from 'react'
import { useForceSimulator } from '../../hooks/useForceSimulator.js'
import { parseUrlParams, updateUrlParams } from '../../lib/urlParams.js'
import { MotionTab }   from '../Forces/MotionTab.jsx'
import { TugOfWarTab } from '../Forces/TugOfWarTab.jsx'
import { IntroModal }  from '../Common/IntroModal.jsx'
import TourOverlay     from '../Common/TourOverlay.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { getTranslations } from '../../content/translations.js'
import styles from './ForceScreen.module.css'

export function ForceScreen() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const strings = getTranslations(language).forces
  const [searchParams] = useSearchParams()
  const overrides = parseUrlParams(searchParams)
  const { state, setTab, togglePusher, setParam, start, pause, reset, tick } = useForceSimulator(overrides)
  const active = state.activeTab

  // Sync state to URL
  useEffect(() => {
    const tugLeftStr = state.tug.leftTeam.map(v => v ? '1' : '0').join(',')
    const tugRightStr = state.tug.rightTeam.map(v => v ? '1' : '0').join(',')

    const urlState = {
      tab: active,
      'motion-force': state.motion.Fapplied,
      'motion-obj': state.motion.selectedObject,
      'motion-friction': state.motion.frictionOn,
      'tug-left': tugLeftStr,
      'tug-right': tugRightStr,
    }
    updateUrlParams(urlState)
  }, [
    active,
    state.motion.Fapplied,
    state.motion.selectedObject,
    state.motion.frictionOn,
    state.tug.leftTeam.join(','),
    state.tug.rightTeam.join(',')
  ])

  const TABS = [
    { id: 'tug',    label: strings.tabs.tug },
    { id: 'motion', label: strings.tabs.motion },
  ]

  const forceSteps = useMemo(() => language === 'bn' ? [
    {
      targetId: 'force-tabs',
      placement: 'bottom',
      title: 'ল্যাব সিলেকশন',
      body: 'এখান থেকে আপনি "টানাহেঁচড়া" বা "চলন ও ঘর্ষণ" ল্যাবের মধ্যে সুইচ করতে পারবেন।'
    },
    {
      targetId: 'force-main',
      placement: 'top',
      title: 'সিমুলেশন এরিয়া',
      body: 'এটি আপনার মূল ল্যাব এরিয়া। এখানে আপনি বল প্রয়োগ করে বস্তুর গতি পর্যবেক্ষণ করতে পারবেন।'
    },
    {
      targetId: 'tug-people',
      placement: 'left',
      title: 'টানাহেঁচড়া (মানুষ)',
      body: 'মানুষগুলোর উপর ক্লিক করে তাদের দড়িতে যোগ করুন। এরপর স্টার্ট বাটনে চাপ দিন।'
    },
    {
      targetId: 'tug-readouts',
      placement: 'left',
      title: 'লব্ধি বল ও বেগ',
      body: 'এখানে লব্ধি বল, ত্বরণ এবং বেগের মান সরাসরি দেখতে পাবেন।'
    },
    {
      targetId: 'tug-actions',
      placement: 'left',
      title: 'কন্ট্রোল বাটন',
      body: 'সিমুলেশন শুরু, বিরতি এবং রিসেট করার জন্য এই বাটনগুলো ব্যবহার করুন।'
    },
    {
      targetId: 'motion-force',
      placement: 'left',
      title: 'চলন ও ঘর্ষণ (বল)',
      body: 'স্লাইডার ব্যবহার করে বস্তুর উপর প্রযুক্ত বল পরিবর্তন করুন।'
    },
    {
      targetId: 'motion-objects',
      placement: 'left',
      title: 'বস্তু বদলান',
      body: 'ফ্রিজ, গাড়ি বা বক্স নির্বাচন করে দেখুন ভরের কারণে গতির কী পরিবর্তন হয়।'
    },
    {
      targetId: 'motion-friction',
      placement: 'left',
      title: 'ঘর্ষণ বল',
      body: 'ঘর্ষণ চালু বা বন্ধ করে দেখুন এটি গতিকে কীভাবে প্রভাবিত করে।'
    },
    {
      targetId: 'motion-readouts',
      placement: 'left',
      title: 'ফলাফল ও গ্রাফ',
      body: 'এখানে বস্তুর বেগ, ত্বরণ এবং ঘর্ষণ বলের মান সরাসরি দেখতে পাবেন।'
    },
    {
      targetId: 'motion-actions',
      placement: 'left',
      title: 'অ্যাকশন বাটন',
      body: 'সিমুলেশন শুরু ও রিসেট করার জন্য এই বাটনগুলো ব্যবহার করুন।'
    }
  ] : [
    {
      targetId: 'force-tabs',
      placement: 'bottom',
      title: 'Lab Selection',
      body: 'Switch between "Tug of War" and "Motion & Friction" labs here.'
    },
    {
      targetId: 'force-main',
      placement: 'top',
      title: 'Simulation Area',
      body: 'This is your main lab area. Observe object motion by applying force here.'
    },
    {
      targetId: 'tug-people',
      placement: 'left',
      title: 'Tug of War',
      body: 'Click on people to add them to the rope, then press Start.'
    },
    {
      targetId: 'tug-readouts',
      placement: 'left',
      title: 'Net Force & Velocity',
      body: 'View net force, acceleration, and velocity values here.'
    },
    {
      targetId: 'tug-actions',
      placement: 'left',
      title: 'Control Buttons',
      body: 'Use these buttons to start, pause, and reset the simulation.'
    },
    {
      targetId: 'motion-force',
      placement: 'left',
      title: 'Applied Force',
      body: 'Use the slider to change the force applied to the object.'
    },
    {
      targetId: 'motion-objects',
      placement: 'left',
      title: 'Change Objects',
      body: 'Select a fridge, car, or box to see how mass affects motion.'
    },
    {
      targetId: 'motion-friction',
      placement: 'left',
      title: 'Friction Force',
      body: 'Turn friction ON or OFF to see how it influences motion.'
    },
    {
      targetId: 'motion-readouts',
      placement: 'left',
      title: 'Results & Metrics',
      body: 'View velocity, acceleration, and friction force values here.'
    },
    {
      targetId: 'motion-actions',
      placement: 'left',
      title: 'Action Buttons',
      body: 'Use these buttons to start and reset the motion simulation.'
    }
  ], [language]);

  const handleBeforeStep = useCallback((step) => {
    if (['tug-people', 'tug-readouts', 'tug-actions'].some(id => id === step.targetId)) {
      setTab('tug');
    }
    if (['motion-force', 'motion-objects', 'motion-friction', 'motion-readouts', 'motion-actions'].some(id => id === step.targetId)) {
      setTab('motion');
    }
  }, [setTab]);

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
        <button className={styles.backBtn} onClick={() => navigate('/')} aria-label={language === 'bn' ? 'পেছনে' : 'Back'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className={styles.logo}>10MS</span>
        <h1 className={`${styles.title} ${language === 'bn' ? 'bn' : ''}`}>{strings.title}</h1>
        <div className={styles.headerSpacer} />
        <div className={styles.headerActions}>
          <TourOverlay 
            steps={forceSteps} 
            storageKey="10ms_sim_junior_tour"
            blockedByKey="10ms_sim_junior"
            onBeforeStep={handleBeforeStep}
          />
        </div>
      </header>

      {/* Tab bar */}
      <nav className={styles.tabs} aria-label={language === 'bn' ? 'সিমুলেশন ট্যাব' : 'Simulation Tabs'} data-tour="force-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.activeTab : ''}`}
            onClick={() => setTab(tab.id)}
          >
            <span className={language === 'bn' ? 'bn' : ''}>{tab.label}</span>
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

      <IntroModal
        storageKey="10ms_sim_junior"
        variant="junior"
        title={language === 'bn' ? "বল ও গতি" : "Force & Motion"}
        badge={language === 'bn' ? "জুনিয়র · এসএসসি অধ্যায় ২" : "Junior · SSC Chapter 2"}
        description={language === 'bn' ? "নিউটনের গতিসূত্র ও ঘর্ষণ বল নিয়ে দুটি ইন্টারেক্টিভ ল্যাবে অংশ নাও। বস্তু টেনে, ঠেলে বা টানাটানি করে সরাসরি দেখো কীভাবে বল কাজ করে।" : "Join two interactive labs on Newton's laws of motion and friction. See directly how force works by pulling, pushing, or competing in a tug of war."}
        outcomes={language === 'bn' ? [
          'লব্ধি বল গণনা করে তার প্রভাব সরাসরি পর্যবেক্ষণ করতে পারবে',
          'নিউটনের দ্বিতীয় সূত্র F = ma বিভিন্ন বস্তুতে প্রয়োগ করতে পারবে',
          'স্থিতিঘর্ষণ ও গতিঘর্ষর্ষণের পার্থক্য ও গ্রাফ বুঝতে পারবে',
          'বিভিন্ন তলের ঘর্ষণ সহগ তুলনা ও মূল্যায়ন করতে পারবে',
        ] : [
          'Calculate net force and observe its effects directly',
          'Apply Newton\'s second law F = ma to various objects',
          'Understand the difference and graphs of static and kinetic friction',
          'Compare and evaluate friction coefficients of different surfaces',
        ]}
        ctaLabel={language === 'bn' ? "ল্যাবে প্রবেশ করি" : "Enter Lab"}
      />
    </div>
  )
}

export default ForceScreen
