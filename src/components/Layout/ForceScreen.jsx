import { useNavigate } from 'react-router-dom'
import { useForceSimulator } from '../../hooks/useForceSimulator.js'
import { MotionTab }    from '../Forces/MotionTab.jsx'
import { FrictionTab }  from '../Forces/FrictionTab.jsx'
import { TugOfWarTab }  from '../Forces/TugOfWarTab.jsx'
import strings from '../../content/forces.bn.json'
import styles from './ForceScreen.module.css'

const TABS = [
  { id: 'tug',      label: strings.tabs.tug },
  { id: 'motion',   label: strings.tabs.motion },
  { id: 'friction', label: strings.tabs.friction },
]

export function ForceScreen() {
  const navigate = useNavigate()
  const { state, setTab, togglePusher, setParam, start, pause, reset, tick } = useForceSimulator()
  const active = state.activeTab

  return (
    <div className={styles.screen}>
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
      <nav className={styles.tabs} aria-label="সিমুলেশন ট্যাব">
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
      <div className={styles.mainArea}>
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
        {active === 'friction' && (
          <FrictionTab
            state={state.friction}
            setParam={setParam}
            start={start} pause={pause} reset={reset} tick={tick}
          />
        )}
      </div>
    </div>
  )
}
