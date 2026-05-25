import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/mongoClient'
import { useLanguage } from '../context/LanguageContext'
import ProductCard from '../components/ProductCard'
import '../components/landing.css'

const CATEGORIES = [
  { key: 'seeds', slug: 'seeds', icon: '🌱' },
  { key: 'pesticides', slug: 'pesticides', icon: '🛡️' },
  { key: 'insecticides', slug: 'insecticides', icon: '🐛' },
  { key: 'farming_tools', slug: 'farming-tools', icon: '🚜' }
]

export default function Products() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [error, setError] = useState(null)

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'seller' || role === 'farmer') {
      navigate('/seller-dashboard');
      return;
    }
    fetchProducts()
  }, [navigate])

  async function fetchProducts() {
    setLoading(true)
    setError(null)

    const { data, error: err } = await db
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    console.log("FETCHED PRODUCTS:", data)

    if (err) {
      console.error(err)
      setError('Failed to load products. Please try again.')
    } else {
      setProducts(data || [])
    }

    setLoading(false)
  }

  const filteredProducts = useMemo(() => {
    let data = [...products]

    // Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy === 'low') {
      data.sort((a, b) => Number(a.price) - Number(b.price))
    }
    if (sortBy === 'high') {
      data.sort((a, b) => Number(b.price) - Number(a.price))
    }

    return data
  }, [products, search, sortBy])

  if (loading) {
    return (
      <section className="products-page-pro">
        <div className="products-container-pro">
           <div className="products-loading">
             <div className="loader-spinner"></div>
             <p>{t('productsPage.loading')}</p>
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
            <span>{t('productsPage.marketplace')}</span>
            <h1>{t('productsPage.title')}</h1>
            <p>{t('productsPage.explore_p')}</p>
          </div>

          <div className="products-controls-pro">
            <input
              type="text"
              placeholder={t('productsPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">{t('productsPage.sort_default')}</option>
              <option value="low">{t('productsPage.price_low')}</option>
              <option value="high">{t('productsPage.price_high')}</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="products-error-pro">
            <h2>{t('productsPage.oops')}</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className="retry-btn">{t('productsPage.retry')}</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty-pro">
            <h2>{t('productsPage.not_found')}</h2>
            <p>{t('productsPage.not_found_p')}</p>
          </div>
        ) : (
          <>
            {/* Shop by Category Section */}
            <div className="category-product-section">
              <div className="category-section-head">
                <h2>{t('productsPage.shop_category')}</h2>
              </div>
              
              <div className="category-cards-grid">
                {CATEGORIES.map((cat) => (
                  <div 
                    key={cat.slug} 
                    className="category-card-pro"
                    onClick={() => navigate(`/products/category/${cat.slug}`)}
                  >
                    <div className="cat-icon">{cat.icon}</div>
                    <h3>{t(`common.categories.${cat.key}`)}</h3>
                    <p>{t('productsPage.explore_btn')} {t(`common.categories.${cat.key}`)} →</p>
                  </div>
                ))}
              </div>
            </div>

            {/* All Products Section */}
            <div className="category-product-section mt-12">
              <div className="category-section-head">
                <h2>{t('productsPage.title')}</h2>
                <span>{filteredProducts.length} {t('productsPage.items')}</span>
              </div>
              
              <div className="shop-products-row">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
