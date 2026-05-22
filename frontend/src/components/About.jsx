import './landing.css'
import { useLanguage } from '../context/LanguageContext'

export default function About() {
  const { t } = useLanguage()

  return (
    <section id="about" className="section about-section premium-about-section">
      <div className="container about-grid premium-about-grid">
        <div className="about-left reveal-up">
          <span className="section-badge">{t('about.badge')}</span>
          <h2>{t('about.title')}</h2>
          <p>
            {t('about.p1')}
          </p>
          <p>
            {t('about.p2')}
          </p>

          <div className="about-points">
            <div className="about-point">
              <span>✔</span>
              <p>{t('about.point1')}</p>
            </div>
            <div className="about-point">
              <span>✔</span>
              <p>{t('about.point2')}</p>
            </div>
            <div className="about-point">
              <span>✔</span>
              <p>{t('about.point3')}</p>
            </div>
          </div>
        </div>

        <div className="about-right reveal-up reveal-delay-2">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80"
            alt={t('about.imageAlt')}
            className="about-image"
          />

          <div className="about-card premium-about-card">
            <strong>100%</strong>
            <span>{t('about.card')}</span>
          </div>
        </div>
      </div>
    </section>
  )
} 

// test change
