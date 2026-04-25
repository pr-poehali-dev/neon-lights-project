import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { API } from "@/lib/api"

export interface User {
  id: number
  email: string
  name: string
  is_subscribed: boolean
  lang: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  const getHeaders = (tok?: string) => ({
    "Content-Type": "application/json",
    ...(tok || token ? { Authorization: `Bearer ${tok || token}` } : {}),
  })

  const refreshUser = async () => {
    const tok = localStorage.getItem("token")
    if (!tok) { setLoading(false); return }
    try {
      const res = await fetch(`${API.auth}/me`, { headers: getHeaders(tok) })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshUser() }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API.auth}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка входа")
    localStorage.setItem("token", data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API.auth}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка регистрации")
    localStorage.setItem("token", data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)