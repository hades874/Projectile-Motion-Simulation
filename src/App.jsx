import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ModeSelect }  from './components/Layout/ModeSelect.jsx'
import { ForceScreen } from './components/Layout/ForceScreen.jsx'
import { SeniorPage }  from './components/Layout/SeniorPage.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"       element={<ModeSelect />} />
        <Route path="/junior" element={<ForceScreen />} />
        <Route path="/senior" element={<SeniorPage />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
