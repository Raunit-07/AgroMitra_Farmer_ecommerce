const DEPLOYED_API_URL = "https://ecommerce-farming-backend.onrender.com/api";
const LOCAL_API_URL = "http://localhost:5000/api";

const rawApiBaseUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? DEPLOYED_API_URL : LOCAL_API_URL)
).replace(/\/$/, "");

export const API_BASE_URL = rawApiBaseUrl.endsWith("/api")
  ? rawApiBaseUrl
  : `${rawApiBaseUrl}/api`;

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
