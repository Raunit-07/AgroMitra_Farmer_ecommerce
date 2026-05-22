import React, { useState, useRef } from "react";
import { db } from "../lib/mongoClient";
import { useTranslation } from 'react-i18next';
import "./AddProduct.css";

const AddProduct = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    unit: "piece",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setStatus({ type: "error", message: "Please select a valid image file." });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus({ type: "", message: "" });
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !imageFile) {
      setStatus({ type: "error", message: "Product name, price, and image are required." });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      // 1. Upload Image to db Storage
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await db.storage.bucket("seller_product")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = db.storage.bucket("seller_product")
        .getPublicUrl(filePath);

      // 3. Direct db Insert (Recommended Fix for 401)
      const { data: userData } = await db.auth.currentUser();
      const user = userData?.user || JSON.parse(localStorage.getItem("user"));
      
      const generateSlug = (name) => {
        return name
          .toLowerCase()
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-") + "-" + Date.now().toString(36);
      };
      
      const productPayload = {
        farmer_id: user?.id,
        seller_id: user?.id, // Keep both for safety
        name: formData.name,
        slug: generateSlug(formData.name),
        price: parseFloat(formData.price),
        description: formData.description,
        unit: formData.unit || "piece",
        image: publicUrl,
        image_url: publicUrl, // Duplicate column sync
        category: "seeds", 
        stock: 50, 
        stock_quantity: 50, // Duplicate column sync
        is_active: true,
        is_approved: true, // Auto-approve
      };

      console.log("ADDING PRODUCT (AddProduct):", productPayload);

      const { data: newProduct, error: dbError } = await db
        .from("products")
        .insert([productPayload])
        .select()
        .single();

      if (dbError) throw dbError;

      console.log("ADDED PRODUCT (AddProduct):", newProduct);

      // Success!
      setStatus({ type: "success", message: t('addProduct.successMsg') });
      setFormData({ name: "", price: "", description: "", unit: "piece" });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      console.error("Error adding product:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to add product. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <header className="add-product-header">
          <h1>{t('addProduct.title')}</h1>
          <p>List your agricultural produce on AgroMitra</p>
        </header>

        {status.message && (
          <div className={`status-msg ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="name">{t('addProduct.nameLabel')}</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder={t('addProduct.namePlaceholder')}
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">{t('addProduct.priceLabel')}</label>
            <input
              type="number"
              id="price"
              name="price"
              placeholder={t('addProduct.pricePlaceholder')}
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              required
            >
              <option value="kg">kg</option>
              <option value="gram">gram</option>
              <option value="litre">litre</option>
              <option value="piece">piece</option>
              <option value="packet">packet</option>
              <option value="bag">bag</option>
              <option value="box">box</option>
              <option value="dozen">dozen</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('addProduct.descLabel')}</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder={t('addProduct.descPlaceholder')}
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label>{t('addProduct.imageLabel')}</label>
            <div
              className={`image-upload-zone ${imagePreview ? 'has-preview' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                hidden
              />

              {imagePreview ? (
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" className="remove-image-btn" onClick={removeImage}>
                    &times;
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📸</span>
                  <p>Click to upload product image</p>
                  <span>PNG, JPG or WebP (Max. 5MB)</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {t('addProduct.loadingBtn')}
              </>
            ) : (
              t('addProduct.submitBtn')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
