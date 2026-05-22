import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/mongoClient'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_LABELS = {
  placed:     { label: 'Placed',      cls: 'status--placed' },
  confirmed:  { label: 'Confirmed',   cls: 'status--paid' },
  processing: { label: 'Processing',  cls: 'status--processing' },
  shipped:    { label: 'Shipped',     cls: 'status--shipped' },
  delivered:  { label: 'Delivered',   cls: 'status--delivered' },
  cancelled:  { label: 'Cancelled',   cls: 'status--cancelled' },
}

// Payment Labels mapping – handles database-normalized values
const PAYMENT_LABELS = {
  pending:     { label: 'Payment Pending', cls: 'status--pending' },
  paid:        { label: 'Paid',            cls: 'status--paid' },
  failed:      { label: 'Failed',          cls: 'status--failed' },
  cod_pending: { label: 'COD Pending',     cls: 'status--cod' },
}

/** Safely shorten any order ID (UUID string, integer, or undefined) */
function shortOrderId(id) {
  return String(id ?? '').slice(0, 8).toUpperCase() || '—'
}

/** Safely format a date string; returns '—' if invalid */
function formatDate(raw) {
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function MyOrders() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Map status labels using translation keys
  const getStatusInfo = (status) => {
    const s = status?.toLowerCase()
    const labels = {
      placed:     { label: t('orders.status.placed'),      cls: 'status--placed' },
      confirmed:  { label: t('orders.status.confirmed'),   cls: 'status--paid' },
      processing: { label: t('orders.status.processing'),  cls: 'status--processing' },
      shipped:    { label: t('orders.status.shipped'),     cls: 'status--shipped' },
      delivered:  { label: t('orders.status.delivered'),   cls: 'status--delivered' },
      cancelled:  { label: t('orders.status.cancelled'),   cls: 'status--cancelled' },
    }
    return labels[s] || { label: status || 'Unknown', cls: 'status--placed' }
  }

  const getPayInfo = (payStatus) => {
    const p = payStatus?.toLowerCase()
    const labels = {
      pending:     { label: t('orders.payment.pending'), cls: 'status--pending' },
      paid:        { label: t('orders.payment.paid'),            cls: 'status--paid' },
      failed:      { label: t('orders.payment.failed'),          cls: 'status--failed' },
      cod_pending: { label: t('orders.payment.cod_pending'),     cls: 'status--cod' },
    }
    return labels[p] || { label: payStatus || 'Unknown', cls: 'status--pending' }
  }

  useEffect(() => { init() }, [])

  async function init() {
    const { data: userData } = await db.auth.currentUser()
    const u = userData?.user
    if (!u) { navigate('/buyer-login'); return }

    const token = localStorage.getItem('token')

    try {
      const res = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const fetchedOrders = res.data?.orders || res.data || []
      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders)
        setLoading(false)
        return
      }
    } catch (apiErr) {
      console.error("API fetch failed, trying db direct:", apiErr.message)
    }

    let { data, error: queryError } = await db
      .from('orders')
      .select('*, order_items(*)')
      .or(`user_id.eq.${u.id},buyer_id.eq.${u.id}`)
      .order('created_at', { ascending: false })

    if (queryError) {
      const { data: simpleData, error: simpleError } = await db
        .from('orders')
        .select('*')
        .or(`user_id.eq.${u.id},buyer_id.eq.${u.id}`)
        .order('created_at', { ascending: false })

      if (simpleError) {
        setError(`Could not fetch orders: ${simpleError.message}`)
      } else {
        setOrders(simpleData || [])
      }
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  if (loading) return <div className="orders-loading">{t('orders.loading')}</div>

  return (
    <section className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <span>{t('navbar.profile')}</span>
          <h1>{t('ordersPage.title')}</h1>
          <p>{t('orders.track_p')}</p>
        </div>

        {error && <div className="orders-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>{t('ordersPage.noOrders')}</h2>
            <p>{t('orders.empty_p')}</p>
            <Link to="/products" className="orders-shop-btn">{t('orders.explore')}</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const orderId      = shortOrderId(order?.id)
              const date         = formatDate(order?.created_at)
              const totalAmount  = order?.total_amount ?? '—'
              const statusKey    = order?.status ?? ''
              const payStatusKey = order?.payment_status ?? ''
              const payMethod    = order?.payment_method ?? ''
              const addr         = order?.addresses ?? null
              const items        = Array.isArray(order?.order_items) ? order.order_items : []

              const statusInfo = getStatusInfo(statusKey)
              const payInfo = getPayInfo(payStatusKey)

              return (
                <div key={order?.id ?? Math.random()} className="order-card">
                  <div className="order-card-top">
                    <div className="order-meta">
                      <div>
                        <span className="order-label">{t('ordersPage.orderId')}</span>
                        <span className="order-id">#{orderId}</span>
                      </div>
                      <div>
                        <span className="order-label">{t('ordersPage.date')}</span>
                        <span className="order-date">{date}</span>
                      </div>
                      <div>
                        <span className="order-label">{t('common.total')}</span>
                        <span className="order-total">
                          {totalAmount !== '—' ? `₹${totalAmount}` : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="order-badges">
                      <span className={`order-status ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                      <span className={`order-status ${payInfo.cls}`}>
                        {payInfo.label}
                      </span>
                      <span className="order-pay-method">
                        {payMethod.toLowerCase() === 'cod' ? `💵 ${t('orders.payment.cod')}` : `📱 ${t('orders.payment.upi')}`}
                      </span>
                    </div>
                  </div>

                  <div className="order-items-list">
                    {items.length > 0 ? items.map((item, idx) => {
                      const itemId    = item?.id ?? idx
                      const name      = item?.product_name || 'Product'
                      const qty       = Number(item?.quantity ?? 0)
                      const price     = Number(item?.price ?? 0)
                      const lineTotal = price * qty

                      return (
                        <div key={itemId} className="order-item-row">
                          <span className="order-item-name">{name}</span>
                          <span>{t('cartPage.qty')}: {qty}</span>
                          <span>₹{price} {t('orders.each')}</span>
                          <strong>₹{lineTotal}</strong>
                        </div>
                      )
                    }) : (
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
                        {t('orders.no_items')}
                      </p>
                    )}
                  </div>

                  {addr && (
                    <div className="order-address">
                      📍{' '}
                      {[
                        addr.full_name,
                        addr.address_line1,
                        addr.city,
                        addr.state,
                        addr.pincode ? `– ${addr.pincode}` : '',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  );
}
