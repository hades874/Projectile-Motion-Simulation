import { useSimulator } from '../../hooks/useSimulator.js'
import { SeniorScreen } from './SeniorScreen.jsx'

export function SeniorPage() {
  const sim = useSimulator('senior')
  return <SeniorScreen {...sim} />
}
