import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { menuService, bookingService, timeSlotService, API_BASE_URL } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [confirmData, setConfirmData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // อัปเดตข้อมูลผู้จองจาก user ที่ล็อกอินอยู่ (ถ้ามี)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name && !name) {
        setName(user.name);
      }
      if (user.phone && !phone) {
        setPhone(user.phone);
      }
    }
  }, [isAuthenticated, user]);

  // ดึงข้อมูลเมนูและช่วงเวลาจาก backend เมื่อ component โหลด
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ดึงข้อมูลเมนู
        try {
          const menuData = await menuService.getAll();
          // normalize items to ensure id/_id, image URL and numeric price
          const normalized = (Array.isArray(menuData) ? menuData : (menuData?.data || [])).map(item => ({
            id: item._id || item.id,
            name: item.name || item.title || '',
            price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
            description: item.description || item.desc || '',
            category: item.category || 'ทั่วไป',
            image: item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace(/\/api$/, '')}${item.image}`) : (item.imageUrl || '')
          }));
          if (normalized.length > 0) {
            setMenuItems(normalized);
          } else {
            setMenuItems([]);
          }
        } catch (menuError) {
          console.warn("ไม่สามารถดึงข้อมูลเมนูจาก backend:", menuError);
          setMenuItems([]);
          setError("ไม่สามารถโหลดเมนูอาหารได้ กรุณาลองใหม่อีกครั้ง");
        }

        // ดึงข้อมูลช่วงเวลา
        try {
          const timeSlotData = await timeSlotService.getAll();
          if (timeSlotData && Array.isArray(timeSlotData) && timeSlotData.length > 0) {
            setTimeSlots(timeSlotData);
          }
        } catch (timeSlotError) {
          console.warn("ไม่สามารถดึงข้อมูลช่วงเวลาจาก backend:", timeSlotError);
          // ใช้ข้อมูล default แทน
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
        setError("ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalAmount = Object.entries(selectedMenu).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // ดึงหมวดหมู่ทั้งหมดจากเมนูที่มีอยู่
  const getAllCategories = useMemo(() => {
    const categories = new Set();
    menuItems.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [menuItems]);
  
  // หมวดหมู่ที่ใช้ได้ (รวมหมวดหมู่พื้นฐาน)
  const availableCategories = useMemo(() => {
    const baseCategories = ['อาหารจานหลัก', 'อาหารทานเล่น', 'ของหวาน', 'เครื่องดื่ม'];
    const allCategories = new Set([...baseCategories, ...getAllCategories]);
    return Array.from(allCategories).sort();
  }, [getAllCategories]);

  // กรองเมนูตามหมวดหมู่
  const filteredMenuItems = useMemo(() => {
    if (categoryFilter === 'ทั้งหมด') {
      return menuItems;
    }
    return menuItems.filter(item => item.category === categoryFilter);
  }, [menuItems, categoryFilter]);

  // จัดกลุ่มเมนูตามหมวดหมู่
  const groupedMenuItems = useMemo(() => {
    if (categoryFilter === 'ทั้งหมด') {
      const groups = {};
      filteredMenuItems.forEach(item => {
        const category = item.category || 'ทั่วไป';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });
      return groups;
    } else {
      return { [categoryFilter]: filteredMenuItems };
    }
  }, [filteredMenuItems, categoryFilter]);

  const handleMenuChange = (id, qty) => {
    setSelectedMenu((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!date) nextErrors.date = "กรุณาเลือกวันที่";
    if (date) {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) nextErrors.date = "ไม่สามารถเลือกวันที่ย้อนหลัง";
    }
    if (!timeSlot) nextErrors.timeSlot = "กรุณาเลือกช่วงเวลา";
    if (!name.trim()) nextErrors.name = "กรุณากรอกชื่อผู้จอง";
    if (!phone.trim()) nextErrors.phone = "กรุณากรอกเบอร์โทร";
    if (phone && !/^\d{9,10}$/.test(phone))
      nextErrors.phone = "กรุณากรอกเบอร์โทรให้ถูกต้อง (9–10 หลัก)";
    if (people < 1) nextErrors.people = "จำนวนคนต้องมากกว่า 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    // Build cart array from selectedMenu
    const cart = Object.entries(selectedMenu).map(([id, qty]) => {
      const item = menuItems.find((m) => m.id === id || m._id === id);
      return {
        _id: item?._id || item?.id || id,
        id: item?._id || item?.id || id,
        name: item?.name || item?.title || '',
        price: Number(item?.price) || 0,
        quantity: qty,
      };
    });

    console.log('🛒 Current Cart Data:', cart);

    if (!Array.isArray(cart) || cart.length === 0) {
      alert('กรุณาเลือกอาหารก่อนจอง');
      return;
    }

    // Format items for backend (robust mapping)
    const formattedItems = cart.map((item) => {
      const id = item._id || item.id || item.menuId || item.menu_item_id || item.menu || null;
      const name = item.name || item.title || item.menu_item_name || '';
      return {
        menu_item_id: id,
        menu_item_name: name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      };
    });

    console.log('📦 Formatted Items for Backend:', formattedItems);

    const totalAmount = formattedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);

    const bookingData = {
      user: user?.id || user?._id || null,
      items: formattedItems,
      total: totalAmount,
      date,
      timeSlot,
      people,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
    };

    console.log('📦 ข้อมูลที่กำลังจะส่งไป Backend:', bookingData);

    setSubmitting(true);
    setError(null);

    try {
      const response = await bookingService.create(bookingData);
      console.log('Booking response:', response);
      alert('จองสำเร็จ!');
      // clear selected items (cart)
      setSelectedMenu({});

      // prepare a smaller structure for the confirmation screen
      const itemsForConfirmation = formattedItems.map(it => ({
        name: it.menu_item_name || it.name || '',
        qty: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
      }));

      // show confirmation view with the same data we sent (but transformed)
      setConfirmData({
        date,
        timeSlot,
        people,
        name: name.trim(),
        phone: phone.trim(),
        note: note.trim(),
        items: itemsForConfirmation,
        total: totalAmount,
      });
    } catch (err) {
      console.error('Booking Error:', err);
      alert('การจองล้มเหลว ตรวจสอบ Console');
      setError(err.message || 'ไม่สามารถส่งข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMenu({});
    setDate("");
    setTimeSlot("");
    setPeople(2);
    setName("");
    setPhone("");
    setNote("");
    setErrors({});
    setConfirmData(null);
  };

  // หน้ายืนยันการจอง
  if (confirmData) {
    return (
      <div className="confirmation-container">
        <button 
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            padding: '0.5rem 1rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            zIndex: 10
          }}
        >
          ← กลับหน้าแรก
        </button>
        <div className="confirmation-card">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div className="success-icon-wrapper">
              <svg
                className="success-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="confirmation-title">จองสำเร็จ!</h2>
            <p className="confirmation-subtitle">
              ขอบคุณที่ใช้บริการร้านของเรา
            </p>
          </div>

          <div className="detail-box">
            <h3 className="detail-title">รายละเอียดการจอง</h3>
            <div>
              <div className="detail-item">
                <span>📅</span>
                <span>
                  <strong>วันที่:</strong> {confirmData.date}
                </span>
              </div>
              <div className="detail-item">
                <span>🕐</span>
                <span>
                  <strong>เวลา:</strong> {confirmData.timeSlot} น.
                </span>
              </div>
              <div className="detail-item">
                <span>👥</span>
                <span>
                  <strong>จำนวน:</strong> {confirmData.people} คน
                </span>
              </div>
              <div className="detail-item">
                <span>👤</span>
                <span>
                  <strong>ชื่อ:</strong> {confirmData.name}
                </span>
              </div>
              <div className="detail-item">
                <span>📞</span>
                <span>
                  <strong>โทร:</strong> {confirmData.phone}
                </span>
              </div>
              {confirmData.note && (
                <div className="detail-item">
                  <span>📝</span>
                  <span>
                    <strong>หมายเหตุ:</strong> {confirmData.note}
                  </span>
                </div>
              )}
            </div>
          </div>

          {confirmData.items.length > 0 && (
            <div className="order-box">
              <h3 className="detail-title">เมนูที่สั่ง</h3>
              <div>
                {confirmData.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span style={{ fontWeight: "600" }}>
                      {item.price * item.qty} บาท
                    </span>
                  </div>
                ))}
                <div className="order-total">
                  <span style={{ fontSize: "1.125rem", fontWeight: "bold" }}>
                    ยอดรวม
                  </span>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#ea580c",
                    }}
                  >
                    {confirmData.total} บาท
                  </span>
                </div>
              </div>
            </div>
          )}

          <button onClick={resetForm} className="primary-btn" style={{ width: "100%" }}>
            จองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // หน้าฟอร์มจอง
  return (
    <div className="container">
      {/* แสดง error ถ้ามี */}
      {error && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div className="header">
        <button 
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            padding: '0.5rem 1rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          ← กลับหน้าแรก
        </button>
        <div className="header-badge">
          <span style={{ fontSize: "2rem" }}>🍽️</span>
          <h1 className="header-title">อาหารไทย</h1>
        </div>
          <p className="header-subtitle">เลือกเมนูได้ง่ายๆ</p>
          {isAuthenticated && user && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem 1rem', 
              background: '#d1ecf1', 
              border: '1px solid #bee5eb', 
              borderRadius: '8px',
              color: '#0c5460',
              fontSize: '0.9rem'
            }}>
              👋 สวัสดี {user.name || user.username}! ยินดีต้อนรับ
            </div>
          )}
      </div>

      <div>
        {/* เมนูอาหาร */}
        <div className="section">
          <h3 className="section-title">
            <span className="section-icon">🍽️</span>
            เมนูอาหาร
          </h3>
          
          {/* Category Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                background: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="ทั้งหมด">🍽️ ทั้งหมด</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="menu-grid">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '2rem' }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  padding: '0.5rem 0',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  🏷️ {category}
                </h4>
                <div className="menu-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {items.map((item) => {
                    const qty = selectedMenu[item.id] || 0;
                    return (
                      <div
                        key={item._id || item.id}
                        className={`menu-card ${qty > 0 ? "selected" : ""}`}
                      >
                        <div className="menu-header">
                          <div className="menu-name">
                            <img 
                              src={item.image}
                              alt={item.name}
                              className="menu-image"
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <span>{item.name}</span>
                              <div style={{ marginTop: '4px' }}>
                                <span style={{ 
                                  background: '#f0f9ff', 
                                  color: '#0369a1', 
                                  padding: '2px 6px', 
                                  borderRadius: '8px', 
                                  fontSize: '0.7rem',
                                  fontWeight: '500',
                                  display: 'inline-block'
                                }}>
                                  {item.category || 'ทั่วไป'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="menu-price">{item.price}฿</span>
                        </div>
                        <div className="qty-row">
                          <button
                            type="button"
                            onClick={() =>
                              handleMenuChange(item.id, Math.max(0, qty - 1))
                            }
                            className="qty-btn"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) =>
                              handleMenuChange(
                                item.id,
                                Math.max(0, parseInt(e.target.value || "0", 10))
                              )
                            }
                            className="qty-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleMenuChange(item.id, qty + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="total-row">
            <span className="total-label">ยอดรวมเมนู</span>
            <span className="total-amount">{totalAmount} บาท</span>
          </div>
        </div>

        {/* รายละเอียดการจอง */}
        <div className="section">
          <h3 className="section-title">
            <span>📅</span>
            รายละเอียดการจอง
          </h3>
          <div className="field-row">
            <div className="field">
              <label>
                <span>📅</span>
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                min={todayStr}
              />
              {errors.date && <span className="error">{errors.date}</span>}
            </div>
            <div className="field">
              <label>
                <span>🕐</span>
                ช่วงเวลา
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="input"
              >
                <option value="">— เลือกช่วงเวลา —</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} น.
                  </option>
                ))}
              </select>
              {errors.timeSlot && (
                <span className="error">{errors.timeSlot}</span>
              )}
            </div>
            <div className="field">
              <label>
                <span>👥</span>
                จำนวนคน
              </label>
              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) =>
                  setPeople(parseInt(e.target.value || "1", 10))
                }
                className="input"
              />
              {errors.people && <span className="error">{errors.people}</span>}
            </div>
          </div>
        </div>

        {/* ข้อมูลผู้จอง */}
        <div className="section">
          <h3 className="section-title">
            <span>👤</span>
            ข้อมูลผู้จอง
          </h3>
          <div className="field-row">
            <div className="field">
              <label>
                <span>👤</span>
                ชื่อผู้จอง
              </label>
              <input
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="field">
              <label>
                <span>📞</span>
                เบอร์โทร
              </label>
              <input
                type="tel"
                placeholder="เช่น 0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
          </div>
          <div className="field">
            <label>
              <span>📝</span>
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              placeholder="เช่น ขอที่นั่งริมหน้าต่าง / แพ้ถั่ว"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="textarea"
            />
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="actions">
          <button 
            type="button" 
            onClick={resetForm} 
            className="secondary-btn"
            disabled={submitting}
          >
            ล้างข้อมูล
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="primary-btn"
            disabled={submitting || loading}
          >
            {submitting ? "กำลังส่งข้อมูล..." : "ยืนยันการจอง 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}