// API Configuration
// เปลี่ยน URL นี้เป็น URL ของ backend ของคุณ
// หมายเหตุ: URL ต้องลงท้ายด้วย /api ตาม backend configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://theend-backend.onrender.com/api';

// ตรวจสอบว่า BASE_URL ลงท้ายด้วย /api หรือไม่
export const API_BASE_URL = BASE_URL.endsWith('/api') 
  ? BASE_URL 
  : BASE_URL + (BASE_URL.endsWith('/') ? 'api' : '/api');

// Debug: แสดง API_BASE_URL ที่ใช้จริง (เฉพาะ development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
    'API_BASE_URL (used)': API_BASE_URL
  });
}

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me', // ดึงข้อมูล user ปัจจุบัน
  PROFILE: '/auth/profile', // อัปเดตข้อมูลส่วนตัว
  CHANGE_PASSWORD: '/auth/change-password', // เปลี่ยนรหัสผ่าน
  
  // เมนูอาหาร
  MENU: '/menu',
  MENU_ITEM: (id) => `/menu/${id}`,
  
  // Admin menu management
  ADMIN_MENU: '/admin/menu',
  ADMIN_MENU_ITEM: (id) => `/admin/menu/${id}`,
  ADMIN_MENU_STATUS: (id) => `/admin/menu/${id}/status`,
  
  // การจอง (Bookings)
  BOOKINGS: '/bookings',
  BOOKING: (id) => `/bookings/${id}`,
  
  // Admin endpoints
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_STATUS: (id) => `/admin/bookings/${id}/status`,
  ADMIN_USERS: '/admin/users',
  ADMIN_USER: (id) => `/admin/users/${id}`,
  ADMIN_USER_STATUS: (id) => `/admin/users/${id}/status`,
  ADMIN_USER_ROLE: (id) => `/admin/users/${id}/role`,
  ADMIN_USER_BOOKINGS: (id) => `/admin/users/${id}/bookings`,
  ADMIN_STATS: '/admin/stats',
  
  // ช่วงเวลา (legacy support)
  TIME_SLOTS: '/time-slots',
  RESERVATIONS: '/reservations', // legacy
  RESERVATION: (id) => `/reservations/${id}`, // legacy
};



