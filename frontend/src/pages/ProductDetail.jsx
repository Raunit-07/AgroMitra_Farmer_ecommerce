import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/mongoClient';
import { useLanguage } from '../context/LanguageContext';
import '../components/landing.css';

const escapeSvgText = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getProductFallbackImage = (name = 'Product') => {
  const label = escapeSvgText(name);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#ecfdf5"/>
      <circle cx="400" cy="230" r="110" fill="#ffffff" opacity="0.9"/>
      <path d="M400 150 C455 185 465 265 400 315 C335 265 345 185 400 150Z" fill="#166534" opacity="0.82"/>
      <path d="M400 300 C440 265 490 275 535 320 C485 340 430 338 400 300Z" fill="#16a34a" opacity="0.58"/>
      <path d="M400 300 C360 265 310 275 265 320 C315 340 370 338 400 300Z" fill="#16a34a" opacity="0.58"/>
      <text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#111827">${label}</text>
      <text x="400" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="600" fill="#166534">AgroMitra Product</text>
    </svg>
  `)}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      console.log("Product ID:", id);
      console.log("Product Data:", data);
      
      if (data) {
        setProduct(data);
      } else if (error) {
        console.error("Error fetching product:", error.message);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!product) return; // Cart Logic Fix
    setAdding(true);

    try {
      const { data: userData } = await db.auth.currentUser();
      const user = userData?.user;

      if (!user) {
        alert(t('product.login_buyer'));
        return;
      }

      const { data: existingItem } = await db
        .from('cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existingItem) {
        await db
          .from('cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        await db.from('cart').insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          image: image,
        });
      }

      alert(t('product.added_cart'));
    } catch (error) {
      alert(error.message || t('product.add_failed'));
    } finally {
      setAdding(false);
    }
  }

  // Conditional Rendering Fix
  if (loading) return <div>{t('productsPage.loading')}</div>;
  if (!product) return <div className="products-empty-pro"><h2>{t('productsPage.not_found')}</h2></div>;

  const image =
    product?.image ||
    product?.image_url ||
    getProductFallbackImage(product?.name);

  return (
    <section className="products-page-pro">
      <div className="products-container-pro" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '40px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ flex: '1' }}>
            <img 
              src={image} 
              alt={product.name} 
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getProductFallbackImage(product?.name);
              }}
              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', aspectRatio: '1/1' }} 
            />
          </div>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="shop-tag" style={{ display: 'inline-block', marginBottom: '10px' }}>
              {product.category || 'Agriculture'}
            </span>
            <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '15px' }}>{product.name}</h1>
            
            <div className="shop-price" style={{ fontSize: '24px', marginBottom: '20px' }}>
              <span>₹{product.price} / {t(`common.units.${product.unit || 'piece'}`)}</span>
              <del style={{ fontSize: '16px', marginLeft: '10px' }}>₹{Number(product.price) + 100}</del>
            </div>
            
            <p style={{ color: '#4b5563', marginBottom: '25px', lineHeight: '1.6' }}>
              {product.description || t('product.default_desc')}
            </p>
            
            <p className="shop-pack" style={{ marginBottom: '30px' }}>
              {t('product.in_stock')}: {product.stock || 0}
            </p>
            
            <button 
              onClick={handleAddToCart} 
              disabled={adding}
              style={{ 
                background: '#10b981', 
                color: 'white', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                cursor: adding ? 'not-allowed' : 'pointer',
                opacity: adding ? 0.7 : 1
              }}
            >
              {adding ? t('productsPage.loading') : t('productsPage.addToCart')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/collective-buying')}
              style={{
                marginTop: '12px',
                background: '#f59e0b',
                color: '#111827',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {t('product.joinCollective')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
