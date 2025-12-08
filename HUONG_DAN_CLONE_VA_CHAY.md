# 🚀 HƯỚNG DẪN CLONE VÀ CHẠY DỰ ÁN

> Hướng dẫn chi tiết từng bước để clone dự án VolunteerHub và chạy thành công với database có sẵn data

---

## ✅ YÊU CẦU TRƯỚC KHI BẮT ĐẦU

Đảm bảo máy tính đã cài đặt:

- ✅ **Node.js** (phiên bản 18 trở lên)
  - Kiểm tra: `node --version`
  - Download: https://nodejs.org/

- ✅ **PostgreSQL** (phiên bản 14 trở lên)
  - Kiểm tra: `psql --version`
  - Download: https://www.postgresql.org/download/

- ✅ **Git**
  - Kiểm tra: `git --version`
  - Download: https://git-scm.com/

- ✅ **npm** (đi kèm với Node.js)
  - Kiểm tra: `npm --version`

---

## 📥 BƯỚC 1: CLONE DỰ ÁN

```bash
# Clone repository (thay YOUR_REPO_URL bằng link repo thực tế)
git clone <YOUR_REPO_URL>

# Hoặc nếu đã có folder, cd vào folder
cd btlweb
```

---

## 🗄️ BƯỚC 2: SETUP DATABASE

### 2.1. Khởi động PostgreSQL

**Windows:**
```powershell
# Kiểm tra PostgreSQL có đang chạy không
Get-Service postgresql*

# Nếu chưa chạy, start service
Start-Service postgresql-x64-14
```

**Mac:**
```bash
# Kiểm tra
brew services list

# Start PostgreSQL
brew services start postgresql
```

**Linux:**
```bash
# Kiểm tra
sudo service postgresql status

# Start
sudo service postgresql start
```

### 2.2. Tạo Database

```bash
# Mở PostgreSQL shell
psql -U postgres

# Trong psql shell, chạy:
CREATE DATABASE volunteerhub;

# Kiểm tra đã tạo thành công
\l

# Thoát
\q
```

**Lưu ý:** 
- Nếu bị hỏi password, nhập password PostgreSQL của bạn
- Mặc định user là `postgres`, password thường là `postgres` hoặc để trống

---

## 🔧 BƯỚC 3: SETUP BACKEND

### 3.1. Cài đặt dependencies

```bash
# Di chuyển vào folder backend
cd backend

# Cài đặt packages
npm install
```

⏳ **Chờ khoảng 1-2 phút để cài đặt xong**

### 3.2. Tạo file .env

Tạo file mới tên `.env` trong folder `backend/` với nội dung sau:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volunteerhub?schema=public"

# JWT Configuration (dùng secret này hoặc tự tạo random string)
JWT_SECRET="volunteerhub-super-secret-key-2024-change-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# VAPID Keys for Web Push Notifications (tùy chọn, có thể bỏ qua nếu không dùng push notification)
VAPID_PUBLIC_KEY=BKxUBwXvp9mP6bSgVHE8PwqQGmMJLNY8L8FvN3mZKxYnYxH6Sp8jL3nKpR7m4LzWdE9
VAPID_PRIVATE_KEY=W0mD8fXvLqQhPkE7nR2tY9sZ5mCwQxN4jK8pLvB3fH6
VAPID_SUBJECT=mailto:admin@volunteerhub.com
```

**⚠️ QUAN TRỌNG: Thay đổi database credentials**

Trong `DATABASE_URL`, thay đổi:
- `postgres:postgres` → `username:password` (username và password PostgreSQL của bạn)
- Nếu password trống: `postgresql://postgres@localhost:5432/volunteerhub?schema=public`

**Ví dụ:**
```env
# Nếu username=postgres, password=mypassword123
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/volunteerhub?schema=public"

# Nếu password trống
DATABASE_URL="postgresql://postgres@localhost:5432/volunteerhub?schema=public"
```

### 3.3. Chạy Prisma Migrations

```bash
# Generate Prisma Client (tạo code để giao tiếp với database)
npm run prisma:generate

# Chạy migrations (tạo tables trong database)
npm run prisma:migrate

# Nếu bị hỏi tên migration, nhập: init
```

✅ **Kết quả:** Database sẽ có đầy đủ tables (User, Event, Registration, Post, Comment, v.v.)

### 3.4. Seed Data (Tạo dữ liệu mẫu)

```bash
# Chạy seed script để tạo data mẫu
npm run prisma:seed
```

✅ **Kết quả:** Database sẽ có:
- 3 users (Admin, Manager, Volunteer)
- Nhiều events mẫu
- Registrations mẫu
- Posts, Comments mẫu

### 3.5. Kiểm tra Database (Tùy chọn)

