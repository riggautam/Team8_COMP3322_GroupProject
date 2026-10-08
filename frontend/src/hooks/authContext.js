import { createContext, useContext } from 'react'

// Holds { user, login, logout } so any component can read who is logged in.
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}