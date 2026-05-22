import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

export default function Checkout() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getCartProduct = (item) => item.products || item.productId || item.product || {}
  const getProductName = (item) => {
    const product = getCartProduct(item)
    return item.product_name || item.productName || product.name || product.title || item.name || t('product.fallbackName')
  }
  const getProductPrice = (item) => {
    const product = getCartProduct(item)
    return Number(item.price ?? product.price ?? product.selling_price ?? 0)
  }
  const getProductImage = (item) => {
    const product = getCartProduct(item)
    return (
      item.image ||
      item.image_url ||
      product.image ||
      product.image_url ||
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80'
    )
  }
  const getProductId = (item) => {
    const product = getCartProduct(item)
    return item.product_id || product.id || product._id || item.productId
  }

  useEffect(() => {
    init()
  }, [])

  async function init() {
    setLoading(true)
    const { data: userData } = await db.auth.currentUser()
    const currentUser = userData?.user

    if (!currentUser) {
      navigate('/buyer-login')
      return
    }
    setUser(currentUser)

    // Load cart
    const { data: cartData, error: cartError } = await db
      .from('cart')
      .select(`
        id,
        quantity,
        product_id,
        product_name,
        price,
        image
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (cartError) {
      setError(cartError.message)
      setLoading(false)
      return
    }

    if (!cartData || cartData.length === 0) {
      navigate('/cart')
      return
    }

    setItems(cartData)

    // Load default address, fallback to most recent
    const { data: addrData } = await db
      .from('addresses')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('is_default', true)
      .maybeSingle()

    if (addrData) {
      setAddress(addrData)
    } else {
      const { data: anyAddr } = await db
        .from('addresses')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (anyAddr) setAddress(anyAddr)
    }

    setLoading(false)
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getProductPrice(item) * Number(item.quantity || 1),
    0
  )
  const deliveryFee = subtotal > 0 ? 49 : 0
  const grandTotal = subtotal + deliveryFee

  // Flattened cart usually doesn't have stock info, we proceed with cart quantity
  const stockWarnings = []

  function handleContinue() {
    if (!address) {
      setError(t('checkoutPage.addressRequired'))
      return
    }
    if (stockWarnings.length > 0) {
      setError(t('checkoutPage.stockWarning'))
      return
    }
    setError('')

    // Pass order data via sessionStorage — payment method chosen on /payment
    const orderData = {
      items: items.map((i) => ({
        cartId: i.id,
        productId: getProductId(i),
        productName: getProductName(i),
        price: getProductPrice(i),
        quantity: Number(i.quantity || 1),
      })),
      addressId: address.id,
      addressLabel: `${address.full_name}, ${address.address_line1}, ${address.city} – ${address.pincode}`,
      subtotal,
      deliveryFee,
      grandTotal,
      buyerId: user.id,
    }
    sessionStorage.setItem('agromitra_order', JSON.stringify(orderData))
    navigate('/payment')
  }

  if (loading) {
    return <div className="checkout-loading">{t('checkoutPage.loading')}</div>
  }

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <span>{t('checkoutPage.title')}</span>
          <h1>{t('checkoutPage.title')}</h1>
          <p>{t('checkoutPage.subtitle')}</p>
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <div className="checkout-layout">
          {/* Left column */}
          <div className="checkout-left">
            {/* Order Summary */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">🛒 {t('cartPage.summary')}</h2>
              <div className="checkout-items">
                {items.map((item) => {
                  const image = getProductImage(item)
                  const name = getProductName(item)
                  const price = getProductPrice(item)
                  const quantity = Number(item.quantity || 1)

                  return (
                    <div className="checkout-item" key={item.id}>
                      <img src={image} alt={name} className="checkout-item-img" />
                      <div className="checkout-item-info">
                        <strong>{name}</strong>
                        <span>
                          ₹{price} × {quantity}
                        </span>
                      </div>
                      <div className="checkout-item-subtotal">
                        ₹{(price * quantity).toFixed(0)}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>{t('cartPage.subtotal')}</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="checkout-total-row">
                  <span>{t('checkoutPage.deliveryFee')}</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="checkout-total-row checkout-grand">
                  <span>{t('checkoutPage.grandTotal')}</span>
                  <strong>₹{grandTotal}</strong>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">📍 {t('checkoutPage.shippingDetails')}</h2>
                <Link to="/addresses" className="checkout-change-btn">
                  {address ? t('checkoutPage.change') : t('addresses.add_new')}
                </Link>
              </div>

              {address ? (
                <div className="checkout-address-box">
                  <strong>{address.full_name}</strong>
                  <span>{address.phone}</span>
                  <p>
                    {address.address_line1}
                    {address.address_line2 ? `, ${address.address_line2}` : ''}
                    <br />
                    {address.city}, {address.state} – {address.pincode}
                    <br />
                    {address.country}
                  </p>
                  {address.is_default && (
                    <span className="checkout-default-badge">{t('addresses.default')}</span>
                  )}
                </div>
              ) : (
                <div className="checkout-no-address">
                  <p>{t('checkoutPage.noAddress')}</p>
                  <Link to="/addresses" className="checkout-add-addr-btn">
                    + {t('addresses.add_btn')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky price summary */}
          <div className="checkout-right">
            <div className="checkout-sticky-summary">
              <h2>{t('checkoutPage.priceDetails')}</h2>
              <div className="summary-rows">
                <div className="checkout-total-row">
                  <span>{t('checkoutPage.itemsCount', { count: items.length })}</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="checkout-total-row">
                  <span>{t('checkoutPage.delivery')}</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="checkout-total-row checkout-grand">
                  <span>{t('checkoutPage.totalPayable')}</span>
                  <strong>₹{grandTotal}</strong>
                </div>
              </div>

              <button
                className="checkout-place-btn"
                onClick={handleContinue}
                disabled={!address || stockWarnings.length > 0}
              >
                {t('checkoutPage.placeOrder')} →
              </button>

              {!address && (
                <p className="checkout-addr-warning">
                  ⚠ {t('checkoutPage.addAddressWarning')}
                </p>
              )}

              <Link to="/cart" className="checkout-back-link">
                ← {t('checkoutPage.backToCart')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
