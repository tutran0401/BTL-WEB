# Admin Dashboard

## Tổng quan
Admin Dashboard cung cấp giao diện quản lý toàn diện cho quản trị viên hệ thống, bao gồm thống kê tổng quan, quản lý người dùng và duyệt sự kiện.

## Các tính năng đã triển khai

### 1. Thống kê tổng quan (Overview)
- ✅ Hiển thị số liệu tổng hợp:
  - Tổng số người dùng
  - Tổng số sự kiện
  - Tổng số đăng ký
  - Số sự kiện chờ duyệt
- ✅ Biểu đồ phân bố người dùng theo vai trò
- ✅ Biểu đồ phân bố sự kiện theo danh mục
- ✅ Danh sách người dùng mới nhất
- ✅ Danh sách sự kiện mới nhất
- ✅ Xuất dữ liệu (JSON/CSV)

### 2. Quản lý người dùng (User Management)
- ✅ Xem danh sách tất cả người dùng
- ✅ Tìm kiếm người dùng (theo tên hoặc email)
- ✅ Lọc theo vai trò (Admin, Manager, Volunteer)
- ✅ Lọc theo trạng thái (Active, Locked, Pending)
- ✅ Khóa/Mở khóa tài khoản người dùng
- ✅ Phân trang danh sách
- ✅ Hiển thị thông tin chi tiết (email, số điện thoại, ngày tạo)

### 3. Duyệt sự kiện (Event Approval)
- ✅ Xem danh sách sự kiện chờ duyệt (PENDING)
- ✅ Xem chi tiết thông tin sự kiện
- ✅ Duyệt sự kiện (Approve)
- ✅ Từ chối sự kiện (Reject)
- ✅ Hiển thị thông tin quản lý sự kiện
- ✅ Badge số lượng sự kiện chờ duyệt trên tab

## Cấu trúc file

### Frontend
```
frontend/src/
├── services/
│   ├── dashboardService.ts     # API calls cho dashboard
│   └── userService.ts          # API calls cho quản lý users
├── components/
│   └── admin/
│       ├── index.ts            # Export components
│       ├── StatsOverview.tsx   # Thống kê tổng quan
│       ├── UserManagement.tsx  # Quản lý người dùng
│       └── EventApproval.tsx   # Duyệt sự kiện
└── pages/
    └── admin/
        └── AdminDashboardPage.tsx  # Trang admin chính
```

### Backend (đã có sẵn)
```
backend/src/
├── controllers/
│   ├── dashboard.controller.ts  # Logic dashboard
│   └── user.controller.ts       # Logic quản lý users
└── routes/
    ├── dashboard.routes.ts      # Routes cho dashboard
    └── user.routes.ts           # Routes cho users
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/admin` - Lấy thống kê admin dashboard
- `GET /api/dashboard/export/events?format=json|csv` - Xuất danh sách sự kiện
- `GET /api/dashboard/export/users?format=json|csv` - Xuất danh sách người dùng

### User Management
- `GET /api/users` - Lấy danh sách người dùng (với filters, search, pagination)
- `PATCH /api/users/:id/status` - Cập nhật trạng thái tài khoản

### Event Approval
- `GET /api/events?status=PENDING` - Lấy danh sách sự kiện chờ duyệt
- `PATCH /api/events/:id/approve` - Duyệt sự kiện
- `PATCH /api/events/:id/reject` - Từ chối sự kiện

## Quyền truy cập

### Admin Dashboard
- **Truy cập**: Chỉ Admin (role = 'ADMIN')
- **Middleware**: Yêu cầu authentication + authorization

### Các thao tác
- **Xem thống kê**: Admin only
- **Quản lý users**: Admin only
- **Khóa/Mở khóa tài khoản**: Admin only (không thể khóa Admin khác)
- **Duyệt/Từ chối sự kiện**: Admin only
- **Xuất dữ liệu**: Admin only

## Giao diện

### Tabs Navigation
- **Tổng quan** 📊: Thống kê và biểu đồ
- **Quản lý User** 👥: Danh sách và quản lý người dùng
- **Duyệt sự kiện** 📅: Danh sách sự kiện chờ duyệt (có badge số lượng)

### Màu sắc & Badges

#### Vai trò người dùng
- **Admin**: 🔴 Red badge
- **Event Manager**: 🔵 Blue badge
- **Volunteer**: 🟢 Green badge

#### Trạng thái tài khoản
- **Active**: 🟢 Green badge (Hoạt động)
- **Locked**: 🔴 Red badge (Khóa)
- **Pending**: 🟡 Yellow badge (Chờ duyệt)

#### Trạng thái sự kiện
- **APPROVED**: 🟢 Green badge (Đã duyệt)
- **PENDING**: 🟡 Yellow badge (Chờ duyệt)
- **REJECTED**: 🔴 Red badge (Từ chối)

