import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
// Re-export API_BASE_URL for convenience in UI components
export { API_BASE_URL };

/**
 * Helper function สำหรับเรียก API พร้อมจัดการ token และ errors
 */
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // เพิ่ม token ใน header ถ้ามี
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // ถ้ามี body ให้แปลงเป็น JSON
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    // Debug: ตรวจสอบ API_BASE_URL และ endpoint
    console.log('API Config:', {
      API_BASE_URL,
      endpoint,
      fullURL: `${API_BASE_URL}${endpoint}`
    });
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Call:', url, options.method || 'GET');
    
    const response = await fetch(url, config);
    
    // ตรวจสอบ Content-Type ก่อน parse JSON
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    let data;
    if (isJson) {
      // ถ้าเป็น JSON ให้ parse
      try {
        data = await response.json();
      } catch (parseError) {
        // ถ้า parse ไม่ได้ แสดงว่า response ไม่ใช่ JSON ที่ valid
        const text = await response.clone().text();
        console.error('Failed to parse JSON response:', text.substring(0, 200));
        throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
      }
    } else {
      // ถ้าไม่ใช่ JSON (อาจเป็น HTML error page) ให้ดึง text และ throw error
      const text = await response.text();
      console.error('Non-JSON response received:', {
        status: response.status,
        contentType,
        preview: text.substring(0, 200)
      });
      
      // ถ้า response ไม่ ok และไม่ใช่ JSON อาจเป็น 404 หรือ CORS error
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`API endpoint not found: ${url}. Please check if backend is running on port 4000.`);
        }
        if (response.status === 0 || text.includes('CORS')) {
          throw new Error('CORS error: Backend may not be configured to allow requests from this origin.');
        }
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
      } else {
        throw new Error('Invalid response format: Expected JSON but received HTML or text');
      }
    }

    // ตรวจสอบว่า token หมดอายุหรือไม่
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // ใช้ navigate ถ้ามี แต่ถ้าไม่มีก็ใช้ window.location
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    // ตรวจสอบ response status
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // ถ้า error เป็น TypeError หรือ SyntaxError จาก JSON parsing
    if (error instanceof SyntaxError || error instanceof TypeError) {
      if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
        console.error('JSON Parse Error:', error);
        console.error('This usually means the backend server is not running or returning HTML instead of JSON');
        throw new Error('ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่ที่ http://localhost:4000 หรือไม่');
      }
    }
    
    // Network error (server ไม่ตอบสนอง)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network Error - Cannot reach server:', error);
      throw new Error('ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่หรือไม่');
    }
    
    console.error('API Error:', {
      endpoint,
      error: error.message,
      stack: error.stack
    });
    
    // ถ้า error มี message อยู่แล้ว ให้ throw ต่อ
    if (error.message) {
      throw error;
    }
    
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการเรียก API');
  }
}

// Helper สำหรับ FormData (ไม่ตั้ง Content-Type เพราะเบราว์เซอร์จะตั้ง boundary ให้)
async function apiCallFormData(endpoint, formData, method = 'POST') {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    body: formData,
  };

  const res = await fetch(url, config);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * API Service สำหรับเมนูอาหาร
 */
export const menuService = {
  // ดึงเมนูทั้งหมด
  getAll: async () => {
    const res = await apiCall(API_ENDPOINTS.MENU);
    return res?.data || res;
  },

  // ดึงเมนูตาม ID
  getById: async (id) => {
    return apiCall(API_ENDPOINTS.MENU_ITEM(id));
  },

  // ดึงเมนูทั้งหมด (ใช้ /menu)
  getAllAdmin: async () => {
    return apiCall(API_ENDPOINTS.MENU);
  },

  // สร้างเมนูใหม่ (รองรับ FormData)
  create: async (menuData) => {
    if (menuData instanceof FormData || menuData.imageFile) {
      const formData = menuData instanceof FormData ? menuData : new FormData();
      if (menuData.imageFile) formData.append('image', menuData.imageFile);
      ['name','description','price','category','isAvailable','dailyLimit','image'].forEach(k => {
        if (menuData[k] !== undefined && menuData[k] !== null) formData.append(k, menuData[k]);
      });

      const data = await apiCallFormData(API_ENDPOINTS.MENU, formData, 'POST');
      return data?.success ? data.data : data;
    }

    const response = await apiCall(API_ENDPOINTS.MENU, {
      method: 'POST',
      body: menuData,
    });
    return response.success ? response.data : response;
  },

  // อัปเดตเมนู
  update: async (id, menuData) => {
    if (menuData instanceof FormData || menuData.imageFile) {
      const formData = menuData instanceof FormData ? menuData : new FormData();
      if (menuData.imageFile) formData.append('image', menuData.imageFile);
      ['name','description','price','category','isAvailable','dailyLimit','image'].forEach(k => {
        if (menuData[k] !== undefined && menuData[k] !== null) formData.append(k, menuData[k]);
      });

      const data = await apiCallFormData(API_ENDPOINTS.MENU_ITEM(id), formData, 'PATCH');
      return data?.success ? data.data : data;
    }

    const response = await apiCall(API_ENDPOINTS.MENU_ITEM(id), {
      method: 'PATCH',
      body: menuData,
    });
    return response.success ? response.data : response;
  },

  // ลบเมนู
  delete: async (id) => {
    const response = await apiCall(API_ENDPOINTS.MENU_ITEM(id), {
      method: 'DELETE',
    });
    return response;
  },

  // เปลี่ยนสถานะเมนู (เปิด/ปิดการขาย) - ถ้า backend มี endpoint /menu/:id/status
  updateStatus: async (id, status) => {
    const endpoint = `${API_ENDPOINTS.MENU_ITEM(id)}/status`;
    const response = await apiCall(endpoint, {
      method: 'PATCH',
      body: { status },
    });
    return response.success ? response.data : response;
  },
};

