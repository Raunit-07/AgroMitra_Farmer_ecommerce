// // import { Link, useNavigate } from 'react-router-dom'
// // import { useState, useEffect } from 'react'
// // import { db } from '../lib/mongoClient'
// // import { sendRegisterOtp, verifyRegisterOtp, verifyGst } from '../services/registerOtpService'
// // import { validateEmail, normalizeEmail } from '../utils/authUtils'
// // import { useLanguage } from '../context/LanguageContext'
// // import '../components/landing.css'

// // const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

// // export default function Register() {
// //   const navigate = useNavigate()
// //   const { t } = useLanguage()

// //   // step can be: 'register', 'otp'
// //   const [step, setStep] = useState('register')
// //   const [otp, setOtp] = useState('')
// //   const [gstData, setGstData] = useState(null)

// //   const [formData, setFormData] = useState({
// //     full_name: '',
// //     email: '',
// //     password: '',
// //     phone: '',
// //     role: 'buyer',
// //     gst_number: '',
// //   })

// //   const [showPassword, setShowPassword] = useState(false)
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState('')
// //   const [success, setSuccess] = useState('')

// //   // UI Feedback for email validation
// //   const isEmailValid = formData.email ? validateEmail(formData.email) : true;

// //   function handleChange(event) {
// //     const { name, value } = event.target
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }))
// //   }

// //   async function handleInitialSubmit(e) {
// //     e.preventDefault()
// //     if (loading) return;

// //     // 1. Validation
// //     const normalizedEmail = normalizeEmail(formData.email);
// //     if (!validateEmail(normalizedEmail)) {
// //       setError(t('auth.error_invalid_email'));
// //       return;
// //     }

// //     if (formData.password.length < 6) {
// //       setError(t('auth.error_password_length'));
// //       return;
// //     }

// //     setLoading(true)
// //     setError('')
// //     setSuccess('')

// //     try {
// //       const dbRole = formData.role === 'seller' ? 'farmer' : formData.role;

// //       if (formData.role === 'seller') {
// //         if (!GST_REGEX.test(formData.gst_number)) {
// //           throw new Error(t('auth.error_gst_format'))
// //         }
// //         const gstResult = await verifyGst({ gst_number: formData.gst_number })
// //         if (!gstResult.gst_verified) throw new Error(gstResult.message || 'GST verification failed.')
        
// //         setGstData({
// //           gst_number: formData.gst_number,
// //           gst_verified: gstResult.gst_verified,
// //           business_name: gstResult.business_name,
// //         })
// //       }

// //       // Check if we should use backend OTP flow
// //       const useBackendOtp = import.meta.env.VITE_USE_BACKEND_OTP === 'true';

// //       if (useBackendOtp) {
// //         console.log("USING BACKEND OTP FLOW");
// //         await sendRegisterOtp({ email: normalizedEmail });
// //         setSuccess(t('auth.success_register_email'));
// //         setStep('otp');
// //         return;
// //       }

// //       // 2. Fallback: db Sign Up
// //       const payload = {
// //         email: normalizedEmail,
// //         password: formData.password,
// //         options: {
// //           data: {
// //             full_name: formData.full_name,
// //             phone: formData.phone,
// //             role: dbRole
// //           }
// //         }
// //       };
      
// //       console.log("ATTEMPTING db SIGNUP:", payload);

// //       const { data: authData, error: authError } = await db.auth.register(payload);

// //       if (authError) throw authError;

// //       const user = authData.user;
// //       if (!user) throw new Error("Registration failed. No user returned.");

// //       // 3. Profiles Table Sync (Unified Roles Support)
// //       const { data: existingProfile } = await db
// //         .from('profiles')
// //         .select('role')
// //         .eq('id', user.id)
// //         .maybeSingle();

// //       let finalRole = dbRole;
// //       if (existingProfile && existingProfile.role) {
// //         const currentRole = existingProfile.role.toLowerCase();
// //         if ((currentRole === "buyer" && dbRole === "farmer") || 
// //             (currentRole === "farmer" && dbRole === "buyer") ||
// //             currentRole === "both") {
// //           finalRole = "both";
// //         }
// //       }

// //       const { error: profileError } = await db
// //         .from('profiles')
// //         .upsert({
// //           id: user.id,
// //           email: user.email,
// //           full_name: formData.full_name,
// //           phone: formData.phone,
// //           role: finalRole,
// //           gst_number: formData.role === 'seller' ? formData.gst_number : null,
// //           business_name: formData.role === 'seller' ? (gstData?.business_name || '') : null,
// //           updated_at: new Date().toISOString()
// //         });