```bash
# Mở Prisma Studio để xem data
npm run prisma:studio
```

Browser sẽ mở `http://localhost:5555` - bạn có thể xem tất cả data trong database

**❌ Nếu gặp lỗi:**
```bash
# Nếu migration lỗi, reset và chạy lại
npm run prisma:migrate reset
# Chọn "yes" để confirm
npm run prisma:seed
```

### 3.6. Chạy Backend

```bash
# Chạy backend server
npm run dev
```

✅ **Thành công khi thấy:**
```
Server is running on port 3000
Database connected successfully
```

🌐 Backend đang chạy tại: **http://localhost:3000**

**🔴 GIỮ TERMINAL NÀY CHẠY, MỞ TERMINAL MỚI CHO BƯỚC TIẾP THEO**

---

## 🎨 BƯỚC 4: SETUP FRONTEND

### 4.1. Mở Terminal mới

Mở terminal/command prompt mới (giữ terminal backend chạy)

```bash
# Di chuyển vào folder frontend (từ root project)
cd frontend

# Hoặc nếu đang ở backend:
cd ../frontend
```

### 4.2. Cài đặt dependencies

```bash
npm install
```

⏳ **Chờ khoảng 1-2 phút để cài đặt xong**

### 4.3. Tạo file .env

Tạo file mới tên `.env` trong folder `frontend/` với nội dung:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Web Push Notifications (tùy chọn, dùng key giống backend)
VITE_VAPID_PUBLIC_KEY=BKxUBwXvp9mP6bSgVHE8PwqQGmMJLNY8L8FvN3mZKxYnYxH6Sp8jL3nKpR7m4LzWdE9

# Feature Flags (tùy chọn)
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REALTIME=true
```

### 4.4. Chạy Frontend

```bash
npm run dev
```

✅ **Thành công khi thấy:**
```
VITE vX.X.X  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

🌐 Frontend đang chạy tại: **http://localhost:5173**

---

## 🎉 BƯỚC 5: TRUY CẬP VÀ TEST

### 5.1. Mở Browser

Truy cập: **http://localhost:5173**

### 5.2. Đăng nhập với các tài khoản test

Sau khi seed data, bạn có 3 tài khoản để test:

#### 👑 Admin Account
```
Email: admin@volunteerhub.com
Password: 123456
```
**Quyền:** Quản trị toàn bộ hệ thống, duyệt events, quản lý users

#### 👨‍💼 Manager Account
```
Email: manager1@volunteerhub.com
Password: 123456
```
**Quyền:** Tạo và quản lý events, duyệt registrations

#### 👤 Volunteer Account
```
Email: volunteer1@volunteerhub.com
Password: 123456
```
**Quyền:** Xem events, đăng ký tham gia, comment, like

### 5.3. Test các tính năng

**✅ Tính năng cần test:**

1. **Login/Register:**
   - Đăng nhập với các tài khoản trên
   - Hoặc đăng ký tài khoản mới

2. **Events Page:**
   - Xem danh sách events
   - Search và filter events
   - Xem chi tiết event

3. **Registration:**
   - Đăng ký tham gia event (volunteer)
   - Duyệt registration (manager)

4. **Posts & Comments:**
   - Tạo post trong event
   - Comment vào post
   - Like/Unlike posts

5. **Dashboard:**
   - Xem statistics (admin/manager)
   - Xem events đã tham gia (volunteer)

6. **Admin Features:**
   - Duyệt/reject events
   - Quản lý users
   - Export data

---

## 📋 TÓM TẮT LỆNH CHẠY

### Lần đầu setup:

```bash
# Terminal 1 - Backend
cd backend
npm install
# Tạo .env file
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
# Tạo .env file
npm run dev
```

### Các lần sau (khi đã setup xong):

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## ❌ TROUBLESHOOTING - XỬ LÝ LỖI

### Lỗi 1: Port 3000 đã được sử dụng

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Giải pháp (Windows):**
```powershell
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

**Giải pháp (Mac/Linux):**
```bash
# Kill process đang dùng port 3000
lsof -ti:3000 | xargs kill -9
```

### Lỗi 2: Không kết nối được database

**Error:**
```
Error: Can't reach database server at `localhost:5432`
```

**Giải pháp:**
1. Kiểm tra PostgreSQL đã chạy chưa
2. Kiểm tra `DATABASE_URL` trong `.env` đúng chưa
3. Kiểm tra username/password PostgreSQL
4. Thử kết nối thủ công: `psql -U postgres -d volunteerhub`

### Lỗi 3: Prisma migration failed

**Error:**
```
Error: Migration failed
```

**Giải pháp:**
```bash
cd backend

# Xóa database và tạo lại (⚠️ Mất hết data)
npm run prisma:migrate reset

