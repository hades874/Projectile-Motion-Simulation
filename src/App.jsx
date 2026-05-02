import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SimSelector } from './components/Layout/SimSelector.jsx'
import { SimViewer } from './components/Layout/SimViewer.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SimSelector />} />
        <Route path="/sim/:simId" element={<SimViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
