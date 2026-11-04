import { createContext, useContext, useEffect, useState } from 'react'
import requestJson from '../hooks/requestJson.js'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // On page load, ask the server who the session cookie belongs to.
  useEffect(() => {
    async function loadUser() {
      const result = await requestJson('/api/auth/me')
      setUser(result.data?.data ?? null)
      setIsLoading(false)
    }
    loadUser()
  }, [])

  // The server has already started the session, so this only updates the page.
  function login(newUser) {
    setUser(newUser)
  }

  async function logout() {
    await requestJson('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthProvider