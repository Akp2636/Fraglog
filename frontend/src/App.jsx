import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Library from './pages/Library'
import GamePage from './pages/GamePage'
import Discover from './pages/Discover'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:steamId" element={<Profile />} />
          <Route path="/library/:steamId" element={<Library />} />
          <Route path="/game/:appId" element={<GamePage />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
