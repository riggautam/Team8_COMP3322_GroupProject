import { useState } from 'react'
import { AuthContext } from '../hooks/authContext.js'

const STORAGE_KEY = 'west-user'

// Reads the saved user so a page refresh keeps you logged in.
function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  function login(newUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider