# 🔐 ENVIRONMENT VARIABLES TEMPLATE

> File này chứa template cho các file `.env` cần thiết. Copy nội dung tương ứng vào file `.env` của backend và frontend.

---

## 📁 Backend `.env`

Tạo file `backend/.env` với nội dung sau:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
# ⚠️ QUAN TRỌNG: Thay đổi username và password theo PostgreSQL của bạn
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volunteerhub?schema=public"

# Ví dụ nếu password trống:
# DATABASE_URL="postgresql://postgres@localhost:5432/volunteerhub?schema=public"

# Ví dụ với password khác:
# DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/volunteerhub?schema=public"

# ============================================
# JWT CONFIGURATION
# ============================================
# Secret key để mã hóa JWT tokens
# ⚠️ Production: Phải đổi thành random string dài và phức tạp
JWT_SECRET="volunteerhub-super-secret-key-2024-change-in-production"

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# CORS CONFIGURATION
# ============================================
FRONTEND_URL=http://localhost:5173

# ============================================
# WEB PUSH NOTIFICATIONS (Optional - có thể bỏ qua)
# ============================================
# Dùng keys mẫu dưới đây hoặc generate mới: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=BKxUBwXvp9mP6bSgVHE8PwqQGmMJLNY8L8FvN3mZKxYnYxH6Sp8jL3nKpR7m4LzWdE9
VAPID_PRIVATE_KEY=W0mD8fXvLqQhPkE7nR2tY9sZ5mCwQxN4jK8pLvB3fH6
VAPID_SUBJECT=mailto:admin@volunteerhub.com
```

### 📝 Hướng dẫn điền DATABASE_URL:

1. **Tìm username PostgreSQL của bạn:**
   - Mặc định thường là `postgres`
   - Hoặc user bạn đã tạo khi cài PostgreSQL

2. **Tìm password PostgreSQL của bạn:**
   - Password bạn đặt khi cài PostgreSQL
   - Nếu để trống khi cài, có thể bỏ phần `:password`

3. **Test connection:**
   ```bash
   psql -U postgres -d volunteerhub
   # Nếu kết nối được → username/password đúng
   ```

4. **Format đúng:**
   ```
   postgresql://[USERNAME]:[PASSWORD]@localhost:5432/volunteerhub?schema=public
   ```

### ⚠️ Các lỗi thường gặp:

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| `Can't reach database server` | PostgreSQL chưa chạy | Start PostgreSQL service |
| `Authentication failed` | Sai username/password | Kiểm tra lại credentials |
| `Database does not exist` | Chưa tạo database | Chạy `CREATE DATABASE volunteerhub;` |
| `Port 5432 in use` | Port conflict | Đổi port hoặc stop service khác |

---

## 🎨 Frontend `.env`

Tạo file `frontend/.env` với nội dung sau:

```env
# ============================================
# API CONFIGURATION
# ============================================
# URL của backend API (phải trỏ đến backend đang chạy)
VITE_API_URL=http://localhost:3000/api

# URL của Socket.io server
VITE_SOCKET_URL=http://localhost:3000

# ============================================
# WEB PUSH NOTIFICATIONS (Optional)
# ============================================
# ⚠️ Phải giống với VAPID_PUBLIC_KEY trong backend/.env
VITE_VAPID_PUBLIC_KEY=BKxUBwXvp9mP6bSgVHE8PwqQGmMJLNY8L8FvN3mZKxYnYxH6Sp8jL3nKpR7m4LzWdE9

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REALTIME=true
```

### 📝 Lưu ý:

- Tất cả biến trong frontend phải bắt đầu bằng `VITE_`
- `VITE_API_URL` phải trỏ đến backend đang chạy
- `VITE_VAPID_PUBLIC_KEY` phải giống backend nếu dùng push notifications

---

## 🚀 QUICK SETUP

### Cách 1: Copy thủ công

