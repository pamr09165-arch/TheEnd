import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/api';
import { TrendingUp, Users, Calendar, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response?.data || response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBookings().catch(() => []);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('ไม่สามารถโหลดการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const dashboardData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const normalizeDate = (d) => {
      if (!d) return '';
      if (typeof d === 'string' && d.includes('-')) return d.substring(0, 10);
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0];
    };

    const todayBookings = bookings.filter(b => normalizeDate(b.date) === today && b.status !== 'cancelled');
    const todaySales = todayBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (Number(b.total) || 0), 0);

    const upcomingBookings = bookings
      .filter(b => {
        const bDate = normalizeDate(b.date);
        return bDate >= today && ['pending', 'confirmed'].includes(b.status);
      })
      .sort((a, b) => {
        const da = normalizeDate(a.date) + (a.timeSlot || a.time_slot || '');
        const db = normalizeDate(b.date) + (b.timeSlot || b.time_slot || '');
        return da.localeCompare(db);
      })
      .slice(0, 8);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }
    const salesByDay = last7Days.map(date => {
      const daySales = bookings
        .filter(b => normalizeDate(b.date) === date && b.status === 'completed')
        .reduce((sum, b) => sum + (Number(b.total) || 0), 0);
      const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
      return { date, dayLabel, total: daySales };
    });

    const maxSales = Math.max(...salesByDay.map(d => d.total), 1);

    return { todaySales, todayBookings, upcomingBookings, salesByDay, maxSales };
  }, [bookings]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TrendingUp size={24} color="#667eea" />
        <h2 style={{ margin: 0 }}>ภาพรวมระบบ</h2>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-label" style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>การจองทั้งหมด</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>{stats?.totalBookings || 0}</div>
        </div>

        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <Users size={24} />
          </div>
          <div className="stat-label" style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>ผู้ใช้งานทั้งหมด</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>{stats?.totalUsers || 0}</div>
        </div>

        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <FileText size={24} />
          </div>
          <div className="stat-label" style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>รอดำเนินการ</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>{stats?.bookingsByStatus?.pending || 0}</div>
        </div>
      </div>

      {/* daily overview */}
      <div className="dashboard-section" style={{ marginTop: '30px' }}>
        <h2 className="dashboard-title">ภาพรวมรายวัน</h2>

        <div className="dashboard-stats-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="dashboard-stat-card sales">
            <div className="stat-label">ยอดขายรวมวันนี้</div>
            <div className="stat-value">{dashboardData.todaySales.toLocaleString()} ฿</div>
          </div>
          <div className="dashboard-stat-card bookings">
            <div className="stat-label">การจองวันนี้</div>
            <div className="stat-value">{dashboardData.todayBookings.length} โต๊ะ</div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div className="dashboard-card upcoming-card">
            <h3>🔜 กำลังจะมาเร็วๆ นี้</h3>
            {dashboardData.upcomingBookings.length > 0 ? (
              <ul className="upcoming-list">
                {dashboardData.upcomingBookings.map((b) => (
                  <li key={b.id || b._id}>
                    <span className="upcoming-date">📅 {b.date}</span>
                    <span className="upcoming-time">🕐 {b.timeSlot || b.time_slot}</span>
                    <span className="upcoming-name">{b.name || b.user?.name}</span>
                    <span className="upcoming-people">👥 {b.people} ท่าน</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-upcoming">ไม่มีการจองที่กำลังจะมา</p>
            )}
          </div>

          <div className="dashboard-card chart-card">
            <h3>📈 กราฟยอดขาย 7 วันล่าสุด</h3>
            <div className="sales-chart">
              <svg className="line-chart" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid meet">
                {dashboardData.salesByDay.length > 0 && (() => {
                  const w = 400; const h = 120; const padding = { top: 10, right: 10, bottom: 30, left: 50 };
                  const chartW = w - padding.left - padding.right; const chartH = h - padding.top - padding.bottom;
                  const points = dashboardData.salesByDay.map((d, i) => {
                    const x = padding.left + (i / Math.max(dashboardData.salesByDay.length - 1, 1)) * chartW;
                    const y = padding.top + chartH - (d.total / dashboardData.maxSales) * chartH;
                    return { x, y, ...d };
                  });
                  return (
                    <>
                      <defs><linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" /></linearGradient></defs>
                      <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((p) => <circle key={p.date} cx={p.x} cy={p.y} r="4" fill="#667eea" />)}
                    </>
                  );
                })()}
              </svg>
              <div className="chart-labels">
                {dashboardData.salesByDay.map((d) => (
                  <span key={d.date} className="chart-label-item" title={`${d.dayLabel}: ${d.total.toLocaleString()} ฿`}>{d.dayLabel}</span>
                ))}
              </div>
              <div className="chart-legend">
                {dashboardData.salesByDay.map((d) => (
                  <span key={d.date} className="chart-legend-item">{d.dayLabel}: {d.total.toLocaleString()} ฿</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}