import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ModeSelect } from './components/Layout/ModeSelect.jsx'
import { LoadingScreen } from './components/Common/LoadingScreen.jsx'
import { LanguageProvider } from './hooks/useLanguage.jsx'

const ForceScreen = lazy(() => import('./components/Layout/ForceScreen.jsx'))
const SeniorPage = lazy(() => import('./components/Layout/SeniorPage.jsx'))

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/"       element={<ModeSelect />} />
            <Route path="/junior" element={<ForceScreen />} />
            <Route path="/senior" element={<SeniorPage />} />
            <Route path="*"       element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </LanguageProvider>
  )
}
