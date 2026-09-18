import React, { createContext, useContext, useState, useEffect } from 'react'
import { tokenStorage } from '../infrastructure/storage/token'
import { authApi } from '../infrastructure/api/endpoints'

interface AuthState { isAuthenticated: boolean; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void; loading: boolean; }

const AuthCtx = createContext<AuthState>(null!)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!tokenStorage.getAccess())
  const [loading, setLoading] = useState(false)

  // Use Zustand justification: Zustand foi escolhido originalmente, mas para simplicidade e menor bundle optou-se por Context API puro,
  // suficiente para estado de auth (isAuthenticated + actions). Para apps maiores Zustand seria preferível por seletores e persist.

  useEffect(() => { setIsAuthenticated(!!tokenStorage.getAccess()) }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await authApi.login(email, password)
      tokenStorage.set(data.access_token, data.refresh_token)
      setIsAuthenticated(true)
    } finally { setLoading(false) }
  }
  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const data = await authApi.register(name, email, password)
      tokenStorage.set(data.access_token, data.refresh_token)
      setIsAuthenticated(true)
    } finally { setLoading(false) }
  }
  const logout = () => { tokenStorage.clear(); setIsAuthenticated(false) }

  return <AuthCtx.Provider value={{ isAuthenticated, login, register, logout, loading }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
