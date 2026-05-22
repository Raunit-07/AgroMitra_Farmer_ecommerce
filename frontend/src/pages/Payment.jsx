/**
 * Payment.jsx – Production-like UPI demo payment page
 *
 * PRODUCTION NOTE:
 * This page generates a real UPI deep link / QR for the fixed merchant UPI ID.
 * However, payment verification is NOT automatic — user clicks "I Have Paid" manually.
 * For real production, integrate Razorpay / PhonePe / Paytm and verify via server-side webhooks.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { db } from '../lib/mongoClient'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api'
).replace(/\/$/, '')

// Fixed merchant UPI ID — stored in env for easy config
const MERCHANT_UPI  = import.meta.env.VITE_MERCHANT_UPI_ID || 'abhaypandey092004-2@oksbi'
const MERCHANT_NAME = 'AgroMitra'

/** Build a standard UPI payment link */
function buildUpiLink(amount) {
  const params = new URLSearchParams({
    pa: MERCHANT_UPI,
    pn: MERCHANT_NAME,
    am: String(amount),
    cu: 'INR',
    tn: 'AgroMitra Order',
  })
  return `upi://pay?${params.toString()}`
}

/** Detect if running on a mobile browser */
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function getCartProduct(item) {
  return item.products || item.productId || item.product || {}
}

function normalizeOrderItem(item) {
  const product = getCartProduct(item)
  const price = Number(item.price ?? product.price ?? product.selling_price ?? 0)
  const quantity = Number(item.quantity || 1)

  return {
    ...item,
    cartId: item.cartId || item.id,
    productId: item.productId || item.product_id || product.id || product._id,
    productName:
      item.productName ||
      item.product_name ||
      product.name ||
      product.title ||
      item.name ||
      'Product',
    price,
    quantity,
    image: item.image || item.image_url || product.image || product.image_url,
  }
}

