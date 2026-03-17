import { Routes, Route } from 'react-router-dom'
import Navbar          from './components/Navbar'
import Home            from './pages/Home'
import Profile         from './pages/Profile'
import Library         from './pages/Library'
import GamePage        from './pages/GamePage'
import Discover        from './pages/Discover'
import AuthCallback    from './pages/AuthCallback'
import NotFound        from './pages/NotFound'
import ListsPage       from './pages/ListsPage'
import ListDetailPage  from './pages/ListDetailPage'
import CreateListPage  from './pages/CreateListPage'
import ActivityPage    from './pages/ActivityPage'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <Navbar />
      <div style={{ paddingTop: 60 }}>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/auth/callback"       element={<AuthCallback />} />
          <Route path="/profile/:steamId"    element={<Profile />} />
          <Route path="/library/:steamId"    element={<Library />} />
          <Route path="/game/:appId"         element={<GamePage />} />
          <Route path="/discover"            element={<Discover />} />
          <Route path="/lists"               element={<ListsPage />} />
          <Route path="/lists/new"           element={<CreateListPage />} />
          <Route path="/lists/:id"           element={<ListDetailPage />} />
          <Route path="/lists/:id/edit"      element={<CreateListPage />} />
          <Route path="/activity"            element={<ActivityPage />} />
          <Route path="*"                    element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}
