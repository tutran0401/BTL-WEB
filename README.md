# VolunteerHub - Nhiệt huyết tình nguyện viên 🌱

Nền tảng web hỗ trợ tổ chức và quản lý các hoạt động tình nguyện, kết nối tình nguyện viên với các sự kiện ý nghĩa.

## 📋 Mô tả dự án

VolunteerHub là ứng dụng web toàn diện giúp:
- **Tình nguyện viên**: Tìm kiếm, đăng ký và tham gia các hoạt động tình nguyện
- **Quản lý sự kiện**: Tạo, quản lý và theo dõi các hoạt động tình nguyện
- **Admin**: Quản trị hệ thống, duyệt sự kiện và quản lý người dùng

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Real-time**: Socket.io + Web Push API

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### 1. Clone repository

```bash
cd btlweb
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

#### Cấu hình database

1. Tạo database PostgreSQL:
```sql
CREATE DATABASE volunteerhub;
```

2. Copy file `.env.example` thành `.env` và cấu hình:
```bash
cp .env.example .env
```

3. Chỉnh sửa file `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/volunteerhub?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

4. Chạy Prisma migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. (Tùy chọn) Mở Prisma Studio để xem database:
```bash
npm run prisma:studio
```

#### Chạy Backend

```bash
# Development mode
npm run dev

# Build
npm run build

# Production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
```

#### Cấu hình frontend

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. File `.env` mặc định:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

#### Chạy Frontend

```bash
# Development mode
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📁 Cấu trúc dự án

```
btlweb/
├── backend/                    # Backend API
│   ├── prisma/                # Prisma schema & migrations
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   ├── validators/       # Joi validation schemas
│   │   └── server.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Frontend React app
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── layout/      # Layout components
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── events/      # Event pages
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   ├── admin/       # Admin pages
│   │   │   └── ...
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand stores
│   │   ├── lib/              # Libraries & utilities
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md                  # This file
```

## 🎯 Tính năng chính

### Tình nguyện viên
- ✅ Đăng ký/Đăng nhập
- ✅ Xem danh sách sự kiện
- ✅ Đăng ký tham gia sự kiện
- ✅ Hủy đăng ký sự kiện
- ✅ Xem lịch sử tham gia
- ✅ Nhận thông báo (Web Push)
- ✅ Trao đổi trên kênh sự kiện (Post/Comment/Like)
- ✅ Dashboard cá nhân

### Quản lý sự kiện
- ✅ Đăng ký/Đăng nhập
- ✅ Tạo, sửa, xóa sự kiện
- ✅ Duyệt/hủy đăng ký tình nguyện viên
- ✅ Đánh dấu hoàn thành
- ✅ Xem báo cáo tham gia
- ✅ Quản lý kênh trao đổi
- ✅ Dashboard quản lý

### Admin
- ✅ Duyệt/xóa sự kiện
- ✅ Quản lý người dùng (khóa/mở tài khoản)
- ✅ Xuất dữ liệu (CSV/JSON)
- ✅ Dashboard admin với thống kê

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users` - Danh sách users (Admin)
- `PATCH /api/users/:id/status` - Cập nhật trạng thái (Admin)

### Events
- `GET /api/events` - Danh sách sự kiện
- `GET /api/events/:id` - Chi tiết sự kiện
- `POST /api/events` - Tạo sự kiện (Manager)
- `PUT /api/events/:id` - Cập nhật sự kiện (Manager)
- `DELETE /api/events/:id` - Xóa sự kiện (Manager)
- `PATCH /api/events/:id/approve` - Duyệt sự kiện (Admin)
- `PATCH /api/events/:id/reject` - Từ chối sự kiện (Admin)

### Registrations
- `POST /api/registrations/events/:eventId/register` - Đăng ký sự kiện
- `DELETE /api/registrations/events/:eventId/cancel` - Hủy đăng ký
- `GET /api/registrations/my-registrations` - Lịch sử đăng ký
- `GET /api/registrations/events/:eventId/registrations` - Danh sách đăng ký (Manager)
- `PATCH /api/registrations/:id/approve` - Duyệt đăng ký (Manager)
- `PATCH /api/registrations/:id/reject` - Từ chối đăng ký (Manager)
- `PATCH /api/registrations/:id/complete` - Đánh dấu hoàn thành (Manager)

