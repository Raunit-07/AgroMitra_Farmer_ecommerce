import React, { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock3,
  MessageSquareText,
} from 'lucide-react'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: dbError } = await db
        .from('contact_messages')
        .insert([formData])

      if (dbError) throw dbError

      setSuccess('Message submitted successfully. We will get back to you soon!')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      console.error('Contact error:', err)
      setError(err.message || 'Failed to send message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact-page-pro">
      <div className="contact-container-pro">
        <div className="contact-header-pro text-center">
          <span className="contact-badge">{t('contact.title')}</span>
          <h1>{t('contact.title')}</h1>
          <p>
            {t('contact.header_p')}
          </p>
        </div>

        <div className="contact-grid-pro">
          {/* Left Column - Contact Info */}
          <div className="contact-info-card">
            <div className="info-header">
              <h2>{t('contact.info_title')}</h2>
              <p>{t('contact.info_p')}</p>
            </div>

            <div className="info-list">
              <div className="info-item">
                <div className="info-icon"><Phone size={22} /></div>
                <div>
                  <span>{t('contact.phone')}</span>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><Mail size={22} /></div>
                <div>
                  <span>{t('contact.email_label')}</span>
                  <p>support@agromitra.com</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><MapPin size={22} /></div>
                <div>
                  <span>{t('contact.address')}</span>
                  <p>123 Greenfield Road,<br />Agriland, IN 452001</p>
                </div>
              </div>
            </div>

            <div className="info-boxes">
              <div className="info-box">
                <div className="box-head">
                  <Clock3 size={18} />
                  <p>{t('contact.working_hours')}</p>
                </div>
                <span>{t('contact.mon_sat')}<br />{t('contact.hours')}</span>
              </div>

              <div className="info-box">
                <div className="box-head">
                  <MessageSquareText size={18} />
                  <p>{t('contact.quick_response')}</p>
                </div>
                <span>{t('contact.quick_response_p')}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-form-card">
            <h2>{t('contact.send_message')}</h2>
            <p>{t('contact.send_message_p')}</p>

            <form onSubmit={handleSubmit} className="contact-form-pro">
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('contact.name')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('contact.email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('contact.subject')}</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t('contact.subject_placeholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('contact.message')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('contact.message_placeholder')}
                  rows="5"
                  required
                />
              </div>

              {success && <div className="form-alert success">{success}</div>}
              {error && <div className="form-alert error">{error}</div>}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? t('contact.sending') : t('contact.send')}
                {!loading && <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}