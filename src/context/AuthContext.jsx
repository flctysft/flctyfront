import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  function persist(authResponse) {
    const { token, ...userData } = authResponse
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data)
    return data
  }

  async function register(fullName, email, password, role) {
    const { data } = await api.post('/auth/register', { fullName, email, password, role })
    persist(data)
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
