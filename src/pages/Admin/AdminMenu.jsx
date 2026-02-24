import React, { useState, useEffect, useMemo } from 'react';
import { menuService, API_BASE_URL } from '../../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import './AdminMenu.css';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับฟอร์ม
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'ทั่วไป',
    image: '',
    imageFile: null,
    dailyLimit: '',
    isAvailable: true
  });

  // States สำหรับค้นหา
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('ทั้งหมด');
  
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

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await menuService.getAllAdmin ? await menuService.getAllAdmin() : await menuService.getAll();
      setMenuItems(response?.data || response || []);
    } catch (error) {
      console.error('fetchMenuItems error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      // จัดการหมวดหมู่ใหม่
      let finalCategory = menuFormData.category;
      if (menuFormData.category === '__new__' && menuFormData.newCategory) {
        finalCategory = menuFormData.newCategory.trim();
      }
      
      let payload;
      if (menuFormData.imageFile) {
        payload = new FormData();
        payload.append('name', menuFormData.name || '');
        payload.append('description', menuFormData.description || '');
        payload.append('price', menuFormData.price || '');
        payload.append('dailyLimit', menuFormData.dailyLimit || '');
        payload.append('category', finalCategory || 'ทั่วไป');
        payload.append('isAvailable', menuFormData.isAvailable ? 'true' : 'false');
        payload.append('image', menuFormData.imageFile);
      } else {
        payload = {
          name: menuFormData.name,
          description: menuFormData.description,
          price: menuFormData.price,
          dailyLimit: menuFormData.dailyLimit,
          category: finalCategory || 'ทั่วไป',
          image: menuFormData.image,
          isAvailable: menuFormData.isAvailable
        };
      }

      if (editingMenuItem) {
        await menuService.update(editingMenuItem._id || editingMenuItem.id, payload);
        alert('แก้ไขเมนูสำเร็จ');
      } else {
        await menuService.create(payload);
        alert('เพิ่มเมนูสำเร็จ');
      }

      setShowMenuForm(false);
      setEditingMenuItem(null);
      setMenuFormData({ name: '', description: '', price: '', category: 'ทั่วไป', image: '', imageFile: null, dailyLimit: '', isAvailable: true, newCategory: '' });
      fetchMenuItems();
    } catch (err) {
      console.error(err);
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + err.message);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?')) return;
    try {
      await menuService.delete(id);
      fetchMenuItems();
      alert('ลบเมนูสำเร็จ');
    } catch (err) {
      alert('ไม่สามารถลบเมนูได้: ' + err.message);
    }
  };

  const openEditForm = (item) => {
    setEditingMenuItem(item);
    setMenuFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || 'ทั่วไป',
      image: item.image || '',
      imageFile: null,
      dailyLimit: item.dailyLimit || '',
      isAvailable: item.isAvailable !== false,
      newCategory: ''
    });
    setShowMenuForm(true);
  };

  const filteredMenus = useMemo(() => {
    return menuItems.filter(m => {
      const name = (m.name || '').toLowerCase();
      const matchesSearch = name.includes(menuSearchTerm.toLowerCase());
      const matchesCategory = menuCategoryFilter === 'ทั้งหมด' || m.category === menuCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearchTerm, menuCategoryFilter]);

  return (
    <div className="admin-menu-container">
      <div className="menu-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>🍽️ จัดการเมนูอาหาร</h2>
        <button 
          className="btn-add-menu" 
          onClick={() => {
            setEditingMenuItem(null);
            setMenuFormData({ name: '', description: '', price: '', category: 'ทั่วไป', image: '', imageFile: null, dailyLimit: '', isAvailable: true, newCategory: '' });
            setShowMenuForm(true);
          }}
          style={{ padding: '10px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Plus size={18} /> เพิ่มเมนูใหม่
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}>
          <Search size={18} color="#666" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อเมนู..." 
            value={menuSearchTerm}
            onChange={(e) => setMenuSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', padding: '10px', width: '100%' }}
          />
        </div>
        <select 
          value={menuCategoryFilter} 
          onChange={(e) => setMenuCategoryFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
        >
          <option value="ทั้งหมด">ทั้งหมด</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Category Management Section */}
      <div className="category-management" style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#333' }}>🏷️ จัดการหมวดหมู่</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {availableCategories.map(category => {
            const itemCount = menuItems.filter(item => item.category === category).length;
            return (
              <div 
                key={category} 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                  {category} ({itemCount})
                </span>
                {itemCount === 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`ต้องการลบหมวดหมู่ "${category}" หรือไม่?`)) {
                        // หมวดหมู่นี้จะถูกลบออกจากรายการเมื่อรีเฟรช
                        alert('หมวดหมู่นี้จะถูกลบออกจากรายการเมื่อไม่มีเมนูใช้งาน');
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '2px 4px'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {loading ? <p style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดเมนู...</p> : (
        <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filteredMenus.map(item => (
            <div key={item._id || item.id} className="menu-card" style={{ padding: '15px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <img 
                src={item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace(/\/api$/, '')}${item.image}`) : '/placeholder.jpg'} 
                alt={item.name} 
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/160?text=No+Img'; }}
              />
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong>
                <span className="price" style={{ color: '#e65100', fontWeight: 'bold' }}>฿{item.price}</span>
              </div>
              <div className="category-badge" style={{ margin: '5px 0' }}>
                <span style={{ 
                  background: '#f0f9ff', 
                  color: '#0369a1', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {item.category || 'ทั่วไป'}
                </span>
              </div>
              <p className="description" style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px', minHeight: '40px' }}>{item.description || '-'}</p>
              
              <div className="card-manage" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => openEditForm(item)} style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <Edit size={16} /> แก้ไข
                </button>
                <button onClick={() => handleDeleteMenu(item._id || item.id)} style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <Trash2 size={16} /> ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไข เมนู */}
      {showMenuForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingMenuItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h3>
            <form onSubmit={handleMenuSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <input 
                type="text" 
                placeholder="ชื่อเมนู" 
                value={menuFormData.name} 
                onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})} 
                required 
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <textarea 
                placeholder="รายละเอียด" 
                value={menuFormData.description} 
                onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})} 
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="number" 
                  placeholder="ราคา (บาท)" 
                  value={menuFormData.price} 
                  onChange={(e) => setMenuFormData({...menuFormData, price: e.target.value})} 
                  required 
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
                
              </div>
              <select 
                value={menuFormData.category} 
                onChange={(e) => setMenuFormData({...menuFormData, category: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="">เลือกหมวดหมู่</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="__new__">+ เพิ่มหมวดหมู่ใหม่</option>
              </select>
              
              {menuFormData.category === '__new__' && (
                <input 
                  type="text" 
                  placeholder="ชื่อหมวดหมู่ใหม่" 
                  value={menuFormData.newCategory || ''}
                  onChange={(e) => setMenuFormData({...menuFormData, newCategory: e.target.value})}
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              )}
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>รูปภาพเมนู:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setMenuFormData({...menuFormData, imageFile: e.target.files[0]})}
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isAvailable"
                  checked={menuFormData.isAvailable} 
                  onChange={(e) => setMenuFormData({...menuFormData, isAvailable: e.target.checked})}
                />
                <label htmlFor="isAvailable">มีสินค้าพร้อมขาย</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>บันทึก</button>
                <button type="button" onClick={() => setShowMenuForm(false)} style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}