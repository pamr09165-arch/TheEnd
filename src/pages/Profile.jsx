import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookingListTitle from '../components/BookingListTitle';
import MemberProfile from '../components/MemberProfile';
import MemberSettings from '../components/MemberSettings';
import { bookingService } from '../services/api';
import './Profile.css'; // อย่าลืม Import ไฟล์ CSS

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [expanded, setExpanded] = useState(new Set());

    const userId = useMemo(() => user?.id || user?._id || user?.userId, [user]);

    useEffect(() => {
        if (!userId) return;
        let mounted = true;
        const load = async () => {
            setLoadingBookings(true);
            try {
                const res = await bookingService.getAll();
                const data = Array.isArray(res) ? res : (res?.data || []);
                const my = data.filter(b => 
                    [b.user_id, b.userId, b.user, b.user?._id].includes(userId)
                );
                if (mounted) setBookings(my);
            } catch (err) {
                if (mounted) setBookings([]);
            } finally {
                if (mounted) setLoadingBookings(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [userId]);

    const getStatusInfo = (status) => {
        const config = {
            pending: { label: 'รอดำเนินการ', class: 'status-pending' },
            confirmed: { label: 'ยืนยันแล้ว', class: 'status-confirmed' },
            cancelled: { label: 'ยกเลิก', class: 'status-cancelled' },
            completed: { label: 'เสร็จสิ้น', class: 'status-completed' }
        };
        return config[status] || { label: status, class: '' };
    };

    const toggle = (id) => {
        setExpanded(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <button className="btn-back" onClick={() => navigate(-1)}>← ย้อนกลับ</button>
                <BookingListTitle title="โปรไฟล์ผู้ใช้" />
                <div style={{ width: 80 }} />
            </header>

            <div className="section-card">
                <MemberProfile user={user} onOpenSettings={() => setShowSettings(true)} />
                {showSettings && (
                    <MemberSettings 
                        user={user} 
                        onClose={() => setShowSettings(false)} 
                        onSave={updateProfile} 
                    />
                )}
            </div>

            <section className="booking-section">
                <div style={{ marginBottom: '1.5rem' }}>
                    <BookingListTitle title="รายการจองของฉัน" />
                </div>

                {loadingBookings ? (
                    <div className="loader">กำลังโหลดรายการจอง...</div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">คุณยังไม่มีรายการจองในขณะนี้</div>
                ) : (
                    <div className="booking-list">
                        {bookings.map(b => {
                            const id = b._id || b.id;
                            const isExp = expanded.has(id);
                            const status = getStatusInfo(b.status);

                            return (
                                <div key={id} className="booking-item">
                                    <div className="booking-summary" onClick={() => toggle(id)}>
                                        <div className="booking-info-main">
                                            <div className="name">{b.name || user.name}</div>
                                            <div className="date-time">
                                                <span>📅 {b.date || '-'}</span>
                                                <span>⏰ {b.time_slot || b.timeslot || ''}</span>
                                            </div>
                                        </div>
                                        <div className={`arrow-icon ${isExp ? 'active' : ''}`}>▼</div>
                                    </div>

                                    {isExp && (
                                        <div className="booking-details">
                                            <div className="detail-group">
                                                <label>สถานะ</label>
                                                <span className={`status-badge ${status.class}`}>{status.label}</span>
                                            </div>
                                            <div className="detail-group">
                                                <label>จำนวนคน</label>
                                                <span>{b.people} ท่าน</span>
                                            </div>
                                            <div className="detail-group">
                                                <label>ยอดรวมทั้งสิ้น</label>
                                                <span style={{ color: '#059669', fontSize: '1.1rem' }}>
                                                    ฿{Number(b.total || 0).toLocaleString()}
                                                </span>
                                            </div>

                                            {b.items?.length > 0 && (
                                                <div className="items-list">
                                                    <strong>รายการอาหาร:</strong>
                                                    <ul>
                                                        {b.items.map((it, i) => (
                                                            <li key={i}>
                                                                {it.menu_item_name || it.name} 
                                                                <span style={{ color: '#9ca3af', marginLeft: 8 }}>
                                                                    x {it.quantity || it.qty || 1}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}