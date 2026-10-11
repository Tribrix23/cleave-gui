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
  // Mode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin')

  // Sign In State
  const [signinUsername, setSigninUsername] = useState('')
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

  // Forgot Password State
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)
  const [forgotQuestionIndex, setForgotQuestionIndex] = useState(0)

  // Random Question State (Signup)
  const [signupQuestionIndex, setSignupQuestionIndex] = useState(0)

  // Notification / Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Unlock check for Forgot Password: password fields are enabled ONLY when username & answer are filled
  const isVerificationComplete = forgotUsername.trim().length > 0 && forgotSecurityAnswer.trim().length > 0

  const handleNextSignupQuestion = (): void => {
    setSignupQuestionIndex((prev) => (prev + 1) % SECURITY_QUESTIONS.length)
  }

  const handleNextForgotQuestion = (): void => {
    setForgotQuestionIndex((prev) => (prev + 1) % SECURITY_QUESTIONS.length)
  }

  const handleSigninSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setFeedbackMessage(`Signed in as ${signinUsername}`)
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
      setSigninUsername(username)
    }, 2000)
  }

  const handleForgotSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!isVerificationComplete) {
      setFeedbackMessage('Error: Please complete your username and answer first.')
      setTimeout(() => setFeedbackMessage(null), 3000)
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setFeedbackMessage('Error: Passwords do not match!')
      setTimeout(() => setFeedbackMessage(null), 3000)
      return
    }
    setFeedbackMessage('Password successfully updated! Redirecting to sign in...')
    setTimeout(() => {
      setFeedbackMessage(null)
      setAuthMode('signin')
      setSigninUsername(forgotUsername)
      setForgotNewPassword('')
      setForgotConfirmPassword('')
      setForgotSecurityAnswer('')
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

        {/* Right Section: Auth Card (Sign In / Create Account / Forgot Password) */}
        <section className="login-right-section">
          <div className={`auth-card ${authMode !== 'signin' ? 'auth-card-signup' : ''}`}>
            {feedbackMessage && (
              <div className={`feedback-banner ${feedbackMessage.startsWith('Error') ? 'error' : 'success'}`}>
                {feedbackMessage}
              </div>
            )}

            {/* ==================== 1. SIGN IN VIEW ==================== */}
            {authMode === 'signin' && (
              <>
                <div className="auth-header">
                  <h2 className="auth-title">Welcome back</h2>
                  <p className="auth-subtitle">Sign in to your CleaveDB account</p>
                </div>

                <form className="auth-form" onSubmit={handleSigninSubmit}>
                  {/* Username Input */}
                  <div className="form-group">
                    <label htmlFor="signin-username" className="form-label">
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
                        id="signin-username"
                        type="text"
                        className="form-input"
                        placeholder="Enter your username"
                        value={signinUsername}
                        onChange={(e) => setSigninUsername(e.target.value)}
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
                    <button
                      type="button"
                      className="forgot-password-link"
                      onClick={() => {
                        setAuthMode('forgot')
                        setFeedbackMessage(null)
                      }}
                    >
                      Forgot password?
                    </button>
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
            )}

            {/* ==================== 2. CREATE ACCOUNT VIEW ==================== */}
            {authMode === 'signup' && (
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
                          onClick={handleNextSignupQuestion}
                          title="Get another random question"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                          <span>New question</span>
                        </button>
                      </div>
                      <p className="question-text">{SECURITY_QUESTIONS[signupQuestionIndex]}</p>
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

            {/* ==================== 3. FORGOT PASSWORD VIEW ==================== */}
            {authMode === 'forgot' && (
              <>
                <div className="auth-header">
                  <h2 className="auth-title">Reset password</h2>
                  <p className="auth-subtitle">Verify your security challenge to set a new password</p>
                </div>

                <form className="auth-form" onSubmit={handleForgotSubmit}>
                  {/* 1. Username Field */}
                  <div className="form-group">
                    <label htmlFor="forgot-username" className="form-label">
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
                        id="forgot-username"
                        type="text"
                        className="form-input"
                        placeholder="Enter your username"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 2. Mock Security Question & Answer Field */}
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
                          onClick={handleNextForgotQuestion}
                          title="Try another mock challenge question"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                          <span>Mock question</span>
                        </button>
                      </div>
                      <p className="question-text">{SECURITY_QUESTIONS[forgotQuestionIndex]}</p>
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
                        id="forgot-security-answer"
                        type="text"
                        className="form-input"
                        placeholder="Enter your registered answer"
                        value={forgotSecurityAnswer}
                        onChange={(e) => setForgotSecurityAnswer(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Verification Unlock Status Indicator */}
                  <div className="unlock-status-row">
                    <span className={`unlock-badge ${isVerificationComplete ? 'unlocked' : 'locked'}`}>
                      {isVerificationComplete ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Identity verified · New password fields unlocked
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2.5" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Enter username and answer above to enable password fields
                        </>
                      )}
                    </span>
                  </div>

                  {/* 3. New Password Field (Enabled only when username and answer are filled) */}
                  <div className="form-group">
                    <label htmlFor="forgot-new-password" className={`form-label ${!isVerificationComplete ? 'label-disabled' : ''}`}>
                      New password
                    </label>
                    <div className={`input-wrapper ${!isVerificationComplete ? 'is-disabled' : ''}`}>
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2.5" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        id="forgot-new-password"
                        type={showForgotNewPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder={isVerificationComplete ? 'Enter new password' : 'Enter username and answer first'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        disabled={!isVerificationComplete}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        disabled={!isVerificationComplete}
                        aria-label={showForgotNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showForgotNewPassword ? (
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

                  {/* 4. Confirm New Password Field (Enabled only when username and answer are filled) */}
                  <div className="form-group">
                    <label htmlFor="forgot-confirm-password" className={`form-label ${!isVerificationComplete ? 'label-disabled' : ''}`}>
                      Confirm password
                    </label>
                    <div className={`input-wrapper ${!isVerificationComplete ? 'is-disabled' : ''}`}>
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2.5" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          <path d="M9 16l2 2 4-4" strokeWidth="1.6" />
                        </svg>
                      </span>
                      <input
                        id="forgot-confirm-password"
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder={isVerificationComplete ? 'Re-enter new password' : 'Enter username and answer first'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        disabled={!isVerificationComplete}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        disabled={!isVerificationComplete}
                        aria-label={showForgotConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showForgotConfirmPassword ? (
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
                    {isVerificationComplete && forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword && (
                      <p className="field-error-hint">Passwords do not match</p>
                    )}
                  </div>

                  {/* Reset Password Submit Button */}
                  <button
                    type="submit"
                    className="submit-sign-in-btn"
                    disabled={!isVerificationComplete}
                    style={!isVerificationComplete ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
                  >
                    <span>Reset password</span>
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
                    Remember your password? Sign in
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
