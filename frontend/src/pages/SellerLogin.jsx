import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { db } from '../lib/mongoClient'
import { validateEmail, normalizeEmail } from '../utils/authUtils'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

export default function SellerLogin() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check for email validity for UI feedback
  const isEmailValid = email ? validateEmail(email) : true;

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return; // 10. Prevent duplicate requests

    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail)) {
      setError(t('auth.error_invalid_email'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 2. Authenticate with db
      const { data: authData, error: authError } = await db.auth.loginWithPassword({
        email: normalizedEmail,
        password,
      });

      // 8. Proper error message for invalid credentials
      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error(t('auth.error_invalid_credentials'));
        }
        throw authError;
      }

      // 3. Login ke baad authenticated user safely fetch karo
      const { data: { user }, error: userFetchError } = await db.auth.currentUser();
      if (userFetchError || !user) throw new Error(t('auth.error_auth_failed'));

      // Fetch profile to check role
      const { data: profile } = await db
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const userRole = profile?.role || 'farmer';
      const allowedRoles = ['farmer', 'seller', 'both', 'admin'];

      if (!allowedRoles.includes(userRole)) {
        throw new Error("You are not registered as a Seller/Farmer. Please register first.");
      }

      // Profiles table sync (upsert) - Use only 'role'
      const { error: upsertError } = await db
        .from('profiles')
        .upsert({ 
          id: user.id, 
          role: userRole,
          email: user.email,
          updated_at: new Date().toISOString()
        });
      
      if (upsertError) console.error("Profile sync error:", upsertError.message);

      // Store role as 'seller' for this session
      localStorage.setItem('role', 'seller');
      localStorage.setItem('user', JSON.stringify(user));
      if (authData.session) {
        localStorage.setItem('token', authData.session.access_token);
      }

      // 7. Successful login ke baad redirect
      console.log("LOGIN SUCCESS. Navigating to: /seller-dashboard");
      window.dispatchEvent(new Event('authChange'));
      navigate('/seller-dashboard');

    } catch (err) {
      setError(err.message || t('auth.error_generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="seller-login-page">
      <div className="seller-login-layout">
        <div className="seller-login-visual">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80"
            alt="Seller login"
            className="seller-login-image"
          />
          <div className="seller-login-overlay" />

          <div className="seller-login-visual-content">
            <span className="seller-login-badge">{t('auth.sellerLogin')}</span>
            <h1>{t('auth.grow_business')}</h1>
            <p>
              {t('auth.seller_login_p')}
            </p>

            <div className="seller-login-highlights">
              <div className="seller-highlight-card">
                <h3>{t('auth.manage_products')}</h3>
                <p>{t('auth.manage_products_p')}</p>
              </div>

              <div className="seller-highlight-card">
                <h3>{t('auth.reach_buyers')}</h3>
                <p>{t('auth.reach_buyers_p')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-login-form-side">
          <div className="seller-login-card">
            <div className="seller-login-top">
              <div className="seller-login-icon">🌱</div>
              <span className="seller-login-small-badge">{t('auth.welcome')}</span>
              <h2>{t('auth.sellerLogin')}</h2>
              <p>{t('auth.seller_login_subtitle')}</p>
            </div>

            {error && <div className="seller-login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="seller-login-form">
              <div className="seller-form-group">
                <label>{t('auth.email')}</label>
                <input
                  type="email"
                  placeholder="seller@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="seller-form-group">
                <label>{t('auth.password')}</label>
                <div className="seller-password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="seller-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? t('auth.hide') : t('auth.show')}
                  </button>
                </div>
              </div>

              <div className="seller-login-row">
                <label className="seller-remember-box">
                  <input type="checkbox" />
                  <span>{t('auth.rememberMe')}</span>
                </label>

                <Link to="/register" className="seller-login-link">
                  {t('auth.createAccount')}
                </Link>

                <Link to="/forgot-password" title="Recover Password" style={{ color: '#10b981', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                  {t('auth.forgotPassword') || 'Forgot Password?'}
                </Link>
              </div>

              <button type="submit" className="seller-login-btn" disabled={loading}>
                {loading ? (
                  <div className="btn-loader-wrapper">
                    <div className="spinner mini"></div>
                    <span>{t('auth.loggingIn')}</span>
                  </div>
                ) : (
                  t('auth.login')
                )}
              </button>
            </form>

            <div className="seller-login-bottom">
              <p>
                {t('auth.wantToBuy')}{' '}
                <Link to="/buyer-login">{t('auth.buyerLogin')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}