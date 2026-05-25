import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../lib/mongoClient";
import { useLanguage } from "../context/LanguageContext";
import "../components/landing.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80";

export default function Cart() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCart();

    function handleCartUpdated() {
      fetchCart();
    }

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const getCartProduct = (item) => {
    return item.products || item.productId || item.product || {};
  };

  const getItemId = (item) => {
    return item.id || item._id;
  };

  const getProductName = (item) => {
    const product = getCartProduct(item);
    return (
      item.product_name ||
      product.name ||
      product.title ||
      item.name ||
      item.title ||
      t("product.fallbackName")
    );
  };

  const getProductDescription = (item) => {
    const product = getCartProduct(item);
    return (
      item.description ||
      product.description ||
      product.category ||
      t("product.freshDescription")
    );
  };

  const getProductImage = (item) => {
    const product = getCartProduct(item);
    return (
      item.image ||
      item.image_url ||
      product.image ||
      product.image_url ||
      product.photo ||
      FALLBACK_IMAGE
    );
  };

  const getProductPrice = (item) => {
    const product = getCartProduct(item);
    return Number(
      item.price ||
        item.selling_price ||
        product.price ||
        product.selling_price ||
        product.discounted_price ||
        0
    );
  };

  const getProductStock = (item) => {
    const product = getCartProduct(item);
    return Number(product.stock ?? product.stock_quantity ?? 0);
  };

  async function fetchCart() {
    setLoading(true);
    setMessage("");

    const { data: userData } = await db.auth.currentUser();
    const currentUser = userData?.user;

    if (!currentUser) {
      setMessage(t("cartPage.loginRequired"));
      setItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await db
      .from("cart")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  async function updateQuantity(cartId, currentQty, type) {
    const newQty = type === "inc" ? Number(currentQty) + 1 : Number(currentQty) - 1;

    if (newQty < 1) return;

    const { error } = await db
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", cartId);

    if (error) {
      alert(error.message);
      return;
    }

    window.dispatchEvent(new Event("cartUpdated"));
  }

  async function removeItem(cartId) {
    const { error } = await db.from("cart").delete().eq("id", cartId);

    if (error) {
      alert(error.message);
      return;
    }

    window.dispatchEvent(new Event("cartUpdated"));
  }

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = getProductPrice(item);
      const quantity = Number(item.quantity || 1);
      return sum + price * quantity;
    }, 0);
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  }, [items]);

  if (loading) {
    return <div className="cart-loading">{t("cartPage.loading")}</div>;
  }

  return (
    <section className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <span>{t("cartPage.badge")}</span>
          <h1>{t("cartPage.title") || "Your Cart"}</h1>
          <p>{t("cartPage.subtitle")}</p>
        </div>

        {message && <div className="cart-message">{message}</div>}

        {items.length === 0 ? (
          <div className="cart-empty">
            <h2>{t("cartPage.empty") || "Your cart is empty"}</h2>
            <p>{t("cartPage.emptyText")}</p>
            <Link to="/products">{t("orders.explore")}</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {items.map((item) => {
                const cartId = getItemId(item);
                const quantity = Number(item.quantity || 1);
                const price = getProductPrice(item);
                const stock = getProductStock(item);
                const subtotal = price * quantity;

                return (
                  <div className="cart-item-card" key={cartId}>
                    <img src={getProductImage(item)} alt={getProductName(item)} />

                    <div className="cart-item-info">
                      <h3>{getProductName(item)}</h3>
                      <p>{getProductDescription(item)}</p>

                      <div className="cart-price-row">
                        <strong>₹{price}</strong>
                        <span>/ {t("product.unit").toLowerCase()}</span>
                      </div>

                      <p className="checkout-stock-warn">
                        {t("product.in_stock")}: {stock}
                      </p>

                      <div className="cart-quantity-row">
                        <button onClick={() => updateQuantity(cartId, quantity, "dec")}>
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          onClick={() => updateQuantity(cartId, quantity, "inc")}
                          disabled={quantity >= stock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      <p>{t("cartPage.subtotal")}</p>
                      <h3>₹{subtotal}</h3>

                      <button onClick={() => removeItem(cartId)}>
                        {t("cartPage.remove") || "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h2>{t("cartPage.summary")}</h2>

              <div className="summary-row">
                <span>{t("cartPage.totalItems")}</span>
                <strong>{items.length}</strong>
              </div>

              <div className="summary-row">
                <span>{t("cartPage.totalQuantity")}</span>
                <strong>{totalQuantity}</strong>
              </div>

              <div className="summary-row total">
                <span>{t("cartPage.total") || "Total"}</span>
                <strong>₹{totalAmount}</strong>
              </div>

              <button className="checkout-btn" onClick={() => navigate("/checkout")}>
                {t("cartPage.checkoutBtn") || "Proceed to Checkout"}
              </button>

              <Link to="/products" className="continue-shopping">
                {t("cartPage.continueShopping")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
