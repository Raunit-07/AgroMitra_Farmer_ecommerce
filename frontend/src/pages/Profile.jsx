import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

export default function Profile() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { init() }, [])

  async function init() {
    const { data: userData } = await db.auth.currentUser()
    const u = userData?.user
    if (!u) { navigate('/buyer-login'); return }

    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single()

    if (error) {
      setError(t('profile.loadFailed'))
    } else {
      setProfile({ ...data, email: u.email })
      setForm({ full_name: data.full_name || '', phone: data.phone || '' })
    }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const { error } = await db
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    } else {
      setMessage(t('profile.updated'))
      setProfile((prev) => ({ ...prev, ...form }))
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="profile-loading">{t('profile.loading')}</div>

  const initials = (profile?.full_name || profile?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <section className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <span>{t('profile.badge')}</span>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className="profile-layout">
          {/* Avatar card */}
          <div className="profile-avatar-card">
            <div className="profile-avatar">{initials}</div>
            <h2>{profile?.full_name || t('profile.user')}</h2>
            <p>{profile?.email}</p>
            <div className="profile-role-badge">
              {profile?.role === 'seller' ? `🌾 ${t('profile.seller')}` : `🛒 ${t('profile.buyer')}`}
            </div>
            {profile?.aadhaar_verified && (
              <div className="profile-verified-badge">✅ {t('profile.aadhaarVerified')}</div>
            )}
          </div>

          {/* Edit form */}
          <div className="profile-form-card">
            <h2 className="profile-form-title">{t('profile.editTitle')}</h2>

            {message && <div className="profile-success">{message}</div>}
            {error && <div className="profile-error">{error}</div>}

            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-form-group">
                <label>{t('auth.fullName')}</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder={t('profile.fullNamePlaceholder')}
                />
              </div>
              <div className="profile-form-group">
                <label>{t('auth.phone')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210"
                />
              </div>
              <div className="profile-form-group">
                <label>{t('profile.emailReadOnly')}</label>
                <input type="email" value={profile?.email || ''} disabled className="profile-input-disabled" />
              </div>
              <div className="profile-form-group">
                <label>{t('profile.roleReadOnly')}</label>
                <input type="text" value={profile?.role || ''} disabled className="profile-input-disabled" />
              </div>
              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? t('addresses.saving') : t('profile.saveChanges')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
