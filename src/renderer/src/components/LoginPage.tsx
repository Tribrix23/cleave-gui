import { useState } from 'react'
import cleaveLogo from '../assets/cleavedb-logo.png'
import cleaveHero from '../assets/cleave-hero.png'

const SECURITY_QUESTIONS = [
  'What is your favorite programming language or stack?',
  'What is the primary storage engine for your databases?',
  'What was the name of your first computer or OS?',
  'What is 17 + 28?',
  'What port does your local development server run on?',
  'What is the opposite of an immutable database?',
  'Name a favorite open-source software project:'
]

export default function LoginPage(): React.JSX.Element {
  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  // Sign In State
  const [signinEmail, setSigninEmail] = useState('')
  const [signinPassword, setSigninPassword] = useState('')
  const [showSigninPassword, setShowSigninPassword] = useState(false)

  // Sign Up State
  const [username, setUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [devPassword, setDevPassword] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')

  // Show/Hide Toggles for Sign Up
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDevPassword, setShowDevPassword] = useState(false)

  // Random Question State
  const [questionIndex, setQuestionIndex] = useState(0)

  // Notification / Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const handleNextQuestion = (): void => {
    setQuestionIndex((prev) => (prev + 1) % SECURITY_QUESTIONS.length)
  }

  const handleSigninSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setFeedbackMessage(`Signed in as ${signinEmail}`)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleSignupSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (signupPassword !== confirmPassword) {
      setFeedbackMessage('Error: Passwords do not match!')
      setTimeout(() => setFeedbackMessage(null), 3000)
      return
    }
    setFeedbackMessage(`Account created for ${username}! You can now sign in.`)
    setTimeout(() => {
      setFeedbackMessage(null)
      setAuthMode('signin')
      setSigninEmail(username)
    }, 2000)
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
              <img src={cleaveLogo} alt="CleaveDB Logo" className="brand-logo-img" />
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

        {/* Right Section: Auth Card (Toggle between Sign In and Create Account) */}
        <section className="login-right-section">
          <div className={`auth-card ${authMode === 'signup' ? 'auth-card-signup' : ''}`}>
            {feedbackMessage && (
              <div className={`feedback-banner ${feedbackMessage.startsWith('Error') ? 'error' : 'success'}`}>
                {feedbackMessage}
              </div>
            )}

            {authMode === 'signin' ? (
              /* ==================== SIGN IN VIEW ==================== */
              <>
                <div className="auth-header">
                  <h2 className="auth-title">Welcome back</h2>
                  <p className="auth-subtitle">Sign in to your CleaveDB account</p>
                </div>

                <form className="auth-form" onSubmit={handleSigninSubmit}>
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
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
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
                        type={showSigninPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Your password"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowSigninPassword(!showSigninPassword)}
                        aria-label={showSigninPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSigninPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
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

                  {/* Switch to Create Account Button */}
                  <button
                    type="button"
                    className="create-account-btn"
                    onClick={() => {
                      setAuthMode('signup')
                      setFeedbackMessage(null)
                    }}
                  >
                    Create an account
                  </button>
                </form>
              </>
            ) : (
              /* ==================== CREATE ACCOUNT VIEW ==================== */
              <>
                <div className="auth-header">
                  <h2 className="auth-title">Create an account</h2>
                  <p className="auth-subtitle">Set up your username and developer security challenge</p>
                </div>

                <form className="auth-form" onSubmit={handleSignupSubmit}>
                  {/* 1. Username Field */}
                  <div className="form-group">
                    <label htmlFor="signup-username" className="form-label">
                      Username
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        id="signup-username"
                        type="text"
                        className="form-input"
                        placeholder="choose_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 2. Password Field */}
                  <div className="form-group">
                    <label htmlFor="signup-password" className="form-label">
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
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Create strong password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignupPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3. Confirm Password Field */}
                  <div className="form-group">
                    <label htmlFor="signup-confirm-password" className="form-label">
                      Confirm password
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2.5" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          <path d="M9 16l2 2 4-4" strokeWidth="1.6" />
                        </svg>
                      </span>
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {confirmPassword && signupPassword !== confirmPassword && (
                      <p className="field-error-hint">Passwords do not match</p>
                    )}
                  </div>

                  {/* 4. Dev Password Field */}
                  <div className="form-group">
                    <div className="label-with-tag">
                      <label htmlFor="signup-dev-password" className="form-label">
                        Dev password
                      </label>
                      <span className="dev-tag">Developer Access</span>
                    </div>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      </span>
                      <input
                        id="signup-dev-password"
                        type={showDevPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Enter developer key / password"
                        value={devPassword}
                        onChange={(e) => setDevPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowDevPassword(!showDevPassword)}
                        aria-label={showDevPassword ? 'Hide dev password' : 'Show dev password'}
                      >
                        {showDevPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 5. Random Question & User Answer */}
                  <div className="form-group security-challenge-group">
                    <div className="security-question-banner">
                      <div className="question-banner-header">
                        <span className="question-badge">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          Security Challenge
                        </span>
                        <button
                          type="button"
                          className="refresh-question-btn"
                          onClick={handleNextQuestion}
                          title="Get another random question"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                          <span>New question</span>
                        </button>
                      </div>
                      <p className="question-text">{SECURITY_QUESTIONS[questionIndex]}</p>
                    </div>

                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                      <input
                        id="signup-security-answer"
                        type="text"
                        className="form-input"
                        placeholder="Your answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Create Account Button */}
                  <button type="submit" className="submit-sign-in-btn">
                    <span>Create account</span>
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

                  {/* Back to Sign In Button */}
                  <button
                    type="button"
                    className="create-account-btn"
                    onClick={() => {
                      setAuthMode('signin')
                      setFeedbackMessage(null)
                    }}
                  >
                    Already have an account? Sign in
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
