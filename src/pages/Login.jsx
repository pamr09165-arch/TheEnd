import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [username, setUsername] = useState(''); // รองรับทั้ง username และ email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้/อีเมลและรหัสผ่าน');
      setLoading(false);
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      // ตรวจสอบ role ของ user
      const userRole = result.user?.role;
      
      // ถ้าเป็น admin ให้ redirect ไปหน้า admin
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        // ถ้าเป็น user ให้ redirect ไปหน้าที่ต้องการ (จาก query parameter) หรือหน้าแรก
        const redirectTo = searchParams.get('redirect') || '/';
        navigate(redirectTo);
      }
    } else {
      setError(result.error || 'ชื่อผู้ใช้/อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src="/image/logo3.png" 
              alt="อนงค์" 
              className="logo-icon"
              style={{ 
                width: '60px', 
                height: '60px', 
                objectFit: 'contain' 
              }} 
            />
          </div>
          <h1 className="login-title">เข้าสู่ระบบ</h1>
          <p className="login-subtitle">ยินดีต้อนรับกลับมา</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <User className="label-icon" />
              ชื่อผู้ใช้หรืออีเมล
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="กรุณากรอกชื่อผู้ใช้หรืออีเมล"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock className="label-icon" />
              รหัสผ่าน
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="กรุณากรอกรหัสผ่าน"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>จดจำฉัน</span>
            </label>
            
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ยังไม่มีบัญชี?{' '}
            <Link to="/Register" className="register-link">
              สมัครสมาชิก
            </Link>
          </p>
        </div>

        <div className="back-to-home">
          <Link to="/" className="back-link">
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}


