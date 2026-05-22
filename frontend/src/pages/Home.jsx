import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Reviews from '../components/Reviews'
import '../components/landing.css'

function FeatureRow() {
  const { t } = useLanguage()
  return (
    <div className="mini-feature-row reveal-up">
      <div className="mini-feature-item">
        <span className="mini-feature-icon">🔒</span>
        {t('home.secureTransactions')}
      </div>
      <div className="mini-feature-item">
        <span className="mini-feature-icon">📈</span>
        {t('home.bestMarketPrices')}
      </div>
      <div className="mini-feature-item">
        <span className="mini-feature-icon">🎧</span>
        {t('home.expertSupport')}
      </div>
    </div>
  )
}

function StatsSection() {
  const { t } = useLanguage()
  const stats = [
    { value: '50K+', label: t('home.happyFarmers') },
    { value: '10K+', label: t('home.productsListed') },
    { value: '500+', label: t('home.verifiedBuyers') },
    { value: '25%', label: t('home.avgIncomeGrowth') },
  ]

  return (
    <section className="stats-strip-modern reveal-up">
      {stats.map((item) => (
        <div key={item.label} className="stat-modern">
          <h2>{item.value}</h2>
          <p>{item.label}</p>
        </div>
      ))}
    </section>
  )
}

function CTABanner() {
  const { t } = useLanguage()
  return (
    <section className="cta-banner-wrapper reveal-up">
      <div className="cta-banner-inner">
        <h2>{t('home.ctaTitle')}</h2>
        <p>{t('home.ctaSubtitle')}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/register" className="btn" style={{ background: 'white', color: '#15803d', fontWeight: 'bold' }}>
            {t('home.getStartedBtn')}
          </Link>
          <Link to="/products" className="btn" style={{ border: '1px solid white', color: 'white' }}>
            {t('home.exploreBtn')}
          </Link>
        </div>
      </div>
    </section>
  )
}


export default function Home() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      <Hero />
      <FeatureRow />
      <Features />
      <StatsSection />
      <Reviews />
      <CTABanner />

    </div>
  )
}