// //       if (profileError) console.error("Profile sync error:", profileError);

// //       setSuccess(t('auth.success_register_email'));
      
// //       setTimeout(() => {
// //         navigate(formData.role === 'buyer' ? '/buyer-login' : '/seller-login');
// //       }, 3500);

// //     } catch (err) {
// //       console.error("SIGNUP EXCEPTION:", err);
// //       let errMsg = err.message || 'Registration failed.';
      
// //       if (err.message?.includes('Failed to fetch')) {
// //         errMsg = "Connection failed. Please check if backend is running and db URL is correct.";
// //       }

// //       setError(errMsg);
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   async function handleOtpSubmit(e) {
// //     e.preventDefault();
// //     if (loading) return;

// //     setLoading(true);
// //     setError('');
// //     setSuccess('');

// //     try {
// //       const dbRole = formData.role === 'seller' ? 'farmer' : formData.role;
// //       const payload = {
// //         ...formData,
// //         role: dbRole,
// //         email: normalizeEmail(formData.email),
// //         otp,
// //         gst_verified: gstData?.gst_verified || false,
// //         business_name: gstData?.business_name || null
// //       };

// //       console.log("VERIFYING OTP WITH PAYLOAD:", payload);
// //       await verifyRegisterOtp(payload);

// //       setSuccess(t('auth.success_register_redirect'));
      
// //       setTimeout(() => {
// //         navigate(formData.role === 'buyer' ? '/buyer-login' : '/seller-login');
// //       }, 2500);

// //     } catch (err) {
// //       console.error("OTP VERIFICATION ERROR:", err);
// //       setError(err.message || 'OTP verification failed.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   // Reachability test on mount
// //   useEffect(() => {
// //     async function testMongoDB() {
// //       console.log("TESTING db REACHABILITY...");
// //       const { data, error } = await db.from("profiles").select("id").limit(1);
// //       if (error) {
// //         console.error("db REACHABILITY TEST FAILED:", error);
// //       } else {
// //         console.log("db IS REACHABLE. Test success.");
// //       }
// //     }
// //     testMongoDB();
// //   }, []);

// //   return (
// //     <section className="register-page">
// //       <div className="register-layout">
// //         <div className="register-visual">
// //           <img
// //             src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
// //             alt="Register"
// //             className="register-image"
// //           />

// //           <div className="register-overlay" />

// //           <div className="register-visual-content">
// //             <span className="register-badge">{t('auth.join')}</span>
// //             <h1>{t('auth.visual_title')}</h1>
// //             <p>
// //               {t('auth.visual_p')}
// //             </p>

// //             <div className="register-highlights">
// //               <div className="register-highlight-card">
// //                 <h3>{t('auth.buyer_access')}</h3>
// //                 <p>{t('auth.buyer_access_p')}</p>
// //               </div>

// //               <div className="register-highlight-card">
// //                 <h3>{t('auth.seller_access')}</h3>
// //                 <p>{t('auth.seller_access_p')}</p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="register-form-side">
// //           <div className="register-card">
// //             <div className="register-top">
// //               <div className="register-icon">✨</div>

// //               <span className="register-small-badge">
// //                 {step === 'register' ? t('auth.createAccount') : t('auth.otp_title')}
// //               </span>

// //               <h2>
// //                 {step === 'register' ? t('auth.register') : t('auth.otp_title')}
// //               </h2>

// //               <p>
// //                 {t('auth.registerSubtitle')}
// //               </p>
// //             </div>

// //             {error ? <div className="register-error">{typeof error === 'string' ? error : JSON.stringify(error)}</div> : null}
// //             {success ? <div className="register-success">{success}</div> : null}

// //             {step === 'register' ? (
// //               <form onSubmit={handleInitialSubmit} className="register-form">
// //                 <div className="register-form-group">
// //                   <label>{t('auth.fullName')}</label>
// //                   <input
// //                     type="text"
// //                     name="full_name"
// //                     placeholder={t('auth.fullName')}
// //                     value={formData.full_name}
// //                     onChange={handleChange}
// //                     required
// //                   />
// //                 </div>

// //                 <div className="register-grid-two">
// //                   <div className="register-form-group">
// //                     <label>{t('auth.email')}</label>
// //                     <input
// //                       type="email"
// //                       name="email"
// //                       placeholder="you@example.com"
// //                       value={formData.email}
// //                       onChange={handleChange}
// //                       required
// //                     />
// //                   </div>

// //                   <div className="register-form-group">
// //                     <label>{t('auth.phone')}</label>
// //                     <input
// //                       type="text"
// //                       name="phone"
// //                       placeholder={t('auth.phone')}
// //                       value={formData.phone}
// //                       onChange={handleChange}
// //                       required
// //                     />
// //                   </div>
// //                 </div>

// //                 <div className="register-grid-two">
// //                   <div className="register-form-group">
// //                     <label>{t('auth.password')}</label>
// //                     <div className="register-password-field">
// //                       <input
// //                         type={showPassword ? 'text' : 'password'}
// //                         name="password"
// //                         placeholder={t('auth.password')}
// //                         value={formData.password}
// //                         onChange={handleChange}
// //                         required
// //                       />
// //                       <button
// //                         type="button"
// //                         className="register-password-toggle"
// //                         onClick={() => setShowPassword((prev) => !prev)}
// //                       >
// //                         {showPassword ? t('auth.hide') : t('auth.show')}
// //                       </button>
// //                     </div>
// //                   </div>

// //                   <div className="register-form-group">
// //                     <label>{t('auth.role')}</label>
// //                     <select
// //                       name="role"
// //                       value={formData.role}
// //                       onChange={handleChange}
// //                       required
// //                     >
// //                       <option value="buyer">{t('auth.buyerLogin')}</option>
// //                       <option value="seller">{t('auth.sellerLogin')}</option>
// //                     </select>
// //                   </div>
// //                 </div>

// //                 {formData.role === 'seller' && (
// //                   <div className="register-form-group">
// //                     <label>{t('auth.gst')}</label>
// //                     <input
// //                       type="text"
// //                       name="gst_number"
// //                       placeholder="e.g. 22AAAAA0000A1Z5"
// //                       value={formData.gst_number}
// //                       maxLength="15"
// //                       onChange={(e) => {
// //                         const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '')
// //                         handleChange({ target: { name: 'gst_number', value: val } })
// //                       }}
// //                       required
// //                     />
// //                   </div>
// //                 )}

// //                 <button type="submit" className="register-btn-main" disabled={loading}>
// //                   {loading ? (
// //                     <div className="btn-loader-wrapper">
// //                       <div className="spinner mini"></div>
// //                       <span>{t('auth.registering')}</span>
// //                     </div>
// //                   ) : (
// //                     t('auth.createAccount')
// //                   )}
// //                 </button>
// //               </form>
// //             ) : (
// //               <form onSubmit={handleOtpSubmit} className="register-form">
// //                 <div className="register-form-group">
// //                   <label>{t('auth.otp_label')}</label>
// //                   <input
// //                     type="text"
// //                     placeholder="000000"
// //                     value={otp}
// //                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
// //                     className="otp-input-field"
// //                     required
// //                   />
// //                   <small style={{ color: '#64748b', marginTop: '8px', display: 'block' }}>
// //                     {t('auth.otp_sent')} {formData.email}
// //                   </small>
// //                 </div>

// //                 <button type="submit" className="register-btn-main" disabled={loading}>
// //                   {loading ? (
// //                     <div className="btn-loader-wrapper">
// //                       <div className="spinner mini"></div>
// //                       <span>{t('auth.verifying')}</span>
// //                     </div>
// //                   ) : (
// //                     t('auth.verify_btn')
// //                   )}
// //                 </button>

// //                 <button 
// //                   type="button" 
// //                   className="resend-otp-btn" 
// //                   onClick={handleInitialSubmit}
// //                   style={{ 
// //                     background: 'none', 
// //                     border: 'none', 
// //                     color: '#10b981', 
// //                     cursor: 'pointer', 
// //                     marginTop: '15px',
// //                     fontSize: '14px',
// //                     fontWeight: '500'
// //                   }}
// //                 >
// //                   {t('auth.resend_otp')}
// //                 </button>
// //               </form>
// //             )}

// //             <div className="register-bottom">
// //               <p>
// //                 {t('auth.haveAccount')}{' '}
// //                 <Link to="/buyer-login">{t('auth.buyerLogin')}</Link> /{' '}
// //                 <Link to="/seller-login">{t('auth.sellerLogin')}</Link>
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   )
// // }


// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { validateEmail, normalizeEmail } from "../utils/authUtils";
// import { useLanguage } from "../context/LanguageContext";
// import "../components/landing.css";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// const GST_REGEX =
//   /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// export default function Register() {
//   const navigate = useNavigate();
//   const { t } = useLanguage();

//   const [formData, setFormData] = useState({
//     full_name: "",
//     email: "",
//     password: "",
//     phone: "",
//     role: "buyer",
//     gst_number: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   function handleChange(event) {
//     const { name, value } = event.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }

//   async function handleInitialSubmit(e) {
//     e.preventDefault();

//     if (loading) return;

//     const normalizedEmail = normalizeEmail(formData.email);

//     if (!validateEmail(normalizedEmail)) {
//       setError(t("auth.error_invalid_email") || "Invalid email address");
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError(
//         t("auth.error_password_length") ||
//           "Password must be at least 6 characters"
//       );
//       return;
//     }

//     if (formData.role === "seller" && !GST_REGEX.test(formData.gst_number)) {
//       setError(t("auth.error_gst_format") || "Invalid GST number format");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//       const dbRole = formData.role === "seller" ? "farmer" : "buyer";

//       const res = await fetch(`${API_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           full_name: formData.full_name,
//           name: formData.full_name,
//           email: normalizedEmail,
//           password: formData.password,
//           phone: formData.phone,
//           role: dbRole,
//           gst_number: formData.role === "seller" ? formData.gst_number : null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Registration failed");
//       }

//       setSuccess(
//         "Registration successful. Please check your email and confirm your account before login."
//       );

//       setTimeout(() => {
//         navigate(formData.role === "seller" ? "/seller-login" : "/buyer-login");
//       }, 2500);
//     } catch (err) {
//       setError(err.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <section className="register-page">
//       <div className="register-layout">
//         <div className="register-visual">
//           <img
//             src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
//             alt="Register"
//             className="register-image"
//           />

//           <div className="register-overlay" />

//           <div className="register-visual-content">
//             <span className="register-badge">{t("auth.join")}</span>
//             <h1>{t("auth.visual_title")}</h1>
//             <p>{t("auth.visual_p")}</p>

//             <div className="register-highlights">
//               <div className="register-highlight-card">
//                 <h3>{t("auth.buyer_access")}</h3>
//                 <p>{t("auth.buyer_access_p")}</p>
//               </div>

//               <div className="register-highlight-card">
//                 <h3>{t("auth.seller_access")}</h3>
//                 <p>{t("auth.seller_access_p")}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="register-form-side">
//           <div className="register-card">
//             <div className="register-top">
//               <div className="register-icon">✨</div>

//               <span className="register-small-badge">
//                 {t("auth.createAccount")}
//               </span>

//               <h2>{t("auth.register")}</h2>

//               <p>{t("auth.registerSubtitle")}</p>
//             </div>

//             {error ? <div className="register-error">{error}</div> : null}

//             {success ? <div className="register-success">{success}</div> : null}

//             <form onSubmit={handleInitialSubmit} className="register-form">
//               <div className="register-form-group">
//                 <label>{t("auth.fullName")}</label>
//                 <input
//                   type="text"
//                   name="full_name"
//                   placeholder={t("auth.fullName")}
//                   value={formData.full_name}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               <div className="register-grid-two">
//                 <div className="register-form-group">
//                   <label>{t("auth.email")}</label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="you@example.com"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="register-form-group">
//                   <label>{t("auth.phone")}</label>
//                   <input
//                     type="text"
//                     name="phone"
//                     placeholder={t("auth.phone")}
//                     value={formData.phone}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="register-grid-two">
//                 <div className="register-form-group">
//                   <label>{t("auth.password")}</label>

//                   <div className="register-password-field">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       placeholder={t("auth.password")}
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                     />

//                     <button
//                       type="button"
//                       className="register-password-toggle"
//                       onClick={() => setShowPassword((prev) => !prev)}
//                     >
//                       {showPassword ? t("auth.hide") : t("auth.show")}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="register-form-group">
//                   <label>{t("auth.role")}</label>

//                   <select
//                     name="role"
//                     value={formData.role}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="buyer">{t("auth.buyerLogin")}</option>
//                     <option value="seller">{t("auth.sellerLogin")}</option>
//                   </select>
//                 </div>
//               </div>

//               {formData.role === "seller" && (
//                 <div className="register-form-group">
//                   <label>{t("auth.gst")}</label>

//                   <input
//                     type="text"
//                     name="gst_number"
//                     placeholder="e.g. 22AAAAA0000A1Z5"
//                     value={formData.gst_number}
//                     maxLength="15"
//                     onChange={(e) => {
//                       const val = e.target.value
//                         .toUpperCase()
//                         .replace(/[^0-9A-Z]/g, "");

//                       handleChange({
//                         target: {
//                           name: "gst_number",
//                           value: val,
//                         },
//                       });
//                     }}
//                     required
//                   />
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="register-btn-main"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <div className="btn-loader-wrapper">
//                     <div className="spinner mini"></div>
//                     <span>{t("auth.registering")}</span>
//                   </div>
//                 ) : (
//                   t("auth.createAccount")
//                 )}
//               </button>
//             </form>

//             <div className="register-bottom">
//               <p>
//                 {t("auth.haveAccount")}{" "}
//                 <Link to="/buyer-login">{t("auth.buyerLogin")}</Link> /{" "}
//                 <Link to="/seller-login">{t("auth.sellerLogin")}</Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../lib/mongoClient";
import { validateEmail, normalizeEmail } from "../utils/authUtils";
import { useLanguage } from "../context/LanguageContext";
import "../components/landing.css";

const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "buyer",
    gst_number: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function safeText(key, fallback) {
    return t(key) || fallback;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const normalizedEmail = normalizeEmail(formData.email);

    if (!formData.full_name.trim()) return "Full name is required";

    if (!validateEmail(normalizedEmail)) {
      return "Invalid email address";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      return "Phone number is required";
    }

    if (formData.role === "seller" && !GST_REGEX.test(formData.gst_number)) {
      return "Invalid GST number format";
    }

    return "";
  }

  async function handleInitialSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const normalizedEmail = normalizeEmail(formData.email);

      const backendRole = formData.role === "seller" ? "farmer" : "buyer";

      const { error: registerError } = await db.auth.register({
        full_name: formData.full_name.trim(),
        name: formData.full_name.trim(),
        email: normalizedEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        role: backendRole,
        gst_number:
          formData.role === "seller"
            ? formData.gst_number.trim().toUpperCase()
            : null,
      });

      if (registerError) {
        throw registerError;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setSuccess("Registration successful. Confirmation email has been sent.");

      setTimeout(() => {
        navigate(formData.role === "seller" ? "/seller-login" : "/buyer-login");
      }, 1000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="register-page">
      <div className="register-layout">
        <div className="register-visual">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
            alt="AgroMitra registration"
            className="register-image"
          />
          <div className="register-overlay" />

          <div className="register-visual-content">
            <span className="register-badge">Join AgroMitra</span>
            <h1>Start buying and selling with confidence</h1>
            <p>
              Create your AgroMitra account to explore products as a buyer or manage and sell
              agricultural inventory as a seller.
            </p>

            <div className="register-highlights">
              <div className="register-highlight-card">
                <h3>Buyer Access</h3>
                <p>Explore products, manage your cart, and shop smarter.</p>
              </div>

              <div className="register-highlight-card">
                <h3>Seller Access</h3>
                <p>List products, reach buyers faster, and grow online.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-form-side">
          <div className="register-card">
            <div className="register-top">
              <div className="register-icon">✨</div>
              <span className="register-small-badge">Create Account</span>
              <h2>Register</h2>
              <p>Create your AgroMitra account and continue your journey.</p>
            </div>

            {error && <div className="register-error">{error}</div>}
            {success && <div className="register-success">{success}</div>}

            <form onSubmit={handleInitialSubmit} className="register-form">
                <div className="register-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-grid-two">
                  <div className="register-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="register-form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="register-grid-two">
                  <div className="register-form-group">
                    <label>Password</label>
                    <div className="register-password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="register-password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="register-form-group">
                    <label>Register As</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="buyer">Buyer Login</option>
                      <option value="seller">Seller Login</option>
                    </select>
                  </div>
                </div>

                {formData.role === "seller" && (
                  <div className="register-form-group">
                    <label>GST Number</label>
                    <input
                      type="text"
                      name="gst_number"
                      value={formData.gst_number}
                      maxLength="15"
                      onChange={(e) => {
                        const value = e.target.value
                          .toUpperCase()
                          .replace(/[^0-9A-Z]/g, "");

                        handleChange({
                          target: { name: "gst_number", value },
                        });
                      }}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="register-btn-main" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

            <div className="register-bottom">
              <p>
                Already have account?{" "}
                <Link to="/buyer-login">Buyer Login</Link> /{" "}
                <Link to="/seller-login">Seller Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
