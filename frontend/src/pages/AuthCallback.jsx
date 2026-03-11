import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"

const USER_KEY = "fraglog_user"
const TOKEN_KEY = "fraglog_token"

export default function AuthCallback() {
  const [params] = useSearchParams()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const token = params.get("token")
    const userParam = params.get("user")
    const error = params.get("error")

    if (error) {
      console.error("Auth error:", error)
      window.location.replace("/?error=" + error)
      return
    }

    if (!token || !userParam) {
      console.error("Missing token or user in callback URL")
      window.location.replace("/")
      return
    }

    try {
      const user = JSON.parse(atob(userParam))

      console.log("✅ Auth success:", user.username)

      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(TOKEN_KEY, token)

      window.location.replace("/profile/" + user.steamId)
    } catch (err) {
      console.error("Failed to decode user data:", err)
      window.location.replace("/")
    }
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f17",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {["#00e676", "#40bcf4", "#ff6b35"].map((c, i) => (
          <div
            key={c}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: c,
              animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "#f0f0f8",
        }}
      >
        Signing you in
      </p>

      <p
        style={{
          fontFamily: "Karla, sans-serif",
          fontSize: 14,
          color: "#8888aa",
        }}
      >
        Verifying your Steam identity...
      </p>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.4; }
          to   { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
