import { useNavigate } from 'react-router-dom'
import { SIMULATIONS } from '../../data/simulations.js'
import styles from './SimSelector.module.css'

export function SimSelector() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo10ms}>10MS</span>
          <div className={styles.titleBlock}>
            <span className={`${styles.appName} bn`}>পদার্থ সিমুলেশন</span>
            <span className={styles.appSub}>Physics Simulations</span>
          </div>
        </div>
        <a
          href="https://phet.colorado.edu"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.phetBadge}
          title="Powered by PhET Interactive Simulations"
        >
          <PhetLogo />
          <span className={styles.phetLabel}>PhET</span>
        </a>
      </header>

      <main className={styles.main}>
        <p className={`${styles.subtitle} bn`}>একটি সিমুলেশন বেছে নাও</p>
        <div className={styles.grid}>
          {SIMULATIONS.map(sim => (
            <SimCard key={sim.id} sim={sim} onSelect={() => navigate(`/sim/${sim.id}`)} />
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <span className="bn">
          সিমুলেশন সরবরাহ করেছে{' '}
          <a href="https://phet.colorado.edu" target="_blank" rel="noopener noreferrer">
            PhET Interactive Simulations
          </a>
          , University of Colorado Boulder, CC BY-NC 4.0
        </span>
      </footer>
    </div>
  )
}

function SimCard({ sim, onSelect }) {
  return (
    <button className={styles.card} onClick={onSelect} style={{ '--accent': sim.accentColor, '--bg': sim.color }}>
      <div className={styles.cardIllo} style={{ background: sim.color }}>
        <SimIllustration id={sim.id} color={sim.accentColor} />
      </div>
      <div className={styles.cardBody}>
        <span className={styles.curriculum}>{sim.curriculum}</span>
        <h2 className={`${styles.cardTitle} bn`}>{sim.titleBn}</h2>
        <p className={styles.cardTitleEn}>{sim.titleEn}</p>
        <p className={`${styles.cardDesc} bn`}>{sim.descBn}</p>
        <div className={styles.chips}>
          {sim.topics.slice(0, 3).map(t => (
            <span key={t} className={`${styles.chip} bn`}>{t}</span>
          ))}
        </div>
        <div className={styles.tabs}>
          <span className={`${styles.tabsLabel} bn`}>ট্যাব:</span>
          {sim.tabs.map(t => (
            <span key={t} className={`${styles.tabPill} bn`}>{t}</span>
          ))}
        </div>
      </div>
      <div className={styles.cardArrow} style={{ background: sim.accentColor }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </button>
  )
}

function SimIllustration({ id, color }) {
  if (id === 'projectile-motion') {
    return (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
        {/* Ground */}
        <line x1="8" y1="72" x2="112" y2="72" stroke="#D1D5DB" strokeWidth="2"/>
        {/* Parabola path */}
        <path d="M12 72 Q 55 10 108 72" stroke={color} strokeWidth="2.5" strokeDasharray="5 3" fill="none" strokeLinecap="round"/>
        {/* Launcher */}
        <rect x="6" y="60" width="14" height="8" rx="3" fill="#374151" transform="rotate(-40 13 64)"/>
        <circle cx="12" cy="68" r="6" fill="#111827"/>
        {/* Ball at peak */}
        <circle cx="56" cy="18" r="7" fill={color} stroke="#fff" strokeWidth="1.5"/>
        {/* Velocity vectors */}
        <line x1="56" y1="18" x2="72" y2="18" stroke="#274FE3" strokeWidth="2"/>
        <line x1="56" y1="18" x2="56" y2="30" stroke="#EA580C" strokeWidth="2"/>
        {/* Arrow heads */}
        <polygon points="72,15 78,18 72,21" fill="#274FE3"/>
        <polygon points="53,30 56,36 59,30" fill="#EA580C"/>
        {/* Landing dot */}
        <circle cx="108" cy="72" r="4" fill={color} stroke="#fff" strokeWidth="1.5"/>
      </svg>
    )
  }
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
      {/* Ground */}
      <line x1="8" y1="68" x2="112" y2="68" stroke="#D1D5DB" strokeWidth="2"/>
      {/* Box/crate */}
      <rect x="44" y="44" width="32" height="24" rx="3" fill="#374151"/>
      <rect x="46" y="46" width="28" height="20" rx="2" fill="#4B5563"/>
      {/* Cross on box */}
      <line x1="44" y1="44" x2="76" y2="68" stroke="#6B7280" strokeWidth="1"/>
      <line x1="76" y1="44" x2="44" y2="68" stroke="#6B7280" strokeWidth="1"/>
      {/* Force arrow (right) */}
      <line x1="76" y1="56" x2="100" y2="56" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <polygon points="100,52 108,56 100,60" fill={color}/>
      <text x="83" y="50" fontSize="10" fill={color} fontWeight="700">F</text>
      {/* Force arrow (left, smaller) */}
      <line x1="44" y1="56" x2="26" y2="56" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="26,52 18,56 26,60" fill="#EA580C"/>
      {/* Friction marks */}
      <line x1="52" y1="68" x2="52" y2="74" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="60" y1="68" x2="60" y2="74" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="68" y1="68" x2="68" y2="74" stroke="#9CA3AF" strokeWidth="1.5"/>
    </svg>
  )
}

function PhetLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#235089"/>
      <text x="20" y="26" fontSize="14" fontWeight="700" fill="#fff" textAnchor="middle">Ph</text>
    </svg>
  )
}