### Posts & Comments
- `GET /api/posts/events/:eventId` - Danh sách posts
- `POST /api/posts/events/:eventId` - Tạo post
- `DELETE /api/posts/:id` - Xóa post
- `POST /api/posts/:id/like` - Like/Unlike post
- `GET /api/comments/posts/:postId` - Danh sách comments
- `POST /api/comments/posts/:postId` - Tạo comment
- `DELETE /api/comments/:id` - Xóa comment

### Notifications
- `GET /api/notifications` - Danh sách thông báo
- `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /api/notifications/read-all` - Đánh dấu tất cả đã đọc
- `POST /api/notifications/subscribe` - Đăng ký Web Push

### Dashboard
- `GET /api/dashboard` - Dashboard chung
- `GET /api/dashboard/admin` - Dashboard admin
- `GET /api/dashboard/export/events` - Export events
- `GET /api/dashboard/export/users` - Export users

## 🎨 UI/UX Features

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Modern và đẹp mắt với TailwindCSS
- ✅ Dark mode support (có thể implement thêm)
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Smooth animations
- ✅ Custom scrollbar

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password hashing với bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Input validation (Joi)
- ✅ CORS configuration
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection

## 📊 Database Schema

Xem chi tiết trong file `backend/prisma/schema.prisma`

Các models chính:
- **User**: Thông tin người dùng
- **Event**: Thông tin sự kiện
- **Registration**: Đăng ký tham gia
- **Post**: Bài viết trên kênh
- **Comment**: Bình luận
- **Like**: Lượt thích
- **Notification**: Thông báo
- **PushSubscription**: Đăng ký push notification

## 🧪 Testing

```bash
# Backend tests (TODO: implement)
cd backend
npm test

# Frontend tests (TODO: implement)
cd frontend
npm test
```

## 📝 Development Guidelines

### Code Style
- Sử dụng TypeScript cho type safety
- Follow ESLint rules
- Use meaningful variable names
- Write comments for complex logic

### Git Workflow
- Tạo branch mới cho mỗi feature
- Commit messages rõ ràng
- Review code trước khi merge

### API Design
- RESTful API conventions
- Consistent error responses
- Proper HTTP status codes
- API versioning (nếu cần)

## 👥 Team Members

- **Member 1**: [Tên] - Frontend Development
- **Member 2**: [Tên] - Backend Development  
- **Member 3**: [Tên] - Full-stack & Database

## 📅 Timeline (3 tuần)

Xem chi tiết trong file `PLAN.md`

## 📚 Documentation

### Core Documentation
- **README.md** - File này - Hướng dẫn chính
- **SETUP_GUIDE.md** - Hướng dẫn setup chi tiết
- **PLAN.md** - Kế hoạch 3 tuần
- **PROJECT_STRUCTURE.md** - Cấu trúc dự án
- **CONTRIBUTING.md** - Quy tắc đóng góp

### Technical Documentation
- **PROJECT_SUMMARY.md** - Tóm tắt tiến độ và features
- **EVENT_DETAIL.md** - Hướng dẫn EventDetailPage
- **ISSUES_AND_FIXES.md** - Bugs đã fix và troubleshooting
- **ADMIN_DASHBOARD.md** - Tài liệu Admin Dashboard
- **SOCIAL_FEATURES.md** - Tài liệu Social Features

### Quick Links
- 🚀 Bắt đầu nhanh: `SETUP_GUIDE.md`
- 📊 Xem tiến độ: `PROJECT_SUMMARY.md`
- 🐛 Gặp lỗi: `ISSUES_AND_FIXES.md`
- 🏗️ Cấu trúc code: `PROJECT_STRUCTURE.md`

## 📞 Support

Nếu có vấn đề:
1. Xem `SETUP_GUIDE.md` cho hướng dẫn setup
2. Xem `ISSUES_AND_FIXES.md` cho troubleshooting
3. Xem `PROJECT_SUMMARY.md` cho tổng quan
4. Tạo issue hoặc liên hệ team

## 📄 License

MIT License - Copyright (c) 2025 VolunteerHub Team

---

**Happy Coding! 💚**

