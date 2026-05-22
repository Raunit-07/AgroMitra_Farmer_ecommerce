import { useEffect, useState } from 'react'
import './landing.css'

export default function Preloader({ children }) {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1400)
    const timer2 = setTimeout(() => setLoading(false), 1800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  if (loading) {
    return (
      <div className={`preloader ${fadeOut ? 'fade-out' : ''}`}>
        
        {/* Logo */}
        <div className="preloader-logo">
          🌾
        </div>

        {/* Spinner */}
        <div className="preloader-spinner"></div>

        {/* Text */}
        <h1>AgroMitra</h1>
        <p>Loading fresh farming marketplace...</p>

      </div>
    )
  }

  return children
}