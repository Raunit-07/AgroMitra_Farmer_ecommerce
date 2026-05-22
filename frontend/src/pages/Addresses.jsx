import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

const EMPTY_FORM = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '', country: 'India', is_default: false,
}

export default function Addresses() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { init() }, [])

  async function init() {
    const { data: userData } = await db.auth.currentUser()
    const u = userData?.user
    if (!u) { navigate('/buyer-login'); return }
    setUser(u)
    await fetchAddresses(u.id)
  }

  async function fetchAddresses(uid) {
    setLoading(true)
    const { data, error } = await db
      .from('addresses')
      .select('*')
      .eq('user_id', uid)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setAddresses(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(addr) {
    setEditId(addr.id)
    setForm({
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      is_default: addr.is_default || false,
    })
    setError('')
    setShowForm(true)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.pincode) {
      setError('Please fill all required fields.')
      return
    }
    setSaving(true)
    setError('')

    try {
      // If setting as default, unset other defaults first
      if (form.is_default) {
        await db.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      }

      if (editId) {
        const { error } = await db.from('addresses').update({ ...form }).eq('id', editId)
        if (error) throw error
      } else {
        const { error } = await db.from('addresses').insert({ ...form, user_id: user.id })
        if (error) throw error
      }

      setSuccess(editId ? 'Address updated!' : 'Address added!')
      setShowForm(false)
      await fetchAddresses(user.id)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this address?')) return
    await db.from('addresses').delete().eq('id', id)
    await fetchAddresses(user.id)
  }

  async function handleSetDefault(id) {
    await db.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await db.from('addresses').update({ is_default: true }).eq('id', id)
    await fetchAddresses(user.id)
  }

  return (
    <section className="addr-page">
      <div className="addr-container">
        <div className="addr-header">
          <div>
            <span>{t('navbar.profile')}</span>
            <h1>{t('navbar.addresses')}</h1>
            <p>{t('addresses.manage')}</p>
          </div>
          <div className="addr-header-actions">
            <button className="addr-add-btn" onClick={openAdd}>+ {t('addresses.add_new')}</button>
            <Link to="/checkout" className="addr-back-link">← {t('addresses.back_checkout')}</Link>
          </div>
        </div>

        {success && <div className="addr-success">{success}</div>}

        {showForm && (
          <div className="addr-form-card">
            <h2 className="addr-form-title">{editId ? t('addresses.edit') : t('addresses.add_new')}</h2>
            {error && <div className="addr-error">{error}</div>}
            <form onSubmit={handleSave} className="addr-form">
              <div className="addr-form-row">
                <div className="addr-form-group">
                  <label>{t('auth.fullName')} *</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} placeholder={t('auth.fullName')} required />
                </div>
                <div className="addr-form-group">
                  <label>{t('auth.phone')} *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder={t('auth.phone')} required />
                </div>
              </div>
              <div className="addr-form-group">
                <label>{t('addresses.line1')} *</label>
                <input name="address_line1" value={form.address_line1} onChange={handleChange} placeholder={t('addresses.line1')} required />
              </div>
              <div className="addr-form-group">
                <label>{t('addresses.line2')}</label>
                <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder={t('addresses.line2')} />
              </div>
              <div className="addr-form-row">
                <div className="addr-form-group">
                  <label>{t('addresses.city')} *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder={t('addresses.city')} required />
                </div>
                <div className="addr-form-group">
                  <label>{t('addresses.state')} *</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder={t('addresses.state')} required />
                </div>
              </div>
              <div className="addr-form-row">
                <div className="addr-form-group">
                  <label>{t('addresses.pincode')} *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder={t('addresses.pincode')} required />
                </div>
                <div className="addr-form-group">
                  <label>{t('addresses.country')}</label>
                  <input name="country" value={form.country} onChange={handleChange} placeholder="India" />
                </div>
              </div>
              <label className="addr-default-check">
                <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
                {t('addresses.set_default')}
              </label>
              <div className="addr-form-actions">
                <button type="submit" className="addr-save-btn" disabled={saving}>
                  {saving ? t('addresses.saving') : editId ? t('addresses.update') : t('addresses.save')}
                </button>
                <button type="button" className="addr-cancel-btn" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="addr-loading">{t('addresses.loading')}</div>
        ) : addresses.length === 0 ? (
          <div className="addr-empty">
            <div className="addr-empty-icon">📍</div>
            <h2>{t('addresses.no_addr')}</h2>
            <p>{t('addresses.add_to_shop')}</p>
            <button className="addr-add-btn" onClick={openAdd}>+ {t('addresses.add_btn')}</button>
          </div>
        ) : (
          <div className="addr-list">
            {addresses.map((addr) => (
              <div key={addr.id} className={`addr-card${addr.is_default ? ' addr-card--default' : ''}`}>
                {addr.is_default && <span className="addr-default-badge">✓ {t('addresses.default')}</span>}
                <h3>{addr.full_name}</h3>
                <p className="addr-phone">📞 {addr.phone}</p>
                <p className="addr-text">
                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                  {addr.city}, {addr.state} – {addr.pincode}<br />
                  {addr.country}
                </p>
                <div className="addr-actions">
                  <button className="addr-edit-btn" onClick={() => openEdit(addr)}>{t('common.edit')}</button>
                  {!addr.is_default && (
                    <button className="addr-default-btn" onClick={() => handleSetDefault(addr.id)}>{t('addresses.set_default_btn')}</button>
                  )}
                  <button className="addr-delete-btn" onClick={() => handleDelete(addr.id)}>{t('common.delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
