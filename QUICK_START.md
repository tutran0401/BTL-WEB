# 🚀 QUICK START - VolunteerHub

Hướng dẫn setup nhanh để chạy dự án trong 10 phút!

## ⚡ Prerequisites

Đảm bảo đã cài đặt:
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

## 📦 Installation

### 1. Clone & Install

```bash
# Di chuyển vào thư mục dự án
cd btlweb

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Database

```bash
# Mở PostgreSQL và tạo database
psql -U postgres
CREATE DATABASE volunteerhub;
\q
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/volunteerhub?schema=public"
JWT_SECRET="your-secret-key-change-this"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
```

File `frontend/.env` (thường không cần sửa):
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Setup Database Schema

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Sẽ chạy tại: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Sẽ chạy tại: http://localhost:5173

## 🎉 You're Done!

Mở trình duyệt và truy cập: **http://localhost:5173**

## 👤 Test Accounts

Sau khi chạy, đăng ký các accounts sau để test:

### Account 1: Volunteer
- Email: volunteer@test.com
- Password: 123456
- Role: Tình nguyện viên

### Account 2: Event Manager
- Email: manager@test.com
- Password: 123456
- Role: Quản lý sự kiện

### Account 3: Admin
- Email: admin@test.com
- Password: 123456
- Role: Admin

## 🐛 Troubleshooting

### Lỗi kết nối database
```bash
# Check PostgreSQL đang chạy
# Windows:
services.msc  # Tìm PostgreSQL

# Mac:
brew services list

# Linux:
sudo systemctl status postgresql
```

### Lỗi port đã sử dụng
```bash
# Thay đổi port trong .env files
# Backend: PORT=3001
# Frontend: Sửa trong vite.config.ts
```

### Lỗi Prisma
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Reset database
```bash
cd backend
npx prisma migrate reset
npm run prisma:migrate
```

## 📚 Next Steps

1. Đọc [README.md](./README.md) để hiểu project structure
2. Đọc [PLAN.md](./PLAN.md) để xem kế hoạch 3 tuần
3. Bắt đầu code theo plan!

## 💡 Useful Commands

```bash
# Backend
npm run dev          # Run development server
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio (Database GUI)

# Frontend
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🆘 Need Help?

- Check README.md
- Check PLAN.md
- Google the error
- Ask team members

**Happy Coding! 🚀**

