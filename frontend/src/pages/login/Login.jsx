import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import Button from '../../components/forms/Button.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import usePost from '../../hooks/usePost.js'
import './Login.css'

function Login() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { error, isLoading, post } = usePost(`/api/auth/${mode}`)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const isRegister = mode === 'register'
  // The backend sends the browser to /login?error=google when Google sign-in fails or is cancelled.
  const [searchParams] = useSearchParams()
  const googleFailed = searchParams.get('error') === 'google'

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's own form submit (a page reload)
    const result = await post({ displayName, email, password })
    if (result.data?.data) {
      login(result.data.data)
      navigate('/dashboard')
    }
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <section className="login">
      <h1>{isRegister ? 'Create an account' : 'Log in'}</h1>

      {googleFailed && (
        <p className="status-message status-message--error" role="alert">
          Google sign-in did not work. Please try again.
        </p>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Name
            <input
              autoComplete="name"
              maxLength={100}
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
            maxLength={255}
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
            // Only new passwords need 8+ characters. Older accounts may have shorter ones.
            minLength={isRegister ? 8 : undefined}
            maxLength={72}
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

      <p className="login-divider">or</p>

      {/* A plain <a>, not <Link>: the whole page must go to the backend, which redirects to Google.
          <Link> would stay inside React and never reach the server. */}
      <a className="login-google" href="/api/auth/google">
        Continue with Google
      </a>

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