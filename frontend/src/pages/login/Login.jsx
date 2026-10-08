import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../components/Button.jsx'
import { useAuth } from '../../hooks/authContext.js'
import useApiRequest from '../../hooks/useApiRequest.js'
import './Login.css'

function Login() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { error, isLoading, sendRequest } = useApiRequest(`/api/auth/${mode}`)
  const { login } = useAuth()
  const navigate = useNavigate()
  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's own form submit (a page reload)
    const result = await sendRequest({ displayName, email, password })
    if (result.data) {
      login(result.data)
      navigate('/')
    }
  }

  return (
    <section className="login">
      <h1>{isRegister ? 'Create an account' : 'Log in'}</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Name
            <input
              autoComplete="name"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        )}
        <label>
          Email
          <input
            autoComplete="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && (
          <p className="status-message status-message--error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait…' : isRegister ? 'Register' : 'Log in'}
        </Button>
      </form>

      <button
        className="login-switch"
        type="button"
        onClick={() => setMode(isRegister ? 'login' : 'register')}
      >
        {isRegister ? 'Already have an account? Log in' : 'New here? Create an account'}
      </button>
    </section>
  )
}

export default Login