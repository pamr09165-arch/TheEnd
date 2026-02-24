import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * ใช้สำหรับป้องกัน routes ที่ต้อง authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component ที่จะ render
 * @param {boolean} props.requireAdmin - ถ้า true ต้องเป็น admin ถึงจะเข้าถึงได้
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // รอให้ auth context โหลดเสร็จ
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  // ยังไม่ล็อกอิน -> ไปหน้า login พร้อม redirect กลับ
  if (!isAuthenticated) {
    const redirectTo = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  }

  // ต้องการ admin แต่ไม่ใช่ admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

