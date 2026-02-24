import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validate = () => {
    if (!formData.username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return false;
    }

    if (formData.username.length < 3) {
      setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
      return false;
    }

    if (!formData.name.trim()) {
      setError('กรุณากรอกชื่อ');
      return false;
    }

    if (!formData.email.trim()) {
      setError('กรุณากรอกอีเมล');
      return false;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('กรุณากรอกเบอร์โทรศัพท์');
      return false;
    }

    // ตรวจสอบเบอร์โทร (9-10 หลัก)
    const phoneRegex = /^\d{9,10}$/;
    if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
      return false;
    }

    if (!formData.password) {
      setError('กรุณากรอกรหัสผ่าน');
      return false;
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'user', // default role
      });

      if (result.success) {
        // Redirect ไปหน้าแรกหลังจากสมัครสำเร็จ
        navigate('/');
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
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
          <h1 className="register-title">สมัครสมาชิก</h1>
          <p className="register-subtitle">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <User className="label-icon" />
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="กรุณากรอกชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User className="label-icon" />
              ชื่อ-นามสกุล
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="กรุณากรอกชื่อ-นามสกุล"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail className="label-icon" />
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="กรุณากรอกอีเมล"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone className="label-icon" />
              เบอร์โทรศัพท์
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="เช่น 0812345678"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="กรุณากรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock className="label-icon" />
              ยืนยันรหัสผ่าน
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="login-link">
              เข้าสู่ระบบ
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



