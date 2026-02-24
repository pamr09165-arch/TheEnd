# คู่มือการเชื่อมต่อ Frontend กับ Backend

## 📋 วิธีการตั้งค่า

### 1. สร้างไฟล์ `.env`

สร้างไฟล์ `.env` ในโฟลเดอร์ root ของโปรเจกต์ (ระดับเดียวกับ `package.json`) และเพิ่ม:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**หมายเหตุ:** เปลี่ยน URL เป็น URL ของ backend ของคุณ

### 2. รูปแบบข้อมูลที่ Backend ควรส่งกลับมา

#### เมนูอาหาร (GET /api/menu)
```json
[
  {
    "id": "1",
    "name": "ซูชิแซลมอน",
    "price": 120,
    "description": "เส้นผัดไทยแท้รสชาติดั้งเดิม",
    "image": "/image/salmon-sushi.jpg"
  },
  {
    "id": "2",
    "name": "ซาชิมิ",
    "price": 180,
    "description": "ต้มยำกุ้งน้ำใส รสจัดจ้าน",
    "image": ""
  }
]
```

#### ช่วงเวลา (GET /api/time-slots)
```json
[
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00"
]
```

#### สร้างการจอง (POST /api/reservations)
**Request Body:**
```json
{
  "date": "2024-12-25",
  "timeSlot": "18:00-19:00",
  "people": 2,
  "name": "ภัทรดนัย หล่อเท่",
  "phone": "0812345678",
  "note": "ขอที่นั่งริมหน้าต่าง",
  "items": [
    {
      "id": "padthai",
      "name": "ซูชิแซลมอน",
      "price": 120,
      "qty": 2
    }
  ],
  "total": 240
}
```

**Response:**
```json
{
  "id": "reservation-id-123",
  "message": "จองสำเร็จ"
}
```

## 🔧 API Endpoints ที่ Frontend ใช้

### เมนูอาหาร
- `GET /api/menu` - ดึงเมนูทั้งหมด
- `GET /api/menu/:id` - ดึงเมนูตาม ID

### การจอง
- `POST /api/reservations` - สร้างการจองใหม่
- `GET /api/reservations` - ดึงการจองทั้งหมด
- `GET /api/reservations/:id` - ดึงการจองตาม ID
- `PUT /api/reservations/:id` - อัปเดตการจอง
- `DELETE /api/reservations/:id` - ลบการจอง

### 
### ช่วงเวลา
- `GET /api/time-slots` - ดึงช่วงเวลาทั้งหมด

## 🛠️ ไฟล์ที่เกี่ยวข้อง

- `src/config/api.js` - ตั้งค่า API endpoints
- `src/services/api.js` - ฟังก์ชันสำหรับเรียก API
- `src/pages/App.jsx` - หน้า form การจอง (ใช้ API)
- `src/HomePage.jsx` - หน้าแรก (ดึงเมนูจาก API)

## 📝 หมายเหตุ

- Frontend จะใช้ข้อมูล default ถ้า backend ไม่พร้อมหรือไม่สามารถเชื่อมต่อได้
- ตรวจสอบ Console ใน Browser Developer Tools เพื่อดู error messages
- ตรวจสอบว่า backend รองรับ CORS ถ้า frontend และ backend อยู่คนละ domain

## 🔍 การแก้ปัญหา

### ไม่สามารถเชื่อมต่อกับ backend ได้
1. ตรวจสอบว่า backend กำลังรันอยู่
2. ตรวจสอบ URL ในไฟล์ `.env` ว่าถูกต้อง
3. ตรวจสอบ CORS settings ใน backend
4. ดู Console ใน Browser เพื่อดู error messages

### ข้อมูลไม่แสดง
- Frontend จะใช้ข้อมูล default ถ้า backend ไม่ส่งข้อมูลกลับมาAdmin APIs (เฉพาะผู้ดูแลระบบ)
- `GET /api/admin/users` - ดึงผู้ใช้ทั้งหมด
- `POST /api/admin/users` - สร้างผู้ใช้ใหม่
- `PATCH /api/admin/users/:id` - อัปเดตข้อมูลผู้ใช้
- `DELETE /api/admin/users/:id` - ลบผู้ใช้
- `PATCH /api/admin/users/:id/status` - เปลี่ยนสถานะผู้ใช้ (active/suspended)
- `PATCH /api/admin/users/:id/role` - เปลี่ยนสิทธิ์ผู้ใช้ (admin/staff/user)
- `GET /api/admin/users/:id/bookings` - ดูประวัติการจองของผู้ใช้
- `GET /api/admin/bookings` - ดึงการจองทั้งหมด (สำหรับ admin)
- `PATCH /api/admin/bookings/:id/status` - อัปเดตสถานะการจอง
- `GET /api/admin/stats` - ดึงสถิติระบบ

- ตรวจสอบว่า backend ส่งข้อมูลในรูปแบบที่ถูกต้อง (ดูด้านบน)

### ปัญหา MongoDB Atlas Connection
ถ้า backend แสดง error เกี่ยวกับ MongoDB Atlas connection:
- ดูคู่มือแก้ไขในไฟล์ `MONGODB_ATLAS_FIX.md`
- ปัญหาส่วนใหญ่เกิดจาก IP address ไม่ได้อยู่ใน whitelist
- เพิ่ม IP address ของคุณใน MongoDB Atlas Network Access

