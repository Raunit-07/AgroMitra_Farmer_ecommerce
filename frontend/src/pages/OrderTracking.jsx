import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../config/api';


export default function OrderTracking() {
  const { t } = useLanguage();
  const [orderIdInput, setOrderIdInput] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/orders/track/${orderIdInput}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('tracking.id_invalid'));
      }

      // Simulate a small delay for smooth animation
      setTimeout(() => {
        setTrackingData(data);
        setLoading(false);
      }, 800);
    } catch (err) {
      setTimeout(() => {
        setError(err.message);
        setLoading(false);
      }, 500);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('tracking.expected_soon');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="order-tracking-container">
      <style>{`
        /* Styles omitted for brevity but they are kept in the actual file */
        .order-tracking-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #e8f5e9 0%, #f1f8f5 100%);
          padding: 40px 20px 80px 20px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
        }
        
        .ot-header-section {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .ot-title-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .ot-box-icon {
          width: 42px;
          height: 42px;
          background: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2e7d32;
          border: 2px solid #a5d6a7;
        }
        
        .ot-title {
          font-size: 32px;
          color: #1b5e20;
          font-weight: 800;
          margin: 0;
        }
        
        .ot-subtitle {
          color: #555;
          font-size: 16px;
          margin-bottom: 30px;
        }
        
        .ot-search-box {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 8px 8px 8px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          box-shadow: 0 10px 25px rgba(46, 125, 50, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.2);
          transition: all 0.3s;
        }
        
        .ot-search-box:focus-within {
          box-shadow: 0 10px 30px rgba(46, 125, 50, 0.2);
          border-color: #4caf50;
        }
        
        .ot-input-icon {
          color: #4caf50;
          margin-right: 12px;
        }
        
        .ot-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: #333;
          background: transparent;
        }
        
        .ot-input::placeholder {
          color: #999;
        }
        
        .ot-btn {
          background: #1b5e20;
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .ot-btn:hover {
          background: #2e7d32;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
        }
        
        .ot-secure-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #2e7d32;
          font-size: 14px;
          margin-top: 20px;
          font-weight: 500;
        }
        
        .ot-loading, .ot-error {
          text-align: center;
          margin: 40px auto;
          max-width: 600px;
          padding: 30px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        
        .ot-error {
          color: #d32f2f;
          border-left: 4px solid #d32f2f;
        }
        
        .ot-shimmer {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ot-results {
          max-width: 1000px;
          margin: 0 auto;
          animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .ot-stepper-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        
        .ot-progress-line-bg {
          position: absolute;
          top: 60px;
          left: 10%;
          right: 10%;
          height: 3px;
          background: #eee;
          z-index: 1;
        }
        
        .ot-progress-line-fill {
          position: absolute;
          top: 60px;
          left: 10%;
          height: 3px;
          background: #4caf50;
          z-index: 2;
          transition: width 1s ease-in-out;
        }
        
        .ot-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
          width: 20%;
        }
        
        .ot-step-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          border: 3px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: all 0.3s;
          color: #aaa;
        }
        
        .ot-step.active .ot-step-icon {
          border-color: #4caf50;
          color: #4caf50;
          background: #e8f5e9;
        }
        
        .ot-step.completed .ot-step-icon {
          background: #4caf50;
          border-color: #4caf50;
          color: white;
        }
        
        .ot-step-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          font-size: 15px;
        }
        
        .ot-step-date {
          font-size: 13px;
          color: #777;
        }
        
        .ot-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .ot-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        
        .ot-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1b5e20;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .ot-product-info {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px dashed #eee;
        }
        
        .ot-product-img {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          background: #f9f9f9;
          object-fit: contain;
          border: 1px solid #eee;
        }
        
        .ot-product-details h4 {
          margin: 0 0 4px 0;
          font-size: 17px;
          color: #333;
        }
        
        .ot-seller {
          color: #666;
          font-size: 14px;
          margin-bottom: 12px;
        }
        
        .ot-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .ot-meta-item label {
          display: block;
          color: #888;
          font-size: 13px;
          margin-bottom: 4px;
        }
        
        .ot-meta-item span {
          font-weight: 600;
          color: #333;
          font-size: 15px;
        }
        
        .ot-address-section {
          margin-top: 24px;
        }
        
        .ot-address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .ot-address-header h4 {
          margin: 0;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .ot-address-box {
          color: #555;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ot-address-box strong {
          color: #333;
          display: block;
          margin-bottom: 4px;
        }
        
        .ot-timeline-list {
          position: relative;
          padding-left: 30px;
        }
        
        .ot-timeline-list::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 10px;
          bottom: 20px;
          width: 2px;
          background: #eee;
        }
        
        .ot-timeline-item {
          position: relative;
          margin-bottom: 24px;
        }
        
        .ot-timeline-item:last-child {
          margin-bottom: 0;
        }
        
        .ot-timeline-dot {
          position: absolute;
          left: -30px;
          top: 2px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        
        .ot-timeline-item.completed .ot-timeline-dot {
          background: #4caf50;
          border-color: #4caf50;
          color: white;
        }
        
        .ot-timeline-content {
          display: flex;
          justify-content: space-between;
        }
        
        .ot-timeline-text h5 {
          margin: 0 0 4px 0;
          font-size: 15px;
          color: #333;
        }
        
        .ot-timeline-item:not(.completed) .ot-timeline-text h5 {
          color: #999;
        }
        
        .ot-timeline-text p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
        
        .ot-timeline-time {
          text-align: right;
        }
        
        .ot-timeline-time div:first-child {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        
        .ot-timeline-time div:last-child {
          font-size: 12px;
          color: #888;
        }
        
        .ot-info-footer {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          margin-bottom: 30px;
        }
        
        .ot-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          border-right: 1px solid #eee;
        }
        
        .ot-info-item:last-child {
          border-right: none;
        }
        
        .ot-info-icon {
          width: 40px;
          height: 40px;
          background: #e8f5e9;
          color: #4caf50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ot-info-text strong {
          display: block;
          font-size: 14px;
          color: #333;
        }
        
        .ot-info-text span {
          font-size: 12px;
          color: #777;
        }
        
        .ot-greeting {
          text-align: center;
          color: #2e7d32;
          font-weight: 500;
          font-size: 15px;
        }
        
        @media (max-width: 900px) {
          .ot-grid { grid-template-columns: 1fr; }
          .ot-info-footer { grid-template-columns: 1fr 1fr; gap: 20px; row-gap: 20px; }
          .ot-info-item { border-right: none; }
        }
        
        @media (max-width: 600px) {
          .ot-stepper-card { padding: 20px 10px; }
          .ot-step-label { font-size: 11px; text-align: center; }
          .ot-step-date { display: none; }
          .ot-info-footer { grid-template-columns: 1fr; }
          .ot-search-box { flex-direction: column; border-radius: 20px; padding: 12px; }
          .ot-input { width: 100%; margin-bottom: 12px; padding: 8px; }
          .ot-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Header Search Section */}
      <div className="ot-header-section">
        <div className="ot-title-wrap">
          <div className="ot-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="ot-title">{t('navbar.trackOrder')}</h1>
        </div>
        <p className="ot-subtitle">{t('tracking.subtitle')}</p>
        
        <form onSubmit={handleTrackOrder} className="ot-search-box">
          <div className="ot-input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <input 
            type="text" 
            className="ot-input"
            placeholder={t('tracking.id_placeholder')} 
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
          />
          <button type="submit" className="ot-btn" disabled={loading}>
            {loading ? t('tracking.loading_btn') : t('navbar.trackOrder')} 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </form>
        
        <div className="ot-secure-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
          {t('tracking.secure')}
        </div>
      </div>

      {loading && (
        <div className="ot-loading">
          <div className="ot-box-icon ot-shimmer" style={{ margin: '0 auto 16px auto', background: '#4caf50', color: 'white' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <h3 style={{ color: '#2e7d32' }}>{t('tracking.fetching')}</h3>
          <p style={{ color: '#666' }}>{t('tracking.fetching_p')}</p>
        </div>
      )}

      {error && (
        <div className="ot-error">
          <h3>{t('tracking.error_title')}</h3>
          <p>{error}</p>
        </div>
      )}

      {trackingData && !loading && (
        <div className="ot-results">
          <div className="ot-stepper-card">
            <div className="ot-progress-line-bg"></div>
            <div 
              className="ot-progress-line-fill" 
              style={{ width: `${Math.max(0, (trackingData.timeline.filter(t => t.completed).length - 1) * 25)}%` }}
            ></div>
            
            {trackingData.timeline.map((step, index) => {
              const icons = {
                placed: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
                processing: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>,
                shipped: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
                out_for_delivery: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
                delivered: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              };

              return (
                <div key={step.status} className={`ot-step ${step.completed ? 'completed' : ''}`}>
                  <div className="ot-step-icon">{icons[step.status]}</div>
                  <div className="ot-step-label">{t(`orders.status.${step.status}`)}</div>
                  <div className="ot-step-date">{step.completed ? formatDate(step.date) : `${t('tracking.expected')} ${formatDate(step.date)}`}</div>
                </div>
              );
            })}
          </div>

          <div className="ot-grid">
            <div className="ot-card">
              <div className="ot-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {t('tracking.order_details')}
              </div>
              
              <div className="ot-product-info">
                <div className="ot-product-img">
                  <img src="https://ui-avatars.com/api/?name=Agro+Product&background=e8f5e9&color=2e7d32&size=100" alt="Product" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                </div>
                <div className="ot-product-details">
                  <h4>{trackingData.orderItems && trackingData.orderItems.length > 0 ? trackingData.orderItems[0].product_name : 'AgroMitra Products'}</h4>
                  <div className="ot-seller">{t('tracking.seller_verified')}</div>
                  {trackingData.orderItems && trackingData.orderItems.length > 1 && (
                    <div style={{ fontSize: 13, color: '#4caf50', fontWeight: 600 }}>+ {trackingData.orderItems.length - 1} {t('tracking.more_items')}</div>
                  )}
                </div>
              </div>

              <div className="ot-meta-grid">
                <div className="ot-meta-item">
                  <label>{t('ordersPage.orderId')}</label>
                  <span>AG{String(trackingData.orderId).padStart(6, '0')}</span>
                </div>
                <div className="ot-meta-item">
                  <label>{t('ordersPage.date')}</label>
                  <span>{formatDate(trackingData.orderDate)}</span>
                </div>
                <div className="ot-meta-item">
                  <label>{t('checkout.paymentMethod')}</label>
                  <span>{trackingData.paymentMethod}</span>
                </div>
                <div className="ot-meta-item">
                  <label>{t('common.total')}</label>
                  <span>₹{trackingData.totalAmount}</span>
                </div>
              </div>

              {trackingData.deliveryAddress && (
                <div className="ot-address-section">
                  <div className="ot-address-header">
                    <h4>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {t('checkout.deliveryAddress')}
                    </h4>
                  </div>
                  <div className="ot-address-box">
                    <strong>{trackingData.deliveryAddress.full_name}</strong>
                    {trackingData.deliveryAddress.address_line1}, {trackingData.deliveryAddress.city}<br/>
                    {trackingData.deliveryAddress.state} - {trackingData.deliveryAddress.pincode}
                  </div>
                </div>
              )}
            </div>

            <div className="ot-card">
              <div className="ot-card-title">{t('tracking.timeline')}</div>
              
              <div className="ot-timeline-list">
                {trackingData.timeline.map((step, idx) => (
                  <div key={idx} className={`ot-timeline-item ${step.completed ? 'completed' : ''}`}>
                    <div className="ot-timeline-dot">
                      {step.completed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }}></div>
                      )}
                    </div>
                    <div className="ot-timeline-content">
                      <div className="ot-timeline-text">
                        <h5>{t(`orders.status.${step.status}`)}</h5>
                        <p>{step.description || t('tracking.pending')}</p>
                      </div>
                      <div className="ot-timeline-time">
                        <div>{formatDate(step.date)}</div>
                        <div>{step.completed ? formatTime(step.date) : t('tracking.expected')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ot-info-footer">
            <div className="ot-info-item">
              <div className="ot-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
              </div>
              <div className="ot-info-text">
                <strong>{t('tracking.secure_title')}</strong>
                <span>{t('tracking.secure_p')}</span>
              </div>
            </div>
            <div className="ot-info-item">
              <div className="ot-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div className="ot-info-text">
                <strong>{t('tracking.help_title')}</strong>
                <span>{t('tracking.help_p')}</span>
              </div>
            </div>
            <div className="ot-info-item">
              <div className="ot-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div className="ot-info-text">
                <strong>{t('tracking.realtime_title')}</strong>
                <span>{t('tracking.realtime_p')}</span>
              </div>
            </div>
            <div className="ot-info-item">
              <div className="ot-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div className="ot-info-text">
                <strong>{t('tracking.reliable_title')}</strong>
                <span>{t('tracking.reliable_p')}</span>
              </div>
            </div>
          </div>

          <div className="ot-greeting">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'text-bottom' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            {t('tracking.thankyou')} 🌿
          </div>
        </div>
      )}
    </div>
  );
}
