import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './landing.css'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="hero-split">
      <div className="hero-split-left reveal-up">
        <h1>
          {t('hero.title1')} <br />
          <span className="highlight-green">{t('hero.titleHighlight')}</span>{' '}
          {t('hero.title2')}
        </h1>

        <p>{t('hero.description')}</p>

        <div className="hero-split-buttons">
          <Link to="/register" className="btn btn-primary">
            {t('hero.getStarted')}
          </Link>

          <Link
            to="/products"
            className="btn btn-secondary dark-secondary"
            style={{
              color: '#0f172a',
              background: 'transparent',
              border: '1px solid #cbd5e1',
            }}
          >
            {t('hero.explore')}
          </Link>
        </div>
      </div>

      <div className="hero-split-right reveal-up reveal-delay-2">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"
          alt="Farmer in field"
          className="hero-main-img"
        />
      </div>
    </section>
  )
}