import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import '../components/landing.css'

const getImage = (group) =>
  group?.product?.image ||
  group?.product?.image_url ||
  'https://via.placeholder.com/600x400?text=AgroMitra'

export default function CollectiveBuying() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [groups, setGroups] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    productId: '',
    area: '',
    quantity: 1,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setMessage('')

    try {
      const [groupPayload, productResult] = await Promise.all([
        apiRequest('/collective-buys'),
        db.from('products').select('*').order('created_at', { ascending: false }),
      ])

      setGroups(groupPayload.collectiveBuys || [])
      setProducts(productResult.data || [])
      setForm((prev) => ({
        ...prev,
        productId: prev.productId || productResult.data?.[0]?.id || '',
      }))
    } catch (error) {
      setMessage(error.message || t('collective.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === form.productId),
    [products, form.productId]
  )

  async function handleJoin(e) {
    e.preventDefault()

    const { data: userData } = await db.auth.currentUser()
    if (!userData?.user) {
      alert(t('product.login_buyer'))
      navigate('/buyer-login')
      return
    }

    if (!form.productId || !form.area.trim() || Number(form.quantity) <= 0) {
      setMessage(t('collective.validation'))
      return
    }

    setJoining(true)
    setMessage('')

    try {
      await apiRequest('/collective-buys/join', {
        method: 'POST',
        body: JSON.stringify({
          productId: form.productId,
          area: form.area,
          quantity: Number(form.quantity),
        }),
      })

      setMessage(t('collective.joined'))
      setForm((prev) => ({ ...prev, quantity: 1 }))
      await loadData()
    } catch (error) {
      setMessage(error.message || t('collective.joinFailed'))
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <section className="products-page-pro">
        <div className="products-container-pro">
          <div className="products-loading">
            <div className="loader-spinner"></div>
            <p>{t('collective.loading')}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="products-page-pro">
      <div className="products-container-pro">
        <div className="products-hero-mini">
          <div>
            <span>{t('collective.badge')}</span>
            <h1>{t('collective.title')}</h1>
            <p>
              {t('collective.subtitle')}
            </p>
          </div>
        </div>

        {message && (
          <div className="products-error-pro" style={{ marginBottom: 24 }}>
            <p>{message}</p>
          </div>
        )}

        <div className="category-product-section">
          <div className="category-section-head">
            <h2>{t('collective.joinTitle')}</h2>
            <span>{selectedProduct ? t('collective.selected', { name: selectedProduct.name }) : t('collective.chooseProduct')}</span>
          </div>

          <form
            onSubmit={handleJoin}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              alignItems: 'end',
              background: 'white',
              padding: 20,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}
          >
            <label style={{ display: 'grid', gap: 6, fontWeight: 700 }}>
              {t('collective.product')}
              <select
                value={form.productId}
                onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                style={{ padding: 12, border: '1px solid #d1d5db', borderRadius: 6 }}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Rs.{product.price}/{product.unit || t('common.units.piece')}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6, fontWeight: 700 }}>
              {t('collective.area')}
              <input
                value={form.area}
                onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
                placeholder={t('collective.areaPlaceholder')}
                style={{ padding: 12, border: '1px solid #d1d5db', borderRadius: 6 }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6, fontWeight: 700 }}>
              {t('collective.quantity')}
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                style={{ padding: 12, border: '1px solid #d1d5db', borderRadius: 6 }}
              />
            </label>

            <button
              type="submit"
              disabled={joining || products.length === 0}
              style={{
                background: '#15803d',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '13px 18px',
                fontWeight: 800,
                cursor: joining ? 'not-allowed' : 'pointer',
              }}
            >
              {joining ? t('collective.joining') : t('collective.join')}
            </button>
          </form>
        </div>

        <div className="category-product-section mt-12">
          <div className="category-section-head">
            <h2>{t('collective.activeTitle')}</h2>
            <span>{t('collective.groups', { count: groups.length })}</span>
          </div>

          {groups.length === 0 ? (
            <div className="products-empty-pro">
              <h2>{t('collective.emptyTitle')}</h2>
              <p>{t('collective.emptyText')}</p>
            </div>
          ) : (
            <div className="shop-products-row">
              {groups.map((group) => {
                const progress = Math.min(
                  100,
                  Math.round((Number(group.totalQuantity || 0) / Number(group.targetQuantity || 1)) * 100)
                )

                return (
                  <div key={group.id} className="shop-card" style={{ cursor: 'default' }}>
                    <div className="shop-img-box">
                      <img src={getImage(group)} alt={group.productName} />
                    </div>
                    <div className="shop-info">
                      <span className="shop-tag">{group.area}</span>
                      <h3>{group.productName}</h3>
                      <div className="shop-price">
                        <span>{t('collective.dealPrice', { price: group.dealPrice || group.product?.price || 0 })}</span>
                      </div>
                      <p className="shop-pack">
                        {t('collective.combined', { total: group.totalQuantity, target: group.targetQuantity })}
                      </p>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#16a34a' }} />
                      </div>
                      <p className="shop-rating">
                        {group.status === 'deal_ready' ? t('collective.dealReady') : t('collective.open')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
