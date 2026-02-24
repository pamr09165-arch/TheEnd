import React, { useState, useEffect, useMemo } from 'react';
import { adminService, menuService, API_BASE_URL } from '../../services/api';
import { Search, Filter, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import './AdminMenu.css';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedBookings, setExpandedBookings] = useState(new Set());

  useEffect(() => {
    fetchBookings();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllBookings(statusFilter === 'all' ? {} : { status: statusFilter });
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถโหลดการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const resp = await menuService.getAllAdmin();
      setMenuItems(Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []));
    } catch (err) {
      console.error('fetchMenuItems error', err);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    let confirmMsg = "คุณต้องการเปลี่ยนสถานะการจองนี้ใช่หรือไม่?";
    if (newStatus === 'cancelled') confirmMsg = "‼️ คุณแน่ใจหรือไม่ว่าต้องการ 'ยกเลิก' การจองนี้?";
    if (newStatus === 'completed') confirmMsg = "ยืนยันการทำรายการ 'เสร็จสิ้น' (เช็คเอาท์)?";

    if (!window.confirm(confirmMsg)) return;
    try {
      await adminService.updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะได้: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const toggleBookingDetails = (bookingId) => {
    setExpandedBookings(prev => {
      const set = new Set(prev);
      set.has(bookingId) ? set.delete(bookingId) : set.add(bookingId);
      return set;
    });
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const customerName = (b.name || b.user?.name || '').toLowerCase();
      const matchesSearch = customerName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  return (
    <div className="bookings-section">
      {loading && <div className="loader">กำลังโหลดข้อมูล...</div>}
      {error && <p className="admin-error">{error}</p>}

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">⏳ รอดำเนินการ</option>
            <option value="confirmed">✅ ยืนยันแล้ว</option>
            <option value="completed">💙 เสร็จสิ้น</option>
            <option value="cancelled">❌ ยกเลิก</option>
          </select>
        </div>
      </div>

      <div className="bookings-list">
        {filteredBookings.map((booking) => {
          const bookingId = booking.id || booking._id;
          const isExpanded = expandedBookings.has(bookingId);
          const items = booking.items || [];

          return (
            <div key={bookingId} className={`booking-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="booking-card-header" onClick={() => toggleBookingDetails(bookingId)}>
                <div className="main-info">
                  <h3>{booking.name || booking.user?.name}</h3>
                  <div className="tags">
                    <span>📅 {booking.date}</span>
                    <span>🕐 {booking.timeSlot || booking.time_slot}</span>
                    <span>👥 {booking.people} ท่าน</span>
                    <span>💰 {Number(booking.total).toLocaleString()} ฿</span>
                  </div>
                </div>
                <div className="status-area">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {booking.status === 'pending' ? 'รอดำเนินการ' : 
                     booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                     booking.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                  </span>
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>

              {isExpanded && (
                <div className="booking-card-details">
                  <div className="details-grid">
                    <div className="info-col">
                      <h4><FileText size={16} /> ข้อมูลการจอง</h4>
                      <p><strong>บันทึกเมื่อ:</strong> {formatDateTime(booking.createdAt || booking.created_at)}</p>
                      <p><strong>เบอร์โทร:</strong> {booking.phone || '-'}</p>
                      {booking.note && (
                        <div className="admin-note">
                          <strong>📝 หมายเหตุ:</strong> {booking.note}
                        </div>
                      )}
                    </div>
                    
                    <div className="items-col">
                      <h4>🍽️ รายการอาหารที่สั่ง</h4>
                      {items.length > 0 ? (
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>รูปภาพ</th>
                              <th>เมนู</th>
                              <th className="text-center">จำนวน</th>
                              <th className="text-right">รวม</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, i) => {
                              const menuItem = menuItems.find(m => (m._id || m.id) === (item.menu_item_id || item.menuItem?._id || item.menuItem?.id));
                              const imgSrc = item.image || item.menu_item_image || menuItem?.image || '';
                              const imgUrl = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `${API_BASE_URL.replace(/\/api$/, '')}${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`) : '';
                              if (imgSrc && !imgUrl) {
                                console.warn('Booking image source exists but URL could not be constructed', imgSrc);
                              }
                              return (
                              <tr key={i}>
                                <td className="item-thumb">
                                  {imgUrl ? (
                                    <img src={imgUrl} alt={item.menu_item_name || item.name} />
                                  ) : (
                                    <span className="no-thumb">ไม่มีรูป</span>
                                  )}
                                </td>
                                <td>{item.menu_item_name || item.name}</td>
                                <td className="text-center">x{item.quantity}</td>
                                <td className="text-right">
                                  {(item.price * item.quantity).toLocaleString()} ฿
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3"><strong>ยอดรวมสุทธิ</strong></td>
                              <td className="text-right"><strong>{Number(booking.total).toLocaleString()} ฿</strong></td>
                            </tr>
                          </tfoot>
                        </table>
                      ) : (
                        <p className="no-items">ไม่มีรายการอาหาร</p>
                      )}
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <>
                        <button className="btn-confirm" onClick={() => handleStatusUpdate(bookingId, 'confirmed')}>ยืนยัน</button>
                        <button className="btn-cancel" onClick={() => handleStatusUpdate(bookingId, 'cancelled')}>ยกเลิก</button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button className="btn-complete" onClick={() => handleStatusUpdate(bookingId, 'completed')}>เสร็จสิ้นการใช้บริการ</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}