# Hoặc xóa migrations folder và chạy lại
rm -rf prisma/migrations
npm run prisma:migrate dev --name init
npm run prisma:seed
```

### Lỗi 4: Frontend không connect được Backend

**Error trong Console:**
```
Network Error / ERR_CONNECTION_REFUSED
```

**Giải pháp:**
1. Kiểm tra backend đã chạy chưa (http://localhost:3000)
2. Kiểm tra `VITE_API_URL` trong frontend `.env`
3. Clear browser cache và reload
4. Kiểm tra CORS settings

### Lỗi 5: Module not found

**Error:**
```
Error: Cannot find module 'XXX'
```

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Lỗi 6: Prisma Client không được generate

**Error:**
```
Cannot find module '@prisma/client'
```

**Giải pháp:**
```bash
cd backend
npm run prisma:generate
```

### Lỗi 7: npm không được nhận diện (Windows)

**Error:**
```
'npm' is not recognized as an internal or external command
```

**Giải pháp:**
1. Cài lại Node.js từ https://nodejs.org/
2. Restart terminal/computer
3. Kiểm tra PATH environment variable

---

## 🔍 KIỂM TRA HỆ THỐNG

### Test Backend hoạt động:

```bash
# Test API endpoint
curl http://localhost:3000/api/events

# Hoặc mở browser:
# http://localhost:3000/api/events
```

Nếu trả về JSON với danh sách events → Backend OK ✅

### Test Frontend hoạt động:

Mở browser: http://localhost:5173

Nếu thấy trang login/home → Frontend OK ✅

### Test Database có data:

```bash
cd backend
npm run prisma:studio
```

Mở http://localhost:5555, kiểm tra:
- User table có 3 users ✅
- Event table có events ✅
- Registration table có registrations ✅

---

## 📞 HỖ TRỢ

Nếu vẫn gặp lỗi sau khi thử các cách trên:

1. **Đọc error message kỹ** - thường có gợi ý giải pháp
2. **Check các file documentation khác:**
   - `SETUP_GUIDE.md` - Hướng dẫn setup chi tiết
   - `HUONG_DAN_CONFIG_DEV.md` - Cấu hình development
   - `README.md` - Overview dự án
   - `ISSUES_AND_BUGS.md` - Các lỗi đã biết

3. **Google error message** - thường có người khác gặp lỗi tương tự
4. **Hỏi người tạo dự án** - cung cấp:
   - Error message đầy đủ
   - Screenshot nếu có
   - Bước nào bị lỗi
   - Hệ điều hành đang dùng

---

## ✅ CHECKLIST - KIỂM TRA TRƯỚC KHI CHẠY

- [ ] Node.js đã cài (>= 18.x)
- [ ] PostgreSQL đã cài (>= 14.x)
- [ ] Git đã cài
- [ ] PostgreSQL service đang chạy
- [ ] Database `volunteerhub` đã được tạo
- [ ] Backend: đã `npm install`
- [ ] Backend: file `.env` đã tạo với đúng credentials
- [ ] Backend: đã chạy `prisma:generate`
- [ ] Backend: đã chạy `prisma:migrate`
- [ ] Backend: đã chạy `prisma:seed`
- [ ] Backend: server chạy thành công (port 3000)
- [ ] Frontend: đã `npm install`
- [ ] Frontend: file `.env` đã tạo
- [ ] Frontend: server chạy thành công (port 5173)
- [ ] Browser: truy cập được http://localhost:5173
- [ ] Login: đăng nhập được với tài khoản test

---

## 🎯 FLOW HOÀN CHỈNH

```
1. Clone repo
   ↓
2. Setup PostgreSQL & tạo database
   ↓
3. cd backend → npm install → tạo .env
   ↓
4. Chạy Prisma: generate → migrate → seed
   ↓
5. npm run dev (backend)
   ↓
6. cd frontend → npm install → tạo .env
   ↓
7. npm run dev (frontend)
   ↓
8. Mở http://localhost:5173
   ↓
9. Login với tài khoản test
   ↓
10. DONE! 🎉
```

---

## 🚀 QUICK START (TL;DR)

Nếu bạn đã quen với Node.js & PostgreSQL:

```bash
# 1. Setup Database
psql -U postgres
CREATE DATABASE volunteerhub;
\q

# 2. Backend
cd backend
npm install
# Tạo .env với DATABASE_URL
npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed
npm run dev

# 3. Frontend (terminal mới)
cd frontend
npm install
# Tạo .env với VITE_API_URL
npm run dev

# 4. Truy cập http://localhost:5173
# Login: admin@volunteerhub.com / 123456
```

---

**Chúc bạn setup thành công! 🎉**

*Nếu có thắc mắc, đừng ngại hỏi!*

