// import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { Mail, Lock, Eye, EyeOff, Leaf, ShieldCheck } from 'lucide-react'

// export default function Login() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     remember: false,
//   })

//   function handleChange(e) {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }))
//   }

//   function handleSubmit(e) {
//     e.preventDefault()
    
//   }

//   return (
//     <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden border border-green-100">
//         <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 text-white relative">
//           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

//           <div className="relative z-10">
//             <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6">
//               <Leaf size={30} />
//             </div>

//             <h2 className="text-4xl font-bold leading-tight mb-4">
//               Welcome back to AgroMitra
//             </h2>

//             <p className="text-green-50/90 text-lg leading-8 max-w-md">
//               Manage your farming marketplace with a clean and reliable platform
//               built for modern agriculture.
//             </p>
//           </div>

//           <div className="relative z-10 space-y-4">
//             <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
//               <ShieldCheck className="mt-1 shrink-0" size={22} />
//               <div>
//                 <h3 className="font-semibold text-lg">Secure access</h3>
//                 <p className="text-sm text-green-50/85">
//                   Protected login flow for farmers, buyers, and admins.
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
//               <Mail className="mt-1 shrink-0" size={22} />
//               <div>
//                 <h3 className="font-semibold text-lg">Fast communication</h3>
//                 <p className="text-sm text-green-50/85">
//                   Stay connected with orders, support, and marketplace updates.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center justify-center px-6 sm:px-10 py-10 sm:py-14">
//           <div className="w-full max-w-md">
//             <div className="mb-8 text-center lg:text-left">
//               <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
//                 Sign In
//               </span>
//               <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
//                 Welcome back
//               </h1>
//               <p className="text-slate-500 text-base">
//                 Sign in to continue managing your AgroMitra account.
//               </p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Email address
//                 </label>
//                 <div className="relative">
//                   <Mail
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="farmer@example.com"
//                     className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-14 text-slate-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((prev) => !prev)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-600 transition"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between gap-4 text-sm">
//                 <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     name="remember"
//                     checked={formData.remember}
//                     onChange={handleChange}
//                     className="w-4 h-4 accent-green-600 rounded"
//                   />
//                   Remember me
//                 </label>

//                 <Link
//                   to="/forgot-password"
//                   className="font-semibold text-green-600 hover:text-green-700"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg shadow-green-200 transition-all"
//               >
//                 Sign in
//               </button>
//             </form>

//             <p className="mt-6 text-center text-slate-500">
//               Don&apos;t have an account?{' '}
//               <Link
//                 to="/register"
//                 className="font-semibold text-green-600 hover:text-green-700"
//               >
//                 Register here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Leaf, ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role);

      if (data.role === "farmer") {
        navigate("/seller-dashboard");
      } else {
        navigate("/buyer-dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden border border-green-100">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6">
              <Leaf size={30} />
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Welcome back to AgroMitra
            </h2>

            <p className="text-green-50/90 text-lg leading-8 max-w-md">
              Manage your farming marketplace with a clean and reliable platform
              built for modern agriculture.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <ShieldCheck className="mt-1 shrink-0" size={22} />

              <div>
                <h3 className="font-semibold text-lg">Secure access</h3>
                <p className="text-sm text-green-50/85">
                  Protected login flow for farmers, buyers, and admins.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <Mail className="mt-1 shrink-0" size={22} />

              <div>
                <h3 className="font-semibold text-lg">Email confirmation</h3>
                <p className="text-sm text-green-50/85">
                  Please confirm your email before login.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 sm:px-10 py-10 sm:py-14">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
                Sign In
              </span>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Welcome back
              </h1>

              <p className="text-slate-500 text-base">
                Sign in after confirming your email.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="farmer@example.com"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-14 text-slate-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 accent-green-600 rounded"
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-lg shadow-lg shadow-green-200 transition-all"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}