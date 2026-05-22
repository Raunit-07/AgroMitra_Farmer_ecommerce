import { Link } from 'react-router-dom'
import { useState } from 'react'
import { db } from '../lib/mongoClient'
import { validateEmail, normalizeEmail } from '../utils/authUtils'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

export default function ForgotPassword() {
  const { t } = useLanguage()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    // 2. Use normalized email
    const rawEmail = email || '';
    const normalizedEmail = rawEmail.trim().toLowerCase();
    
    console.log("FORGOT PASSWORD: Initiating reset for", normalizedEmail);

    if (!validateEmail(normalizedEmail)) {
      setError(t('auth.error_invalid_email'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 11. ForgotPassword.jsx should call resetPasswordForEmail with redirectTo
      const { data, error: resetError } = await db.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log("FORGOT PASSWORD RESPONSE:", { data, error: resetError });

      if (resetError) {
        if (resetError.message === 'Failed to fetch') {
          throw new Error("Network error. Please check your connection or db status.");
        }
        throw resetError;
      }

      setSuccess(t('auth.reset_link_sent') || "Password reset link sent to your email. Please check your inbox.");
    } catch (err) {
      console.error("RESET PASSWORD ERROR (Request):", err);
      const errorMessage = err?.message || t('auth.error_generic');
      setError(typeof errorMessage === 'string' ? errorMessage : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="buyer-login-page">
      <div className="buyer-login-layout">
        <div className="buyer-login-visual">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80"
            alt="Forgot Password"
            className="buyer-login-image"
          />
          <div className="buyer-login-overlay" />

          <div className="buyer-login-visual-content">
            <span className="buyer-login-badge">{t('auth.forgotPassword')}</span>
            <h1>{t('auth.visual_title')}</h1>
            <p>
              {t('auth.visual_p')}
            </p>
          </div>
        </div>

        <div className="buyer-login-form-side">
          <div className="buyer-login-card">
            <div className="buyer-login-top">
              <div className="buyer-login-icon">🔑</div>
              <span className="buyer-login-small-badge">{t('auth.recovery')}</span>
              <h2>{t('auth.forgotPassword')}</h2>
              <p>{t('auth.recovery_p')}</p>
            </div>

            {error && <div className="buyer-login-error">{error}</div>}
            {success && <div className="buyer-login-success" style={{ color: '#10b981', background: '#ecfdf5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #d1fae5' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="buyer-login-form">
              <div className="buyer-form-group">
                <label>{t('auth.email')}</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {/* 10. Fix ForgotPassword.jsx button text: Change 'Send OTP' to 'Send Reset Link' */}
              <button type="submit" className="buyer-login-btn" disabled={loading}>
                {loading ? (
                  <div className="btn-loader-wrapper">
                    <div className="spinner mini"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.sendResetLink') || "Send Reset Link"
                )}
              </button>
            </form>

            <div className="buyer-login-bottom">
              <p>
                {t('auth.haveAccount')}{' '}
                <Link to="/buyer-login">{t('auth.login')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