/**
 * API Service สำหรับการจอง (Bookings) - ใช้ API ใหม่
 */
export const bookingService = {
  // สร้างการจองใหม่
  create: async (bookingData) => {
    const response = await apiCall(API_ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: bookingData,
    });
    return response.success ? response.data : response;
  },

  // ดึงการจองทั้งหมด (รองรับ filters: status, date)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.BOOKINGS}${queryString ? '?' + queryString : ''}`;
    
    const response = await apiCall(endpoint);
    return response.success ? response.data : response;
  },

  // ดึงการจองตาม ID
  getById: async (id) => {
    const response = await apiCall(API_ENDPOINTS.BOOKING(id));
    return response.success ? response.data : response;
  },

  // อัปเดตการจอง
  update: async (id, bookingData) => {
    const response = await apiCall(API_ENDPOINTS.BOOKING(id), {
      method: 'PATCH',
      body: bookingData,
    });
    return response.success ? response.data : response;
  },

  // ลบการจอง
  delete: async (id) => {
    const response = await apiCall(API_ENDPOINTS.BOOKING(id), {
      method: 'DELETE',
    });
    return response;
  },
};

/**
 * API Service สำหรับการจอง (Legacy - สำหรับ backward compatibility)
 */
export const reservationService = {
  // สร้างการจองใหม่
  create: async (reservationData) => {
    return bookingService.create(reservationData);
  },

  // ดึงการจองทั้งหมด
  getAll: async () => {
    return bookingService.getAll();
  },

  // ดึงการจองตาม ID
  getById: async (id) => {
    return bookingService.getById(id);
  },

  // อัปเดตการจอง
  update: async (id, reservationData) => {
    return bookingService.update(id, reservationData);
  },

  // ลบการจอง
  delete: async (id) => {
    return bookingService.delete(id);
  },
};

/**
 * API Service สำหรับช่วงเวลา
 */
export const timeSlotService = {
  // ดึงช่วงเวลาทั้งหมด
  getAll: async () => {
    const response = await apiCall(API_ENDPOINTS.TIME_SLOTS);
    return response.success ? response.data : response;
  },
};

/**
 * API Service สำหรับ Admin
 */
export const adminService = {
  // ดึงการจองทั้งหมด (สำหรับ Admin)
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.userId) params.append('userId', filters.userId);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.ADMIN_BOOKINGS}${queryString ? '?' + queryString : ''}`;
    
    const response = await apiCall(endpoint);
    return response.success ? response.data : response;
  },

  // อัปเดตสถานะการจอง
  updateBookingStatus: async (id, status) => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_BOOKING_STATUS(id), {
      method: 'PATCH',
      body: { status },
    });
    return response.success ? response.data : response;
  },

  // ดึงผู้ใช้ทั้งหมด
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.ADMIN_USERS}${queryString ? '?' + queryString : ''}`;
    
    const response = await apiCall(endpoint);
    return response.success ? response.data : response;
  },

  // สร้างผู้ใช้ใหม่
  createUser: async (userData) => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_USERS, {
      method: 'POST',
      body: userData,
    });
    return response.success ? response.data : response;
  },

  // อัปเดตข้อมูลผู้ใช้
  updateUser: async (id, userData) => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_USER(id), {
      method: 'PATCH',
      body: userData,
    });
    return response.success ? response.data : response;
  },

  // ลบผู้ใช้
  deleteUser: async (id) => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_USER(id), {
      method: 'DELETE',
    });
    return response.success ? response.data : response;
  },

  // เปลี่ยนสถานะผู้ใช้ (active/suspended)
  updateUserStatus: async (id, status) => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_USER_STATUS(id), {
      method: 'PATCH',
      body: { status },
    });
    return response.success ? response.data : response;
  },

  // เปลี่ยนสิทธิ์ผู้ใช้
  updateUserRole: async (id, role) => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_USER_ROLE(id), {
      method: 'PATCH',
      body: { role },
    });
    return response.success ? response.data : response;
  },

  // ดึงประวัติการจองของผู้ใช้
  getUserBookings: async (id, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.ADMIN_USER_BOOKINGS(id)}${queryString ? '?' + queryString : ''}`;
    
    const response = await apiCall(endpoint);
    return response.success ? response.data : response;
  },

  // ดึงสถิติ
  getStats: async () => {
    const response = await apiCall(API_ENDPOINTS.ADMIN_STATS);
    return response.success ? response.data : response;
  },
};

/**
 * API Service สำหรับ Authentication
 */
export const authService = {
  // Login - รองรับทั้ง username และ email
  login: async (username, password) => {
    const response = await apiCall(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: { username, password },
    });
    
    // เก็บ token และ user info ตาม response format ใหม่
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Register
  register: async (userData) => {
    const response = await apiCall(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: userData,
    });
    
    // เก็บ token และ user info ตาม response format ใหม่
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiCall(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // ดึงข้อมูล user ปัจจุบัน
  getCurrentUser: async () => {
    const response = await apiCall(API_ENDPOINTS.ME);
    if (response.success && response.data) {
      // อัปเดต user data ใน localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    return response;
  },

  // อัปเดตข้อมูลส่วนตัว
  updateProfile: async (profileData) => {
    const response = await apiCall(API_ENDPOINTS.PROFILE, {
      method: 'PATCH',
      body: profileData,
    });
    
    if (response.success && response.data) {
      // อัปเดต user data ใน localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  },

  // เปลี่ยนรหัสผ่าน
  changePassword: async (currentPassword, newPassword) => {
    return apiCall(API_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    });
  },

  // ตรวจสอบว่ามี token หรือไม่
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // ดึงข้อมูล user จาก localStorage
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};


