import { useSearchParams } from 'react-router-dom'
import { useSimulator } from '../../hooks/useSimulator.js'
import { SeniorScreen } from './SeniorScreen.jsx'
import { parseUrlParams } from '../../lib/urlParams.js'

export function SeniorPage() {
  const [searchParams] = useSearchParams()
  const urlOverrides = parseUrlParams(searchParams, {})
  const sim = useSimulator('senior', urlOverrides)
  return <SeniorScreen {...sim} />
}

export default SeniorPage
