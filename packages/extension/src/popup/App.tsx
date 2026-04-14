import { HashRouter, Routes, Route } from 'react-router-dom'
import { HomeNew } from './pages/HomeNew'
import { AddCMSPage } from './pages/AddCMS'
import { AccountsPage } from './pages/Accounts'
import { HistoryPage } from './pages/History'
import { AboutPage } from './pages/About'

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-full min-h-[500px]">
        <Routes>
          <Route path="/" element={<HomeNew />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/add-cms" element={<AddCMSPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
