import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const resetToken = new URLSearchParams(window.location.search).get('token')

  useEffect(() => {
    if (!resetToken) {
      setError(t('auth.error_no_session') || "Invalid or expired reset session. Please request a new link.");
    }
    setCheckingSession(false);
  }, [resetToken, t]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      setError(t('auth.error_password_length'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.error_password_match') || "Passwords do not match.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: updateError } = await db.auth.resetPasswordWithToken({
        token: resetToken,
        password,
      });

      // 14. Add debugging logs
      console.log("RESET PASSWORD UPDATE RESPONSE:", { data, error: updateError });

      if (updateError) throw updateError;

      setSuccess(t('auth.password_updated') || "Password updated successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/buyer-login');
      }, 3000);
    } catch (err) {
      // 5. Add strong error handling
      console.error("RESET PASSWORD ERROR (Update):", err);
      const errorMessage = err?.message || t('auth.error_generic');
      setError(typeof errorMessage === 'string' ? errorMessage : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="buyer-login-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <section className="buyer-login-page">
      <div className="buyer-login-layout">
        <div className="buyer-login-visual">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80"
            alt="Reset Password"
            className="buyer-login-image"
          />
          <div className="buyer-login-overlay" />

          <div className="buyer-login-visual-content">
            <span className="buyer-login-badge">{t('auth.resetPassword')}</span>
            <h1>{t('auth.security')}</h1>
            <p>
              {t('auth.visual_p')}
            </p>
          </div>
        </div>

        <div className="buyer-login-form-side">
          <div className="buyer-login-card">
            <div className="buyer-login-top">
              <div className="buyer-login-icon">🛡️</div>
              <span className="buyer-login-small-badge">{t('auth.security')}</span>
              <h2>{t('auth.resetPassword')}</h2>
              <p>{t('auth.recovery_p')}</p>
            </div>

            {error && !success && (
              <div className="buyer-login-error">
                {error}
                {!success && error.includes("expired") && (
                  <div style={{ marginTop: '10px' }}>
                    <Link to="/forgot-password" style={{ color: '#059669', fontWeight: 'bold' }}>Request New Link</Link>
                  </div>
                )}
              </div>
            )}
            {success && <div className="buyer-login-success" style={{ color: '#10b981', background: '#ecfdf5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #d1fae5' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="buyer-login-form">
              <div className="buyer-form-group">
                <label>{t('auth.password')}</label>
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={!resetToken || (!!error && !success)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={!resetToken || (!!error && !success)}
                  >
                    {showPassword ? t('auth.hide') : t('auth.show')}
                  </button>
                </div>
              </div>

              <div className="buyer-form-group">
                <label>{t('auth.confirmPassword') || 'Confirm Password'}</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  disabled={!resetToken || (!!error && !success)}
                />
              </div>

              <button type="submit" className="buyer-login-btn" disabled={loading || !resetToken || (!!error && !success)}>
                {loading ? (
                  <div className="btn-loader-wrapper">
                    <div className="spinner mini"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.resetPassword')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
