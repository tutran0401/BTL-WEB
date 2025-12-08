# 🚀 HƯỚNG DẪN SETUP DỰ ÁN VOLUNTEERHUB

## 📋 Yêu cầu hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

---

## 🔧 SETUP BACKEND

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Tạo file .env
Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/volunteerhub?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# VAPID Keys for Web Push Notifications
# Generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
VAPID_SUBJECT=mailto:admin@volunteerhub.com
```

### 3. Generate VAPID Keys cho Web Push
```bash
cd backend
npx web-push generate-vapid-keys
```

Copy 2 keys (public và private) vào file `.env`

### 4. Setup Database
```bash
# Tạo database PostgreSQL
psql -U postgres
CREATE DATABASE volunteerhub;
\q

# Chạy Prisma migrations
npm run prisma:generate
npm run prisma:migrate

# Seed sample data (optional nhưng recommended)
npm run prisma:seed
```

### 5. Chạy Backend
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

---

## 🎨 SETUP FRONTEND

### 1. Cài đặt dependencies
```bash
cd frontend
npm install
```

### 2. Tạo file .env
Tạo file `.env` trong thư mục `frontend/` với nội dung:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Web Push Notifications (VAPID Public Key from backend)
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here

# Optional: Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REALTIME=true
```

**Lưu ý**: `VITE_VAPID_PUBLIC_KEY` phải giống với `VAPID_PUBLIC_KEY` trong backend `.env`

### 3. Chạy Frontend
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🧪 TEST ACCOUNTS (sau khi seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@volunteerhub.com | 123456 |
| Manager | manager1@volunteerhub.com | 123456 |
| Volunteer | volunteer1@volunteerhub.com | 123456 |

---

## 🔍 TROUBLESHOOTING

### Backend không chạy được

**Problem**: Database connection error
```
Error: Can't reach database server at `localhost:5432`
```

**Solution**: 
- Kiểm tra PostgreSQL đã chạy chưa: `sudo service postgresql status`
- Kiểm tra DATABASE_URL trong .env đúng chưa
- Kiểm tra username/password PostgreSQL

---

**Problem**: Prisma migration lỗi
```
Error: Migration failed
```

**Solution**:
```bash
# Reset database (Warning: xóa hết data)
npm run prisma:migrate reset

# Hoặc xóa migrations folder và chạy lại
rm -rf prisma/migrations
npm run prisma:migrate dev --name init
```

---

**Problem**: Port 3000 đã được sử dụng
```
Error: Port 3000 is already in use
```

**Solution**: Đổi PORT trong `.env` thành port khác (vd: 3001)

---

### Frontend không chạy được

**Problem**: Cannot connect to backend
```
Network Error
```

**Solution**:
- Kiểm tra backend đã chạy chưa
- Kiểm tra VITE_API_URL trong .env đúng chưa
- Kiểm tra CORS settings trong backend

---

**Problem**: Web Push không hoạt động
```
VAPID public key not configured
```

**Solution**:
- Kiểm tra đã generate VAPID keys chưa
- Kiểm tra VITE_VAPID_PUBLIC_KEY trong frontend .env
- Kiểm tra VAPID_PUBLIC_KEY và VAPID_PRIVATE_KEY trong backend .env

---

## 📱 TEST WEB PUSH NOTIFICATIONS

1. Đăng nhập vào app
2. Cho phép notifications trong browser
3. Có thể test bằng cách:
   - Đăng ký sự kiện (Manager sẽ nhận notification)
   - Manager approve registration (Volunteer sẽ nhận notification)
   - Admin approve event (Manager sẽ nhận notification)

---

## 🎯 FEATURES ĐÃ IMPLEMENT

### Backend (100%)
- ✅ Authentication (Register, Login, JWT)
- ✅ User Management (CRUD, Profile)
- ✅ Event Management (CRUD, Approve/Reject)
- ✅ Registration System (Register, Cancel, Approve, Complete)
- ✅ Posts, Comments, Likes
- ✅ Notifications với Web Push
- ✅ Dashboard với Statistics
- ✅ Socket.io cho Real-time
- ✅ Middleware (Auth, Validation, Error Handling)
- ✅ Validators (Joi)
- ✅ Seed Data

### Frontend (75%)
- ✅ Authentication UI (Login, Register)
- ✅ Events Page với Search & Filter (category + date/time)
- ✅ Common Components (Button, Card, Modal, Loading)
- ✅ Axios Interceptors
- ✅ Protected Routes
- ✅ Zustand Store
- ✅ Service Worker & Web Push Setup
- ✅ useNotifications Hook
- ⚠️ Dashboard Page (structure có, cần implement chi tiết)
- ⚠️ Profile Page (structure có, cần implement chi tiết)
- ⚠️ MyEvents Page (cần implement)
- ⚠️ ManageEvents Page (cần implement)
- ⚠️ AdminDashboard Page (cần implement)
- ⚠️ EventDetail Page (cần thêm post/comment/like UI)

---

## 📝 NEXT STEPS

### Priority 1 (Cần làm ngay)
1. Implement các pages còn thiếu:
   - DashboardPage (với statistics)
   - ProfilePage (xem và edit profile)
   - MyEventsPage (volunteer)
   - ManageEventsPage (manager)
   - AdminDashboardPage

2. EventDetailPage - thêm:
   - Post creation form
   - Posts feed
   - Comment system
   - Like functionality

### Priority 2 (Nice to have)
1. Error Boundaries
2. Loading states improvement
3. Form validation với React Hook Form
4. Unit tests
5. API documentation (Swagger)
6. Deployment scripts

---

## 🔐 SECURITY NOTES

- JWT secret phải đổi trong production
- Database credentials phải secure
- VAPID keys phải khác nhau giữa dev và production
- File .env KHÔNG được commit vào git (đã có trong .gitignore)

---

## 📞 SUPPORT

Nếu gặp vấn đề, check:
1. File ISSUES_AND_BUGS.md để xem bugs đã biết
2. File PLAN.md để xem roadmap
3. File PROJECT_STRUCTURE.md để hiểu cấu trúc

---

**Good luck! 🚀**

