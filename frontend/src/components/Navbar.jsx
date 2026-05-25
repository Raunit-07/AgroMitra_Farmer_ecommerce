import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import NotificationBell from './NotificationBell.jsx'
import './landing.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { t, language, changeLanguage } = useLanguage()

  const [user, setUser] = useState(null)
  const [activeRole, setActiveRole] = useState(localStorage.getItem('role'))
  const [roles, setRoles] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const dropRef = useRef(null)

  useEffect(() => {
    loadUserAndCart()

    const { data: listener } = db.auth.onSessionChange(() => {
      loadUserAndCart()
      setActiveRole(localStorage.getItem('role'))
    })

    const handleAuthChange = () => {
      loadUserAndCart()
      setActiveRole(localStorage.getItem('role'))
    }

    const handleCartUpdated = () => {
      loadUserAndCart()
    }

    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }

    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('cartUpdated', handleCartUpdated)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      listener?.subscription?.unsubscribe()
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('cartUpdated', handleCartUpdated)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function loadUserAndCart() {
    const { data: userData } = await db.auth.currentUser()
    const currentUser = userData?.user || null

    setUser(currentUser)

    if (!currentUser) {
      setCartCount(0)
      setRoles([])
      return
    }

    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (profile?.role) {
      if (profile.role === 'both') {
        setRoles(['buyer', 'farmer', 'seller', 'both'])
      } else if (profile.role === 'farmer' || profile.role === 'seller') {
        setRoles(['farmer', 'seller'])
      } else {
        setRoles([profile.role])
      }
    }

    const { data: cartItems } = await db
      .from('cart')
      .select('quantity')
      .eq('user_id', currentUser.id)

    const totalItems =
      cartItems?.reduce((total, item) => total + Number(item.quantity || 1), 0) || 0

    setCartCount(totalItems)
  }

  async function handleLogout() {
    setDropOpen(false)
    setMenuOpen(false)
    const currentLanguage = language

    await db.auth.signOut()
    localStorage.clear()
    localStorage.setItem('i18nextLng', currentLanguage)

    setUser(null)
    setRoles([])
    setCartCount(0)

    window.dispatchEvent(new Event('authChange'))
    navigate('/')
  }

  const displayName = user?.email?.split('@')[0] || 'Account'
  const initials = displayName.slice(0, 2).toUpperCase()
  const isBuyer = roles.includes('buyer') || activeRole === 'buyer'
  const isSeller = roles.includes('seller') || roles.includes('farmer') || activeRole === 'seller'

  return (
    <header className="premium-navbar">
      <div className="premium-navbar-inner full-width-navbar">
        <Link to="/" className="premium-logo">
          <div className="premium-logo-icon">🌾</div>
          <div className="premium-logo-text">
            <strong>AgroMitra</strong>
          </div>
        </Link>

        <nav className="premium-nav-links desktop-nav">
          <Link to="/">{t('navbar.home')}</Link>

          {isSeller && (
            <Link to="/seller-dashboard">
              <strong>📊 {t('navbar.dashboard') || 'Dashboard'}</strong>
            </Link>
          )}

          {isBuyer && <Link to="/products">{t('navbar.products')}</Link>}
          {isBuyer && <Link to="/collective-buying">{t('navbar.collectiveBuying')}</Link>}

          <Link to="/contact">{t('navbar.contact')}</Link>

          {isBuyer && (
            <Link to="/cart" className="cart-link">
              🛒 {t('navbar.cart')}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}
        </nav>

        <div className="premium-nav-right desktop-auth">
          <select
            className="lang-switcher"
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>

          {user && isBuyer && <NotificationBell />}

          {!user ? (
            <>
              <Link to="/buyer-login" className="premium-login-btn">
                {t('navbar.buyerLogin')}
              </Link>

              <Link to="/seller-login" className="premium-login-btn secondary">
                {t('navbar.sellerLogin')}
              </Link>

              <Link to="/register" className="premium-register-btn">
                {t('navbar.register')}
              </Link>
            </>
          ) : (
            <div className="nav-profile-wrapper" ref={dropRef}>
              <button
                className="nav-profile-btn"
                onClick={() => setDropOpen((prev) => !prev)}
                aria-expanded={dropOpen}
                aria-label="Account menu"
              >
                <span className="nav-avatar">{initials}</span>
                <span className="nav-display-name">{displayName}</span>
                <span className="nav-chevron">{dropOpen ? '▲' : '▼'}</span>
              </button>

              {dropOpen && (
                <div className="nav-dropdown-profile">
                  {isSeller && (
                    <Link
                      to="/seller-dashboard"
                      className="nav-drop-item"
                      onClick={() => setDropOpen(false)}
                    >
                      <span>📊</span> {t('navbar.dashboard') || 'Dashboard'}
                    </Link>
                  )}

                  {isBuyer && (
                    <>
                      <Link
                        to="/profile"
                        className="nav-drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <span>👤</span> {t('navbar.profile')}
                      </Link>

                      <Link
                        to="/my-orders"
                        className="nav-drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <span>📦</span> {t('navbar.myOrders')}
                      </Link>

                      <Link
                        to="/addresses"
                        className="nav-drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <span>📍</span> {t('navbar.addresses')}
                      </Link>

                      <Link
                        to="/order-tracking"
                        className="nav-drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <span>🚚</span> {t('navbar.trackOrder')}
                      </Link>
                    </>
                  )}

                  <div className="nav-drop-divider" />

                  <button className="nav-drop-item nav-drop-logout" onClick={handleLogout}>
                    <span>🚪</span> {t('navbar.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav-menu">
          <Link onClick={() => setMenuOpen(false)} to="/">
            {t('navbar.home')}
          </Link>

          {isBuyer && (
            <Link onClick={() => setMenuOpen(false)} to="/products">
              {t('navbar.products')}
            </Link>
          )}

          {isBuyer && (
            <Link onClick={() => setMenuOpen(false)} to="/collective-buying">
              {t('navbar.collectiveBuying')}
            </Link>
          )}

          {isBuyer && (
            <Link onClick={() => setMenuOpen(false)} to="/cart">
              🛒 {t('navbar.cart')} {cartCount > 0 ? `(${cartCount})` : ''}
            </Link>
          )}

          <Link onClick={() => setMenuOpen(false)} to="/contact">
            {t('navbar.contact')}
          </Link>

          <select
            className="lang-switcher-mobile"
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>

          {user && isBuyer && (
            <Link onClick={() => setMenuOpen(false)} to="/notifications">
              🔔 Notifications
            </Link>
          )}

          {!user ? (
            <>
              <Link onClick={() => setMenuOpen(false)} to="/buyer-login">
                {t('navbar.buyerLogin')}
              </Link>

              <Link onClick={() => setMenuOpen(false)} to="/seller-login">
                {t('navbar.sellerLogin')}
              </Link>

              <Link onClick={() => setMenuOpen(false)} to="/register">
                {t('navbar.register')}
              </Link>
            </>
          ) : (
            <>
              {isSeller && (
                <Link onClick={() => setMenuOpen(false)} to="/seller-dashboard">
                  📊 {t('navbar.dashboard') || 'Dashboard'}
                </Link>
              )}

              {isBuyer && (
                <>
                  <Link onClick={() => setMenuOpen(false)} to="/profile">
                    👤 {t('navbar.profile')}
                  </Link>

                  <Link onClick={() => setMenuOpen(false)} to="/my-orders">
                    📦 {t('navbar.myOrders')}
                  </Link>

                  <Link onClick={() => setMenuOpen(false)} to="/addresses">
                    📍 {t('navbar.addresses')}
                  </Link>

                  <Link onClick={() => setMenuOpen(false)} to="/order-tracking">
                    🚚 {t('navbar.trackOrder')}
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="mobile-logout-btn">
                🚪 {t('navbar.logout')}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
