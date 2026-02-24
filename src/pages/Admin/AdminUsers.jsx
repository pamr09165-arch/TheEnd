import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/api';
import { Search, Filter } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userBookings, setUserBookings] = useState([]);
  const [showUserBookings, setShowUserBookings] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถโหลดผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteUser = async (userId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถยกเลิกได้')) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
      alert('ลบผู้ใช้สำเร็จ');
    } catch (err) {
      alert('ไม่สามารถลบผู้ใช้ได้: ' + err.message);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'ระงับ' : 'เปิดใช้งาน';
    if (!window.confirm(`คุณต้องการ${action}บัญชีผู้ใช้นี้ใช่หรือไม่?`)) return;
    try {
      await adminService.updateUserStatus(userId, newStatus);
      fetchUsers();
      alert(`${action}บัญชีสำเร็จ`);
    } catch (err) {
      alert(`ไม่สามารถ${action}บัญชีได้: ` + err.message);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    const roleNames = { admin: 'ผู้ดูแลระบบ', staff: 'พนักงาน', user: 'ผู้ใช้ทั่วไป' };
    if (!window.confirm(`คุณต้องการเปลี่ยนสิทธิ์เป็น "${roleNames[newRole]}" ใช่หรือไม่?`)) return;
    try {
      await adminService.updateUserRole(userId, newRole);
      fetchUsers();
      alert('เปลี่ยนสิทธิ์สำเร็จ');
    } catch (err) {
      alert('ไม่สามารถเปลี่ยนสิทธิ์ได้: ' + err.message);
    }
  };

  const handleViewUserBookings = async (user) => {
    try {
      const bookings = await adminService.getUserBookings(user.id || user._id);
      setUserBookings(Array.isArray(bookings) ? bookings : []);
      setSelectedUser(user);
      setShowUserBookings(true);
    } catch (err) {
      alert('ไม่สามารถโหลดประวัติการจองได้: ' + err.message);
    }
  };

  const closeUserBookings = () => {
    setShowUserBookings(false);
    setSelectedUser(null);
    setUserBookings([]);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const userName = (u.name || u.username || '').toLowerCase();
      const matchesSearch = userName.includes(userSearchTerm.toLowerCase()) ||
                           (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchTerm, userRoleFilter]);

  return (
    <div className="users-management">
      {loading && <div className="loader">กำลังโหลด...</div>}
      {error && <p className="admin-error">{error}</p>}

      <div className="user-header">
        <h3>จัดการผู้ใช้ระบบ</h3>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
            <option value="all">สิทธิ์ทั้งหมด</option>
            <option value="admin">ผู้ดูแลระบบ</option>
            <option value="staff">พนักงาน</option>
            <option value="user">ผู้ใช้ทั่วไป</option>
          </select>
        </div>
      </div>

      <div className="users-list">
        {filteredUsers.map((user) => {
          const userId = user.id || user._id;
          return (
            <div key={userId} className="user-card">
              <div className="user-info">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <h4>{user.name || user.username}</h4>
                  <p className="user-email">📧 {user.email}</p>
                  <p className="user-phone">📱 {user.phone || 'ไม่ระบุ'}</p>
                  <div className="user-meta">
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? '👑 ผู้ดูแลระบบ' : 
                       user.role === 'staff' ? '👨‍💼 พนักงาน' : '👤 ผู้ใช้ทั่วไป'}
                    </span>
                    <span className={`status-badge status-${user.status || 'active'}`}>
                      {user.status === 'suspended' ? '🚫 ถูกระงับ' : '✅ ใช้งานได้'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="user-actions">
                <button 
                  className="btn-view-bookings" 
                  onClick={() => handleViewUserBookings(user)}
                  title="ดูประวัติการจอง"
                >
                  📋 ประวัติ
                </button>
                  <select
                  className="role-select"
                  value={user.role}
                  onChange={(e) => handleChangeUserRole(userId, e.target.value)}
                  title="เปลี่ยนสิทธิ์"
                >
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="staff">พนักงาน</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
                <button 
                  className={`btn-status ${user.status === 'suspended' ? 'btn-activate' : 'btn-suspend'}`}
                  onClick={() => handleToggleUserStatus(userId, user.status || 'active')}
                  title={user.status === 'suspended' ? 'เปิดใช้งานบัญชี' : 'ระงับบัญชี'}
                >
                  {user.status === 'suspended' ? '🔓 เปิดใช้งาน' : '🔒 ระงับ'}
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeleteUser(userId)}
                  title="ลบผู้ใช้"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>


      {showUserBookings && selectedUser && (
        <div className="modal-overlay" onClick={closeUserBookings}>
          <div className="modal-content user-bookings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>ประวัติการจองของ {selectedUser.name || selectedUser.username}</h3>
              <button className="modal-close" onClick={closeUserBookings}>×</button>
            </div>
            <div className="modal-body">
              {userBookings.length > 0 ? (
                <div className="user-bookings-list">
                  {userBookings.map((booking) => {
                    const bookingId = booking.id || booking._id;
                    return (
                      <div key={bookingId} className="user-booking-item">
                        <div className="booking-summary">
                          <span className="booking-date">📅 {booking.date}</span>
                          <span className="booking-time">🕐 {booking.timeSlot || booking.time_slot}</span>
                          <span className="booking-people">👥 {booking.people} ท่าน</span>
                          <span className="booking-total">💰 {Number(booking.total).toLocaleString()} ฿</span>
                          <span className={`booking-status status-${booking.status}`}>
                            {booking.status === 'pending' ? 'รอดำเนินการ' : 
                             booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                             booking.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                          </span>
                        </div>
                        {booking.note && (
                          <div className="booking-note">
                            <strong>📝 หมายเหตุ:</strong> {booking.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-bookings">
                  <p>ผู้ใช้นี้ยังไม่มีประวัติการจอง</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}