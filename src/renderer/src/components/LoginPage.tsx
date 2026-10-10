import { useState } from 'react'
import CleaveLogo from './CleaveLogo'
import cleaveHero from '../assets/cleave-hero.png'

export default function LoginPage(): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    console.log('Sign in attempt:', { email })
  }

  return (
    <div className="login-page">
      {/* Ambient background glow on the left */}
      <div className="ambient-background-glow" />

      {/* Main split container */}
      <div className="login-container">
        {/* Left Section: Branding & 3D Hero */}
        <section className="login-left-section">
          <div className="brand-header">
            <div className="brand-logo-title">
              <CleaveLogo size={36} />
              <h1 className="brand-title">CleaveDB</h1>
            </div>
            <p className="brand-tagline">A more natural way to work with data.</p>
          </div>

          <div className="hero-visual-wrapper">
            <div className="hero-glow-sphere" />
            <img
              src={cleaveHero}
              alt="CleaveDB 3D Storage Core"
              className="hero-3d-image"
            />
            <div className="hero-ground-shadow" />
          </div>
        </section>

        {/* Right Section: Sign In Card */}
        <section className="login-right-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">Sign in to your CleaveDB account</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email-input" className="form-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="M22 7L12 13.5L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email-input"
                    type="email"
                    className="form-input"
                    placeholder="you@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password-input" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2.5" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      /* Eye Off */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      /* Eye Open */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="forgot-password-row">
                <a href="#forgot" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              {/* Sign in Button */}
              <button type="submit" className="submit-sign-in-btn">
                <span>Sign in</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {/* Or Divider */}
              <div className="auth-divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              {/* Create an account Button */}
              <button
                type="button"
                className="create-account-btn"
                onClick={() => console.log('Create account clicked')}
              >
                Create an account
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
