import { useLanguage } from '../context/LanguageContext'
import './landing.css'

export default function Reviews() {
  const { t } = useLanguage()
  
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: t('reviews.rajesh_role'),
      text: t('reviews.rajesh_text'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    {
      name: 'Anita Devi',
      role: t('reviews.anita_role'),
      text: t('reviews.anita_text'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    {
      name: 'Suresh Patel',
      role: t('reviews.suresh_role'),
      text: t('reviews.suresh_text'),
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
  ]

  return (
    <section className="testimonials-section">
      <div className="section-head reveal-up">
        <span className="section-badge" style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>{t('reviews.title')}</span>
        <h2 style={{ fontSize: '40px', marginTop: '16px' }}>{t('reviews.subtitle')}</h2>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testi, index) => (
          <div key={testi.name} className={`testi-card reveal-up reveal-delay-${(index % 4) + 1}`}>
            <span className="testi-quote">"</span>
            <p className="testi-text">"{testi.text}"</p>
            <div className="testi-user">
              <img src={testi.image} alt={testi.name} className="testi-avatar" />
              <div>
                <strong>{testi.name}</strong>
                <span>{testi.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}