**Backend:**
```bash
cd backend
# Tạo file .env và copy nội dung từ phần Backend .env ở trên
# Nhớ thay DATABASE_URL với credentials của bạn
```

**Frontend:**
```bash
cd frontend
# Tạo file .env và copy nội dung từ phần Frontend .env ở trên
```

### Cách 2: Dùng Command Line (nhanh hơn)

**Windows PowerShell:**
```powershell
# Backend
cd backend
New-Item -Path . -Name ".env" -ItemType "file"
# Sau đó mở file .env và paste nội dung

# Frontend
cd ../frontend
New-Item -Path . -Name ".env" -ItemType "file"
# Sau đó mở file .env và paste nội dung
```

**Mac/Linux:**
```bash
# Backend
cd backend
touch .env
nano .env  # hoặc vim .env, hoặc code .env
# Paste nội dung và save

# Frontend
cd ../frontend
touch .env
nano .env
# Paste nội dung và save
```

---

## 🔍 KIỂM TRA .env ĐÃ ĐÚNG

### Test Backend .env:

```bash
cd backend

# Test 1: Kiểm tra file tồn tại
ls -la | grep .env
# Kết quả: .env

# Test 2: Xem nội dung (không hiển thị nếu sensitive)
# cat .env

# Test 3: Test kết nối database
npm run prisma:generate
# Nếu thành công → DATABASE_URL đúng
```

### Test Frontend .env:

```bash
cd frontend

# Test 1: Kiểm tra file tồn tại
ls -la | grep .env
# Kết quả: .env

# Test 2: Chạy dev server
npm run dev
# Nếu không có warning về env vars → OK
```

---

## 📋 CHECKLIST

Trước khi chạy dự án, đảm bảo:

**Backend `.env`:**
- [ ] File `backend/.env` đã được tạo
- [ ] `DATABASE_URL` có username/password đúng
- [ ] `DATABASE_URL` trỏ đến database `volunteerhub`
- [ ] `JWT_SECRET` đã được đặt
- [ ] `PORT=3000`
- [ ] `FRONTEND_URL=http://localhost:5173`

**Frontend `.env`:**
- [ ] File `frontend/.env` đã được tạo
- [ ] `VITE_API_URL=http://localhost:3000/api`
- [ ] `VITE_SOCKET_URL=http://localhost:3000`
- [ ] (Optional) `VITE_VAPID_PUBLIC_KEY` giống backend

---

## 🔐 BẢO MẬT

### ⚠️ QUAN TRỌNG:

- ❌ **KHÔNG BAO GIỜ** commit file `.env` vào Git
- ❌ **KHÔNG BAO GIỜ** share file `.env` công khai
- ✅ File `.env` đã được thêm vào `.gitignore`
- ✅ Chỉ share template (file này) với team

### Production Environment:

Khi deploy lên production, nhớ:
- Đổi `JWT_SECRET` thành random string dài (>= 32 ký tự)
- Đổi `DATABASE_URL` thành database production
- Đổi `NODE_ENV=production`
- Generate VAPID keys mới
- Đổi `FRONTEND_URL` thành domain thực

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề với environment variables:

1. **Kiểm tra file .env có đúng vị trí:**
   - Backend: `backend/.env` (cùng folder với `package.json`)
   - Frontend: `frontend/.env` (cùng folder với `package.json`)

2. **Kiểm tra không có lỗi syntax:**
   - Không có dấu cách thừa
   - Không có dấu ngoặc kép sai
   - Format đúng: `KEY=value` (không có space quanh dấu `=`)

3. **Restart servers sau khi đổi .env:**
   ```bash
   # Stop servers (Ctrl+C)
   # Start lại
   npm run dev
   ```

4. **Clear cache nếu cần:**
   ```bash
   # Backend
   rm -rf node_modules
   npm install
   
   # Frontend
   rm -rf node_modules .vite
   npm install
   ```

---

**Good luck! 🚀**

