import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

export default function OrderConfirmed() {
  const { t } = useLanguage()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()

  const [orderId, setOrderId] = useState('N/A')
  const [transactionId, setTransactionId] = useState('N/A')
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  useEffect(() => {
    // --- 3-tier data retrieval ---

    // 1. Route state (from navigate)
    let oid = state?.orderId
    let tid = state?.transactionId
    let amt = state?.amount

    console.log("ORDER CONFIRMED - Route state:", { oid, tid, amt })

    // 2. localStorage fallback (survives refresh)
    if (!oid) oid = localStorage.getItem('confirmedOrderId')
    if (!tid) tid = localStorage.getItem('confirmedTransactionId')
    if (!amt) amt = localStorage.getItem('confirmedAmount')

    // 3. Query params fallback
    if (!oid) oid = searchParams.get('id')

    console.log("ORDER CONFIRMED - After fallbacks:", { oid, tid, amt })

    // Set whatever we have so far
    if (oid) setOrderId(oid)
    if (tid) setTransactionId(tid)
    if (amt) setAmount(amt)

    // 4. If we have orderId but missing other data, fetch from API
    if (oid && (!tid || !amt || tid === 'N/A' || amt === 0)) {
      fetchOrderDetails(oid)
    }
  }, [state, searchParams])

  async function fetchOrderDetails(oid) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await axios.get(
        `${API_BASE_URL}/orders/track/${oid}`,
      )

      console.log("ORDER CONFIRMED - API response:", res.data)

      if (res.data) {
        const order = res.data.order || res.data
        if (order.total_amount) setAmount(order.total_amount)
        if (order.transaction_id) setTransactionId(order.transaction_id)
        if (order.payment_method) setPaymentMethod(order.payment_method)
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err)
    }
  }

  // Confetti animation
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, [])

  const shortId = orderId && orderId !== 'N/A' ? String(orderId).slice(0, 8).toUpperCase() : 'N/A'

  return (
    <section className="order-confirmed-page">
      
      <div className="confirmed-card">
        <div className="confirmed-icon-wrap">
          <div className="confirmed-icon-circle">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="25" stroke="#16a34a" strokeWidth="2" fill="#f0fdf4" className="checkmark-circle" />
              <path d="M14 27l9 9 15-16" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="checkmark-tick" />
            </svg>
          </div>
        </div>

        <h1 className="confirmed-heading">{t('orderConfirmed.title')}</h1>
        <p className="confirmed-sub">{t('orderConfirmed.subtitle')}</p>

        <div className="confirmed-details-card">
          <div className="confirmed-row">
            <span>{t('ordersPage.orderId')}</span>
            <strong>#{shortId}</strong>
          </div>
          <div className="confirmed-row">
            <span>{t('orderConfirmed.transactionId')}</span>
            <strong className="txn-text">{transactionId}</strong>
          </div>
          <div className="confirmed-row">
            <span>{t('orderConfirmed.amountPaid')}</span>
            <strong className="amount-paid">₹{amount}</strong>
          </div>
          <div className="confirmed-row">
            <span>{t('orderConfirmed.paymentMethod')}</span>
            <strong>{paymentMethod}</strong>
          </div>
        </div>

        <div className="confirmed-actions">
          <Link to="/my-orders" className="btn-view-orders">
            📦 {t('orderConfirmed.viewOrders')}
          </Link>
          <Link to="/" className="btn-back-home">
            🏠 {t('orderConfirmed.backHome')}
          </Link>
        </div>
      </div>

      <style>{`
        .order-confirmed-page { display: flex; align-items: center; justify-content: center; min-height: 90vh; padding: 20px; background: #f8fafc; }
        .confirmed-card { background: white; width: 100%; max-width: 500px; padding: 50px 40px; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); text-align: center; }
        
        .confirmed-icon-wrap { margin-bottom: 30px; }
        .confirmed-icon-circle { width: 100px; height: 100px; margin: 0 auto; }
        
        .confirmed-heading { font-size: 32px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
        .confirmed-sub { color: #64748b; font-size: 16px; margin-bottom: 40px; }
        
        .confirmed-details-card { background: #f1f5f9; padding: 24px; border-radius: 20px; margin-bottom: 40px; text-align: left; }
        .confirmed-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .confirmed-row:last-child { margin-bottom: 0; }
        .confirmed-row span { color: #64748b; font-size: 14px; }
        .confirmed-row strong { color: #1e293b; font-size: 15px; }
        .txn-text { color: #2563eb !important; font-family: monospace; }
        .amount-paid { color: #15803d !important; font-size: 17px; }
        
        .confirmed-actions { display: flex; flex-direction: column; gap: 15px; }
        .btn-view-orders { background: #1e293b; color: white; padding: 16px; border-radius: 14px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .btn-back-home { background: #f1f5f9; color: #475569; padding: 16px; border-radius: 14px; text-decoration: none; font-weight: 600; font-size: 16px; }
        
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        .checkmark-tick { stroke-dasharray: 40; stroke-dashoffset: 40; animation: drawCheck 0.5s ease-out 0.5s forwards; }
      `}</style>
    </section>
  )
}
