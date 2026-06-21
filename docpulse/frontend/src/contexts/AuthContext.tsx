import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, AuthState } from '@/types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => boolean
  signup: (name: string, email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('docpulse_auth')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return { user: null, isAuthenticated: false }
      }
    }
    return { user: null, isAuthenticated: false }
  })

  useEffect(() => {
    localStorage.setItem('docpulse_auth', JSON.stringify(state))
  }, [state])

  const login = (email: string, _password: string) => {
    if (!email.trim()) return false
    const stored = localStorage.getItem('docpulse_users')
    let users: { name: string; email: string }[] = []
    if (stored) {
      try { users = JSON.parse(stored) } catch { users = [] }
    }
    const user = users.find(u => u.email === email)
    if (!user) return false
    setState({ user: { name: user.name, email: user.email }, isAuthenticated: true })
    return true
  }

  const signup = (name: string, email: string, _password: string) => {
    if (!name.trim() || !email.trim()) return false
    const stored = localStorage.getItem('docpulse_users')
    let users: { name: string; email: string }[] = []
    if (stored) {
      try { users = JSON.parse(stored) } catch { users = [] }
    }
    if (users.find(u => u.email === email)) return false
    users.push({ name, email })
    localStorage.setItem('docpulse_users', JSON.stringify(users))
    return true
  }

  const logout = () => {
    setState({ user: null, isAuthenticated: false })
    localStorage.removeItem('docpulse_auth')
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