#### Danh mục sự kiện
- **EDUCATION**: 🔵 Blue (Giáo dục)
- **ENVIRONMENT**: 🟢 Green (Môi trường)
- **HEALTH**: 🔴 Red (Sức khỏe)
- **COMMUNITY**: 🟣 Purple (Cộng đồng)
- **OTHER**: ⚫ Gray (Khác)

## Tính năng chi tiết

### StatsOverview Component
```tsx
// Hiển thị các thống kê:
- 4 card tổng quan (Users, Events, Registrations, Pending)
- 2 biểu đồ thanh ngang (Users by Role, Events by Category)
- Nút xuất dữ liệu (JSON/CSV)
- 2 bảng activity (Recent Users, Recent Events)
```

### UserManagement Component
```tsx
// Quản lý người dùng:
- Search bar (tìm theo tên hoặc email)
- Dropdown filters (Role, Status)
- Bảng danh sách với thông tin chi tiết
- Nút Khóa/Mở khóa cho mỗi user
- Phân trang
```

### EventApproval Component
```tsx
// Duyệt sự kiện:
- Card list của các sự kiện chờ duyệt
- Hiển thị ảnh, thông tin chi tiết
- Nút "Xem mô tả" để toggle mô tả đầy đủ
- Nút Duyệt (green) và Từ chối (red)
- Empty state khi không có sự kiện chờ
```

## Cách sử dụng

### Cho Admin
1. Đăng nhập với tài khoản Admin
2. Truy cập `/admin/dashboard` hoặc click "Admin Dashboard" trên navbar
3. Xem thống kê tổng quan
4. Quản lý người dùng:
   - Tìm kiếm, lọc người dùng
   - Khóa/Mở khóa tài khoản vi phạm
5. Duyệt sự kiện:
   - Xem danh sách sự kiện chờ duyệt
   - Đọc thông tin chi tiết
   - Duyệt hoặc từ chối

### Xuất dữ liệu
```typescript
// Xuất danh sách sự kiện
onClick={() => handleExport('events', 'json')}  // JSON format
onClick={() => handleExport('events', 'csv')}   // CSV format

// Xuất danh sách người dùng
onClick={() => handleExport('users', 'json')}
onClick={() => handleExport('users', 'csv')}
```

## Validation & Error Handling

### Frontend
- ✅ Toast notifications cho mọi thao tác
- ✅ Loading states khi gọi API
- ✅ Confirmation dialogs cho các thao tác quan trọng
- ✅ Disable buttons khi đang xử lý
- ✅ Error messages rõ ràng

### Backend
- ✅ Authentication required cho tất cả endpoints
- ✅ Authorization check (chỉ Admin)
- ✅ Input validation
- ✅ Error responses chuẩn

## Tính năng nâng cao có thể thêm

### Thống kê
- [ ] Biểu đồ line chart cho trends theo thời gian
- [ ] Thống kê tương tác (posts, comments, likes)
- [ ] Export báo cáo PDF
- [ ] So sánh dữ liệu theo tháng/quý/năm
- [ ] Real-time statistics với WebSocket

### Quản lý User
- [ ] Gửi email thông báo khi khóa/mở khóa
- [ ] Xem lịch sử hoạt động của user
- [ ] Bulk actions (khóa nhiều users cùng lúc)
- [ ] Edit user information
- [ ] Change user role
- [ ] Delete user (soft delete)

### Quản lý Event
- [ ] Edit event information trong admin panel
- [ ] Bulk approve/reject
- [ ] Comment/feedback khi reject
- [ ] Event categories management
- [ ] Featured events

### Logs & Audit
- [ ] Activity logs
- [ ] Admin action history
- [ ] System logs viewer

## Testing

### Đăng nhập Admin
```bash
# Sử dụng tài khoản admin có sẵn hoặc tạo mới trong seed data
Email: admin@example.com
Password: (password của bạn)
```

### Test các tính năng
1. **Thống kê**:
   - Kiểm tra số liệu hiển thị chính xác
   - Test xuất dữ liệu JSON/CSV
   
2. **Quản lý User**:
   - Tìm kiếm người dùng
   - Lọc theo vai trò và trạng thái
   - Khóa/Mở khóa tài khoản
   - Kiểm tra phân trang
   
3. **Duyệt sự kiện**:
   - Xem danh sách chờ duyệt
   - Duyệt sự kiện
   - Từ chối sự kiện
   - Kiểm tra badge số lượng

## Performance

### Optimization
- Pagination cho danh sách lớn
- Lazy loading cho components
- Debounce cho search
- Cache API responses
- Optimize re-renders với React.memo

## Security

### Measures
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ CORS configuration
- ✅ Input sanitization
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention

## Troubleshooting

### Không thể truy cập Admin Dashboard
- Kiểm tra role của user (phải là ADMIN)
- Kiểm tra token trong localStorage
- Đảm bảo backend đang chạy

### Không thể khóa tài khoản
- Không thể khóa tài khoản Admin khác
- Kiểm tra permissions

### Dữ liệu không cập nhật
- Reload page sau khi approve/reject
- Kiểm tra network tab trong DevTools

## Liên hệ
Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên repository.
