import { useLanguage } from '../context/LanguageContext'
import './landing.css'

export default function Features() {
  const { t } = useLanguage()
  
  const features = [
    {
      icon: '🛒',
      title: t('features.f1Title'),
      description: t('features.f1Desc'),
    },
    {
      icon: '🤝',
      title: t('features.f2Title'),
      description: t('features.f2Desc'),
    },
    {
      icon: '📊',
      title: t('features.f3Title'),
      description: t('features.f3Desc'),
    },
  ]

  return (
    <section className="why-choose-section">
      <div className="section-head reveal-up">
        <span className="section-badge" style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>{t('features.title')}</span>
        <h2 style={{ fontSize: '40px', marginTop: '16px' }}>{t('features.title')}</h2>
      </div>

      <div className="why-choose-grid">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`why-card reveal-up reveal-delay-${(index % 4) + 1}`}
          >
            <div className="why-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}