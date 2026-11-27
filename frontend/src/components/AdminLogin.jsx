import React, { useState } from 'react'
import { ShieldCheck, Lock, User, AlertCircle, KeyRound, Sparkles, Building2 } from 'lucide-react'
import { api, setAuthToken } from '../api'

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username, password })
      const session = res.data
      setAuthToken(session.token)
      localStorage.setItem('civictrack_admin_user', JSON.stringify(session))
      onLoginSuccess(session)
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Authentication failed. Please verify your officer credentials.'
      )
    } finally {
      setBusy(false)
    }
  }

  const fillDemoCredentials = () => {
    setUsername('admin@tncivic.gov.in')
    setPassword('AdminTN@2026')
    setError('')
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="login-emblem-badge">
          <div className="emblem-circle">
            <Building2 size={26} />
          </div>
          <div className="security-tag">
            <ShieldCheck size={13} />
            <span>256-BIT ENCRYPTED OFFICER PORTAL</span>
          </div>
        </div>

        <div className="login-header">
          <span className="gov-title">தமிழ்நாடு அரசு · GOVERNMENT OF TAMIL NADU</span>
          <h2>Municipal Administration & Civic Desk</h2>
          <p>
            Secure administrative console for Greater Chennai Corporation, Municipal Commissioners, and Field Engineers.
          </p>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label>Officer Username or Official Email</label>
            <div className="input-with-icon">
              <User size={16} />
              <input
                type="text"
                required
                placeholder="e.g. admin or admin@tncivic.gov.in"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label>Security Password / Passcode</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                type="password"
                required
                placeholder="Enter officer security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={busy}>
            {busy ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <KeyRound size={17} />
                <span>Verify & Access Admin Desk</span>
              </>
            )}
          </button>
        </form>

        <div className="login-demo-helper">
          <div className="demo-notice">
            <Sparkles size={14} />
            <span>Authorized Test Credentials: <b>admin</b> / <b>AdminTN@2026</b></span>
          </div>
          <button
            type="button"
            className="demo-autofill-btn"
            onClick={fillDemoCredentials}
          >
            Quick Fill Demo Credentials
          </button>
        </div>

        <div className="login-footer-security">
          <span>வாய்மையே வெல்லும் · Official Use Only</span>
          <small>Unauthorized access attempts are monitored and logged.</small>
        </div>
      </div>
    </div>
  )
}
