import axios from "axios";
// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Health Check
  HEALTH: "/health",

  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
  UPDATE_PROFILE: "/auth/profile",
  SEND_OTP_LOGIN: "/auth/send-otp-login",
  VERIFY_OTP_LOGIN: "/auth/verify-otp-login",

  // Forgot Password
  FORGOT_PASSWORD_SEND_OTP: "/forgot-password/user/send-otp",
  FORGOT_PASSWORD_VERIFY_OTP: "/forgot-password/user/verify-otp",
  FORGOT_PASSWORD_RESET: "/forgot-password/user/reset-password",

  // Products
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  PRODUCT_SEARCH: (query) =>
    `/products/search?search=${encodeURIComponent(query)}`,
  PRODUCTS_BY_CATEGORY: (category) => `/products/category/${category}`,
  FEATURED_PRODUCTS: "/products/featured",
  PRODUCT_CATEGORIES: "/products/categories",
  PRODUCT_STATS: "/products/stats",
  BULK_UPDATE_PRODUCTS: "/products/bulk-update",

  // User
  USER_PROFILE: "/user/profile",
  USER_RETURNS: "/user/returns",
  USER_RETURN_SUBMIT: "/user/return",
  USER_MANUAL_SUBSCRIBE: "/user/manual-subscribe",

  // Messages & Notifications
  USER_MESSAGES: "/user/messages",
  USER_NOTIFICATIONS: "/user/notifications",
  USER_NOTIFICATION_MARK_READ: (id) => `/user/notifications/${id}/read`,
  USER_NOTIFICATIONS_UNREAD_COUNT: "/user/notifications/unread-count",

  // Addresses
  USER_ADDRESSES: "/user/addresses",
  USER_ADDRESS_DETAIL: (id) => `/user/addresses/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDERS_MY_ORDERS: "/orders/my-orders",
  ORDER_DETAIL: (id) => `/orders/${id}`,
  ORDER_MY_DETAIL: (id) => `/orders/my/${id}`,
  ORDER_STATUS_UPDATE: (id) => `/orders/${id}/status`,

  // Coupons
  COUPONS: "/coupons",
  COUPONS_APPLY: "/coupons/apply",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_COUPON_DETAIL: (id) => `/admin/coupons/${id}`,

  // Email
  EMAIL_SEND: "/email/send-email",

  // Upload
  UPLOAD: "/upload",

  // Admin (if needed for frontend)
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_USERS: "/admin/users",
  ADMIN_DASHBOARD: "/admin/dashboard",

  // DataEntry
  NEWS_CONTENT: (id) => `/data-entry/${id}/news-content`,
  SLIDE_IMAGES: (id) => `/data-entry/${id}/slide-images`,
  MOBIEL_SLIDE_IMAGES: (id) => `/data-entry/${id}/mobile-slide-images`,
  COLLECTION_IMAGES: (id) => `/data-entry/${id}/collection-images`,
  MOBILE_COLLECTION_IMAGES: (id) => `/data-entry/${id}/mobile-collection-images`,
  COLLECTIONS: (id) => `/data-entry/${id}/collections`,
  // FooterInfo
  FOOTER_ABOUT_US: "/footer-info/about-us",
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a central Axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Remove the request interceptor that redirects to login if no token
// Instead, just attach the Authorization header if the token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get full API URL with auth headers
export const getApiConfig = (endpoint, method = "GET", data = null) => {
  const config = {
    url: buildApiUrl(endpoint),
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.data = data;
  }

  return config;
};

// Common API response handler
export const handleApiResponse = (response) => {
  if (response.data && response.data.success !== undefined) {
    return response.data;
  }
  return response.data;
};

// Common API error handler
export const handleApiError = (error) => {
  const message =
    error.response?.data?.message || error.message || "An error occurred";
  const status = error.response?.status;

  return {
    message,
    status,
    error: error.response?.data || error,
  };
};
