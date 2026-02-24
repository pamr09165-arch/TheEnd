import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Users, Calendar, TrendingUp, Menu as MenuIcon } from 'lucide-react';

// Import Components ที่เราแยกไว้
import AdminDashboard from './AdminDashboard';
import AdminBookings from './AdminBookings';
import AdminUsers from './AdminUsers';
import AdminMenu from './AdminMenu';

import './AdminMenu.css';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'bookings': return <AdminBookings />;
      case 'users': return <AdminUsers />;
      case 'menu': return <AdminMenu />;
      default: return <AdminBookings />;
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Panel</h1>
          <div className="admin-header-actions">
            <span className="admin-user-info">
              สวัสดี, {user?.name || user?.username || 'Admin'}
            </span>
            <button className="admin-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={18} /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className="admin-tabs" style={{ display: 'flex', gap: '10px', padding: '20px', backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', background: activeTab === 'dashboard' ? '#667eea' : '#eee', color: activeTab === 'dashboard' ? '#fff' : '#333', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <TrendingUp size={18} /> รายงานยอด
        </button>
        <button 
          onClick={() => setActiveTab('bookings')} 
          style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', background: activeTab === 'bookings' ? '#667eea' : '#eee', color: activeTab === 'bookings' ? '#fff' : '#333', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Calendar size={18} /> การจอง
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', background: activeTab === 'users' ? '#667eea' : '#eee', color: activeTab === 'users' ? '#fff' : '#333', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Users size={18} /> ผู้ใช้งาน
        </button>
        <button 
          onClick={() => setActiveTab('menu')} 
          style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', background: activeTab === 'menu' ? '#667eea' : '#eee', color: activeTab === 'menu' ? '#fff' : '#333', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <MenuIcon size={18} /> จัดการเมนู
        </button>
      </div>

      <main className="admin-content" style={{ padding: '20px' }}>
        {renderContent()}
      </main>
    </div>
  );
}