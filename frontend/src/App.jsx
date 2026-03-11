import { Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Library from "./pages/Library"
import GamePage from "./pages/GamePage"
import Discover from "./pages/Discover"
import AuthCallback from "./pages/AuthCallback"
import NotFound from "./pages/NotFound"

export default function App() {
  const location = useLocation()

  const hideNavbar = location.pathname === "/auth/callback"

  return (
    <div style={{ minHeight: "100vh", background: "#080808" }}>
      {!hideNavbar && <Navbar />}

      <div style={{ paddingTop: hideNavbar ? 0 : 64 }}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/profile/:steamId" element={<Profile />} />

          <Route path="/library/:steamId" element={<Library />} />

          <Route path="/game/:appId" element={<GamePage />} />

          <Route path="/discover" element={<Discover />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}