export default function Payment() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [orderData, setOrderData]       = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [showQR, setShowQR]             = useState(false)
  const [copied, setCopied]             = useState(false)
  const [processing, setProcessing]     = useState(false)

  useEffect(() => {
    fetchOrderData()
  }, [navigate])

  async function fetchOrderData() {
    // 1. Try sessionStorage first (for address and immediate context)
    const raw = sessionStorage.getItem('agromitra_order')
    let baseOrder = raw ? JSON.parse(raw) : null
    if (baseOrder?.items) {
      baseOrder = {
        ...baseOrder,
        items: baseOrder.items.map(normalizeOrderItem),
      }
    }

    // 2. Always verify/fetch from db cart table
    const { data: userData } = await db.auth.currentUser()
    const user = userData?.user
    if (!user) { navigate('/buyer-login'); return }

    const { data: cartItems, error } = await db
      .from('cart')
      .select('*')
      .eq('user_id', user.id)

    if (error || !cartItems || cartItems.length === 0) {
      if (!baseOrder) { navigate('/cart'); return }
      setOrderData(baseOrder)
    } else {
      const normalizedItems = cartItems.map(normalizeOrderItem)
      // Re-calculate totals from DB data to prevent tampering
      const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const deliveryFee = 49
      const grandTotal = subtotal + deliveryFee

      setOrderData({
        ...baseOrder,
        items: normalizedItems,
        subtotal,
        deliveryFee,
        grandTotal
      })
    }
  }

  function handleMethodChange(method) {
    setPaymentMethod(method)
    setShowQR(false)
    setCopied(false)
  }

  function handlePayWithApp() {
    if (!orderData) return
    const link = buildUpiLink(orderData.grandTotal)
    if (isMobile()) {
      // On mobile: redirect to UPI deep link — OS picks up GPay / PhonePe / Paytm
      window.location.href = link
    } else {
      // On desktop: UPI deep links don't work — prompt user to scan QR instead
      setShowQR(true)
    }
  }

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(MERCHANT_UPI)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  // ── ORDER CREATION — FIXED logic for Payment Status ────────────────
  async function createOrder(paymentStatus) {
    setProcessing(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert(t('paymentSuccess.sessionExpired'));
        navigate('/buyer-login');
        return;
      }

      const orderData = JSON.parse(sessionStorage.getItem('agromitra_order'))
      
      if (!orderData) throw new Error('Order data not found')

      // Map payment status to database-approved values (LOWERCASE required by DB)
      const normalizedStatus = paymentStatus === 'cod_pending' || paymentStatus === 'pending' || paymentStatus === 'PENDING'
        ? 'pending' 
        : paymentStatus.toLowerCase();

      const response = await axios.post(`${API_BASE_URL}/orders`, {
        address_id:     orderData.addressId,
        total_amount:   orderData.grandTotal,
        payment_method: paymentMethod.toLowerCase(),
        payment_status: normalizedStatus,
        items:          orderData.items
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("ORDER RESPONSE:", response.data);

      const createdOrder = response.data.order || response.data.data || response.data;
      const createdOrderId = createdOrder?.id;

      console.log("CREATED ORDER ID:", createdOrderId);

      if (!createdOrderId) {
        alert(t('paymentPage.orderIdMissing'));
        return;
      }

      // Save IDs for persistence
      localStorage.setItem('orderId', createdOrderId)
      localStorage.setItem('lastOrderId', createdOrderId)
      localStorage.setItem('lastOrderAmount', createdOrder.total_amount || createdOrder.totalAmount || orderData.grandTotal)
      
      sessionStorage.removeItem('agromitra_order')
      window.dispatchEvent(new Event('cartUpdated'))

      navigate('/payment-success', {
        state: {
          orderId: createdOrderId,
          amount:  createdOrder.total_amount || createdOrder.totalAmount || orderData.grandTotal,
          method:  paymentMethod.toLowerCase(),
          paymentStatus: normalizedStatus,
        },
      })
    } catch (err) {
      console.error("Place Order Error:", err);
      
      // Auto-logout on 401
      if (err.response?.status === 401) {
        const currentLanguage = localStorage.getItem('i18nextLng')
        localStorage.clear();
        if (currentLanguage) localStorage.setItem('i18nextLng', currentLanguage)
        sessionStorage.clear();
        alert(t('paymentSuccess.sessionExpired'));
        navigate('/buyer-login');
        return;
      }

      alert(err.response?.data?.message || err.message || 'Failed to place order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!orderData) return null

  const upiLink = buildUpiLink(orderData.grandTotal)

  return (
    <section className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <span>{t('paymentPage.title')}</span>
          <h1>{t('paymentPage.title')}</h1>
          <p>{t('paymentPage.subtitle')}</p>
        </div>

        <div className="payment-layout">
          {/* ─── Left: payment method + action ─── */}
          <div className="payment-main">

            {/* Payment Method Selector */}
            <div className="payment-card">
              <h2 className="payment-card-title">💳 {t('paymentPage.method')}</h2>
              <div className="checkout-payment-options">
                <label className={`checkout-pay-option${paymentMethod === 'upi' ? ' active' : ''}`}>
                  <input type="radio" name="paymentMethod" value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => handleMethodChange('upi')} />
                  <div className="pay-option-icon">📱</div>
                  <div>
                    <strong>{t('paymentPage.upiPayment')}</strong>
                    <span>GPay · PhonePe · Paytm · BHIM</span>
                  </div>
                </label>

                <label className={`checkout-pay-option${paymentMethod === 'cod' ? ' active' : ''}`}>
                  <input type="radio" name="paymentMethod" value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handleMethodChange('cod')} />
                  <div className="pay-option-icon">💵</div>
                  <div>
                    <strong>{t('paymentPage.cod')}</strong>
                    <span>{t('paymentPage.codSubtitle')}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* ─── UPI Flow ─── */}
            {paymentMethod === 'upi' && (
              <div className="payment-card">
                <h2 className="payment-card-title">📱 {t('paymentPage.payViaUpi')}</h2>

                {/* Amount highlight */}
                <div className="upi-amount-box">
                  <span className="upi-amount-label">{t('checkoutPage.totalPayable')}</span>
                  <span className="upi-amount-value">₹{orderData.grandTotal}</span>
                </div>

                {/* Two primary actions */}
                <div className="upi-actions-row">
                  {/* Pay with UPI App */}
                  <button className="upi-app-btn" onClick={handlePayWithApp}>
                    <span className="upi-btn-icon">🚀</span>
                    <span>
                      <strong>{t('paymentSuccess.payWithApp')}</strong>
                      <small>GPay · PhonePe · Paytm</small>
                    </span>
                  </button>

                  {/* Show / hide QR */}
                  <button
                    className={`upi-qr-btn${showQR ? ' upi-qr-btn--active' : ''}`}
                    onClick={() => setShowQR((v) => !v)}
                  >
                    <span className="upi-btn-icon">📷</span>
                    <span>
                      <strong>{showQR ? t('paymentPage.hideQr') : t('paymentPage.showQr')}</strong>
                      <small>{t('paymentPage.scanAnyUpi')}</small>
                    </span>
                  </button>
                </div>

                {/* Desktop hint */}
                {!isMobile() && (
                  <p className="upi-desktop-hint">
                    💻 <strong>{t('paymentPage.onDesktop')}</strong> {t('paymentPage.desktopHint')}
                  </p>
                )}

                {/* QR panel (collapsible) */}
                {showQR && (
                  <div className="upi-qr-panel">
                    <div className="upi-qr-code-box">
                      <QRCodeSVG
                        value={upiLink}
                        size={210}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="H"
                        includeMargin
                      />
                    </div>
                    <p className="upi-qr-scan-hint">{t('paymentPage.scanApps')}</p>
                    <div className="upi-merchant-row">
                      <div>
                        <span className="upi-merchant-label">{t('paymentPage.merchantUpi')}</span>
                        <span className="upi-merchant-id">{MERCHANT_UPI}</span>
                      </div>
                      <button className="upi-copy-btn" onClick={copyUpiId}>
                        {copied ? `✅ ${t('paymentPage.copied')}` : `📋 ${t('paymentPage.copy')}`}
                      </button>
                    </div>
                    <p className="upi-qr-amount-note">
                      {t('paymentPage.amount')}: <strong>₹{orderData.grandTotal}</strong> · {t('paymentPage.payTo')}: <strong>{MERCHANT_NAME}</strong>
                    </p>
                  </div>
                )}

                {/* Demo notice */}
                <div className="payment-demo-notice">
                  ⚠ <strong>{t('paymentPage.demoMode')}</strong> {t('paymentPage.demoNotice')}
                </div>

                <button
                  className="payment-confirm-btn"
                  onClick={() => createOrder('pending')}
                  disabled={processing}
                >
                  {processing ? t('paymentPage.placingOrder') : t('paymentPage.confirmPayment')}
                </button>
              </div>
            )}

            {/* ─── COD Flow ─── */}
            {paymentMethod === 'cod' && (
              <div className="payment-card">
                <h2 className="payment-card-title">💵 {t('paymentPage.cod')}</h2>
                <p className="payment-note">{t('paymentPage.codNote')}</p>
                <div className="payment-cod-icon">🚚</div>
                <p className="payment-cod-text">
                  {t('paymentPage.payWhenArrives', { amount: orderData.grandTotal })}
                </p>
                <button
                  className="payment-confirm-btn"
                  onClick={() => createOrder('cod_pending')}
                  disabled={processing}
                >
                  {processing ? t('paymentPage.placingOrder') : `🛒 ${t('paymentPage.placeCod')}`}
                </button>
              </div>
            )}

            <Link to="/checkout" className="checkout-back-link">
              ← {t('paymentPage.backToCheckout')}
            </Link>
          </div>

          {/* ─── Right: Order Summary ─── */}
          <div className="payment-summary-card">
            <h2>{t('cartPage.summary')}</h2>
            <div className="payment-summary-items">
              {orderData.items.map((item, i) => (
                <div key={i} className="payment-summary-item">
                  <span className="payment-summary-name">{item.productName}</span>
                  <span>₹{item.price} × {item.quantity}</span>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              ))}
            </div>
            <div className="payment-summary-totals">
              <div className="checkout-total-row"><span>{t('cartPage.subtotal')}</span><span>₹{orderData.subtotal}</span></div>
              <div className="checkout-total-row"><span>{t('checkoutPage.delivery')}</span><span>₹{orderData.deliveryFee}</span></div>
              <div className="checkout-total-row checkout-grand"><span>{t('checkoutPage.totalPayable')}</span><strong>₹{orderData.grandTotal}</strong></div>
            </div>
            <div className="payment-summary-addr">
              <p>📍 {orderData.addressLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
