import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Clock, MapPin, Phone, ChefHat, LogIn, LogOut, User, Sparkles } from 'lucide-react';
import './HomePage.css';
import { menuService, API_BASE_URL } from './services/api';
import { useAuth } from './contexts/AuthContext';

const RestaurantHome = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const raw = await menuService.getAll();
        const data = Array.isArray(raw) ? raw : (raw?.data || raw || []);

        if (Array.isArray(data) && data.length > 0) {
          const formattedData = data.map(item => ({
            id: item._id || item.id,
            name: item.name || item.title || '',
            price: typeof item.price === 'number' ? `${item.price} บาท` : (item.price || ''),
            description: item.description || item.desc || '',
            category: item.category || 'ทั่วไป',
            image: item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace(/\/api$/, '')}${item.image}`) : (item.imageUrl || '')
          }));
          setMenuItems(formattedData);
        } else {
          setMenuItems([]);
        }
      } catch (error) {
        console.warn('Error fetching menu:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="restaurant-home">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ cursor: 'pointer' }}>
            <img 
              src="/image/logo3.png" 
              alt="อนงค์" 
              className="nav-logo"
              style={{ 
                width: '50px', 
                height: '50px', 
                objectFit: 'contain' 
              }} 
            />
            <span className="nav-title">อนงค์</span>
          </div>
          
          <div className="nav-links">
            <a href="#home" onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('home');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>หน้าแรก</a>
            <a href="#menu" onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('menu');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>เมนูอาหาร</a>
            <a href="#about" onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('about');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>เกี่ยวกับเรา</a>
            <a href="#contact" onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('contact');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>ติดต่อ</a>
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/profile')} className="nav-user">
                  <User size={18} />
                  {user?.name || user?.email || 'ผู้ใช้'}
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="nav-btn nav-admin-btn">
                    Admin Panel
                  </button>
                )}
                <button onClick={handleLogout} className="nav-btn nav-logout-btn">
                  <LogOut size={18} />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="nav-btn nav-login-btn">
                <LogIn size={18} />
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="nav-mobile">
            <a href="#home" onClick={() => setIsMenuOpen(false)}>หน้าแรก</a>
            <a href="#menu" onClick={() => setIsMenuOpen(false)}>เมนูอาหาร</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>เกี่ยวกับเรา</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>ติดต่อ</a>
            {isAuthenticated ? (
              <>
                <button onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}>
                  <User size={18} /> {user?.name || user?.email || 'ผู้ใช้'}
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => { setIsMenuOpen(false); navigate('/admin'); }}>
                       Admin Panel
                  </button>
                )}
                <button onClick={handleLogout}>
                  <LogOut size={18} /> ออกจากระบบ
                </button>
              </>
            ) : (
              <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                <LogIn size={18} /> เข้าสู่ระบบ
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-badge">
            <Sparkles className="hero-badge-icon" />
            <span className="hero-badge-text">อาหารไทยแท้</span>
          </div>
          <h1 className="hero-title">
            ยินดีต้อนรับสู่<br />ร้านอาหารไทยอนงค์
          </h1>
          <p className="hero-subtitle">
            อาหารไทยแท้ รสชาติดั้งเดิม ที่คุณจะหลงรัก<br />
            ทุกจานคือศิลปะแห่งรสชาติ
          </p>
          <div className="hero-cta">
            <button 
              className="hero-button hero-button-primary"
              onClick={() => navigate('/App')}
            >
              สั่งอาหารเลย
            </button>
            <button 
              className="hero-button hero-button-secondary"
              onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
            >
              ดูเมนูทั้งหมด
            </button>
          </div>
          {!isAuthenticated && (
            <p className="hero-note">
              * ต้องเข้าสู่ระบบก่อนทำการสั่งอาหาร
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <div className="section-subtitle">ทำไมต้องเลือกเรา</div>
            <h2 className="section-title">จุดเด่นของเรา</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img 
                  src="/image/lol.jpg" 
                  alt="สูตรต้นตำรับ" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'cover', 
                    borderRadius: '50%' 
                  }} 
                />
              </div>
              <h3 className="feature-title">สูตรต้นตำรับ</h3>
              <p className="feature-desc">ทุกเมนูคัดสรรวัตถุดิบชั้นเยี่ยม ปรุงด้วยสูตรดั้งเดิมที่สืบทอดมาหลายรุ่น</p>
            </div>
            <div className="feature-card">
             <img 
                  src="/image/download.png" 
                  alt="สูตรต้นตำรับ" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'cover', 
                    borderRadius: '50%' 
                  }} 
                />
              <h3 className="feature-title">คุณภาพระดับพรีเมียม</h3>
              <p className="feature-desc">มาตรฐานสูง ใส่ใจทุกรายละเอียด ตั้งแต่การคัดสรรวัตถุดิบจนถึงการนำเสนอ</p>
            </div>
            <div className="feature-card">
             <img 
                  src="/image/speed2.jpg" 
                  alt="สูตรต้นตำรับ" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'cover', 
                    borderRadius: '50%' 
                  }} 
                />
              <h3 className="feature-title">บริการรวดเร็ว</h3>
              <p className="feature-desc">สั่งง่าย ได้เร็ว พร้อมระบบจัดการออเดอร์ที่ทันสมัยและมีประสิทธิภาพ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="menu-section">
        <div className="section-header">
          <div className="section-subtitle">รายการอาหาร</div>
          <h2 className="section-title">เมนูอาหาร</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>กำลังโหลดเมนู...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>ไม่มีเมนูอาหารในขณะนี้</p>
            <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.6)', marginTop: '0.5rem' }}>กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        ) : (
          <div>
            {/* category tabs */}
            <div className="category-tabs">
              {['ทั้งหมด', ...Array.from(new Set(menuItems.map(i => i.category)))].map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="menu-grid">
              {menuItems
                .filter(item => categoryFilter === 'ทั้งหมด' || item.category === categoryFilter)
                .map((item) => (
                  <div key={item.id} className="menu-card">
                <div className="menu-card-image-wrapper">
                  <img src={item.image} alt={item.name} className="menu-card-image" />
                  <div className="menu-card-badge">แนะนำ</div>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-description">{item.description}</p>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">{item.price}</span>
                    <button 
                      className="menu-card-button"
                      onClick={() => navigate('/App')}
                    >
                      สั่งเลย
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-grid">
            <div className="about-content">
              <h2>เกี่ยวกับเรา</h2>
              <p>
                ร้านอาหารของเราก่อตั้งขึ้นด้วยความตั้งใจที่จะถ่ายทอดเสน่ห์ของอาหารไทยแท้
                 ผ่านรสชาติที่พิถีพิถันและวัตถุดิบคุณภาพสดใหม่ 
                 เราให้ความสำคัญกับทุกขั้นตอนการปรุง เพื่อคงเอกลักษณ์ความเป็นไทย 
                 ทั้งความกลมกล่อมของรสชาติและความสวยงามของการจัดจาน
              </p>
              <p>
                เราคัดสรรวัตถุดิบจากแหล่งที่ได้มาตรฐาน พร้อมผสมผสานสมุนไพรไทยอย่างลงตัวเพื่อให้ลูกค้าได้สัมผัสประสบการณ์อาหารไทยที่แท้จริง
                 ไม่ว่าจะเป็นเมนูยอดนิยมอย่างผัดไทย ต้มยำ หรือแกงต่าง ๆ
                บรรยากาศร้านของเราอบอุ่น เป็นกันเอง เหมาะสำหรับการรับประทานอาหารกับครอบครัว เพื่อน 
                หรือโอกาสพิเศษต่าง ๆ
เพราะเราเชื่อว่า อาหารที่ดี ไม่ได้อร่อยแค่รสชาติ แต่ต้องอร่อยด้วยความใส่ใจ
              </p>
            </div>
            <div className="about-image-wrapper">
              <div className="about-image-decoration"></div>
              <div className="about-image">
              <img 
                src="/image/logo1.png" 
                alt="ร้านอาหารญี่ปุ่น" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '8px' 
                }} 
              />
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: 'white' }}>ติดต่อเรา</h2>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <Clock className="contact-icon" />
              <h3>เวลาทำการ</h3>
              <p>จันทร์ - ศุกร์: 09:00 - 23:00</p>
              <p>เสาร์ - อาทิตย์: 10:00 - 22:00</p>
            </div>
            <div className="contact-card">
              <MapPin className="contact-icon" />
              <h3>ที่อยู่</h3>
              <p>เลขที่ 512 ถนนภูเก็ต ตำบลตลาดใหญ่  </p>
              <p>อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 </p>
            </div>
            <div className="contact-card">
              <Phone className="contact-icon" />
              <h3>โทรศัพท์</h3>
              <p>012-345-6789</p>
              <p>098-765-4321</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">ร้านอนงค์</div>
          <p>&copy; 2026 ร้านอนงค์.สงวนลิขสิทธิ์.</p>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantHome;