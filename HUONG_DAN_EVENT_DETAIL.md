# Hướng dẫn EventDetailPage - Trang Chi tiết Sự kiện

## 📋 Tổng quan

EventDetailPage là trang hiển thị thông tin chi tiết của một sự kiện và cho phép người dùng đăng ký tham gia.

## 🗂️ Cấu trúc File

### 1. **Registration Service** (`frontend/src/services/registrationService.ts`)

Service này xử lý tất cả các API liên quan đến đăng ký sự kiện:

```typescript
// Các chức năng chính:
- registerForEvent(eventId)      // Đăng ký tham gia sự kiện
- cancelRegistration(eventId)    // Hủy đăng ký
- getMyRegistrations(status?)    // Lấy danh sách đăng ký của tôi
- getEventRegistrations(eventId) // Lấy đăng ký của sự kiện (manager)
- approveRegistration(id)        // Phê duyệt đăng ký (manager)
- rejectRegistration(id)         // Từ chối đăng ký (manager)
- markAsCompleted(id)           // Đánh dấu hoàn thành (manager)
```

### 2. **Event Detail Page** (`frontend/src/pages/events/EventDetailPage.tsx`)

Component chính hiển thị chi tiết sự kiện.

## 🔄 Luồng hoạt động

### A. Khi vào trang:

1. **Lấy ID từ URL**: Sử dụng `useParams` để lấy ID sự kiện
2. **Load thông tin sự kiện**: Gọi API `eventService.getEventById(id)`
3. **Kiểm tra đăng ký** (nếu đã login): Gọi `registrationService.getMyRegistrations()` để xem user đã đăng ký chưa

```typescript
useEffect(() => {
  if (id) {
    loadEventDetail();           // Load thông tin sự kiện
    if (isAuthenticated) {
      checkMyRegistration();     // Kiểm tra đã đăng ký chưa
    }
  }
}, [id, isAuthenticated]);
```

### B. Hiển thị thông tin:

**1. Header (Ảnh + Tiêu đề)**
- Ảnh sự kiện (nếu có)
- Tiêu đề
- Category badge (EDUCATION, ENVIRONMENT, HEALTH, COMMUNITY, OTHER)
- Status badge (PENDING, APPROVED, REJECTED)

**2. Thông tin cơ bản (Grid layout)**
```
📅 Thời gian          📍 Địa điểm
  - Bắt đầu            - Địa chỉ cụ thể
  - Kết thúc

👤 Người quản lý      👥 Số lượng
  - Tên                 - X/Y người
  - Email
```

**3. Mô tả chi tiết**
- Nội dung đầy đủ về sự kiện

**4. Trạng thái đăng ký** (nếu đã đăng ký)
```
┌─────────────────────────────────────────┐
│ Trạng thái đăng ký của bạn:             │
│ [Badge: PENDING/APPROVED/etc]           │
│                      [Hủy đăng ký]      │
└─────────────────────────────────────────┘
```

### C. Logic nút đăng ký:

#### Điều kiện để hiển thị nút "Đăng ký tham gia":

```typescript
canRegister() {
  ✓ Đã đăng nhập
  ✓ Role là VOLUNTEER (không phải ADMIN/EVENT_MANAGER)
  ✓ Chưa đăng ký sự kiện này
  ✓ Sự kiện đã được APPROVED
  ✓ Còn chỗ (nếu có giới hạn số người)
}
```

#### Các trường hợp hiển thị:

| Trạng thái | Hiển thị |
|------------|----------|
| Chưa đăng nhập | "Đăng nhập để đăng ký" |
| Đã đăng ký | Hiển thị trạng thái + nút "Hủy đăng ký" |
| Đủ điều kiện | "✓ Đăng ký tham gia" |
| Sự kiện chưa duyệt | "Sự kiện chưa được phê duyệt" (disabled) |
| Sự kiện đã đầy | "Sự kiện đã đầy" (disabled) |
| Admin/Manager | Không hiển thị nút đăng ký |

### D. Xử lý đăng ký:

```typescript
handleRegister() {
  1. Kiểm tra đã login chưa
     ❌ Chuyển đến trang login
  
  2. Kiểm tra role
     ❌ Hiển thị thông báo lỗi
  
  3. Gọi API registerForEvent(eventId)
     ✓ Thành công: "Đăng ký thành công! Đang chờ phê duyệt."
     ✓ Load lại trạng thái đăng ký
     ❌ Thất bại: Hiển thị lỗi
}
```

### E. Hủy đăng ký:

```typescript
handleCancelRegistration() {
  1. Xác nhận với người dùng
  2. Gọi API cancelRegistration(eventId)
     ✓ Thành công: "Đã hủy đăng ký thành công"
     ✓ Xóa trạng thái đăng ký (setMyRegistration(null))
     ❌ Thất bại: Hiển thị lỗi
}
```

## 🎨 Giao diện

### Components được sử dụng:

1. **Loading Spinner**: Hiển thị khi đang tải dữ liệu
2. **Status Badges**: Màu sắc theo trạng thái
3. **Category Badges**: Màu sắc theo danh mục
4. **Responsive Grid**: Layout 2 cột trên desktop, 1 cột trên mobile
5. **Action Buttons**: Nút to, rõ ràng, dễ nhấn

### Màu sắc:

#### Status:
- PENDING: Yellow (bg-yellow-100 text-yellow-800)
- APPROVED: Green (bg-green-100 text-green-800)
- REJECTED: Red (bg-red-100 text-red-800)
- CANCELLED: Gray (bg-gray-100 text-gray-800)
- COMPLETED: Blue (bg-blue-100 text-blue-800)

#### Category:
- EDUCATION: Blue
- ENVIRONMENT: Green
- HEALTH: Red
- COMMUNITY: Purple
- OTHER: Gray

## 🔗 API Endpoints được sử dụng

### Backend Routes:

```typescript
// Event routes (backend/src/routes/event.routes.ts)
GET    /api/events/:id              // Lấy chi tiết sự kiện

// Registration routes (backend/src/routes/registration.routes.ts)
POST   /api/registrations/events/:eventId/register  // Đăng ký
DELETE /api/registrations/events/:eventId/cancel    // Hủy đăng ký
GET    /api/registrations/my-registrations          // Lấy danh sách đăng ký
```

## 🧪 Test Cases

### Test 1: User chưa đăng nhập
1. Vào trang chi tiết sự kiện
2. Nhấn nút "Đăng nhập để đăng ký"
3. Chuyển đến trang login với redirect về lại trang chi tiết

### Test 2: Volunteer đăng ký thành công
1. Login với tài khoản VOLUNTEER
2. Vào trang chi tiết sự kiện đã APPROVED
3. Nhấn nút "Đăng ký tham gia"
4. Hiển thị toast thành công
5. Nút đăng ký biến mất, hiển thị trạng thái "PENDING"

### Test 3: Admin/Manager không thể đăng ký
1. Login với tài khoản ADMIN hoặc EVENT_MANAGER
2. Vào trang chi tiết sự kiện
3. Không hiển thị nút đăng ký

### Test 4: Hủy đăng ký
1. User đã đăng ký (status != COMPLETED)
2. Nhấn nút "Hủy đăng ký"
3. Xác nhận
4. Hiển thị toast thành công
5. Nút "Đăng ký tham gia" hiển thị lại

### Test 5: Sự kiện đã đầy
1. Sự kiện có maxParticipants = 10
2. Đã có 10 người đăng ký APPROVED
3. Hiển thị "Sự kiện đã đầy" (disabled)

## 📱 Responsive Design

- **Desktop (≥768px)**: Grid 2 cột cho thông tin
- **Mobile (<768px)**: Stack 1 cột
- **Image**: Chiều cao cố định 384px (h-96)
- **Buttons**: Full width trên mobile

## 🚀 Cách chạy và test

### 1. Chuẩn bị Backend:
```bash
cd backend
npm install
npm run dev
```

### 2. Chuẩn bị Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 3. Test flow:

#### A. Tạo dữ liệu test:
1. Login với admin → Tạo sự kiện → Approve sự kiện
2. Login với volunteer

#### B. Test đăng ký:
1. Vào http://localhost:5173/events
2. Click vào một sự kiện
3. Click "Đăng ký tham gia"
4. Kiểm tra thông báo thành công

#### C. Test hủy đăng ký:
1. Sau khi đăng ký thành công
2. Click "Hủy đăng ký"
3. Xác nhận
4. Kiểm tra thông báo thành công

## 🔧 Troubleshooting

### Lỗi thường gặp:

**1. "Cannot read property 'registrations' of undefined"**
- Nguyên nhân: event._count undefined
- Giải pháp: Sử dụng `event._count?.registrations ?? 0`

**2. "This comparison appears to be unintentional"**
- Nguyên nhân: Dùng sai tên role ('MANAGER' thay vì 'EVENT_MANAGER')
- Giải pháp: Kiểm tra lại tên role trong authStore

**3. "Event not found"**
- Nguyên nhân: Sự kiện không tồn tại hoặc đã bị xóa
- Giải pháp: Redirect về trang danh sách sự kiện

**4. "Already registered for this event"**
- Nguyên nhân: User đã đăng ký rồi
- Giải pháp: Hiển thị trạng thái đăng ký thay vì nút đăng ký

## 📚 Tài liệu liên quan

- [Event Service](./frontend/src/services/eventService.ts)
- [Registration Service](./frontend/src/services/registrationService.ts)
- [Auth Store](./frontend/src/store/authStore.ts)
- [API Documentation](./backend/src/controllers/registration.controller.ts)

## 💡 Tips và Best Practices

1. **Luôn kiểm tra authentication trước khi gọi API**
2. **Hiển thị loading state khi đang xử lý**
3. **Validate điều kiện đăng ký trước khi gọi API**
4. **Hiển thị thông báo rõ ràng cho user**
5. **Xử lý tất cả các edge cases**
6. **Sử dụng toast để thông báo kết quả**
7. **Redirect về trang login nếu chưa đăng nhập**
8. **Cache trạng thái đăng ký để tránh gọi API nhiều lần**

## ✅ Checklist hoàn thành

- [x] Tạo Registration Service
- [x] Implement EventDetailPage component
- [x] Hiển thị thông tin sự kiện đầy đủ
- [x] Xử lý logic đăng ký
- [x] Xử lý logic hủy đăng ký
- [x] Kiểm tra điều kiện đăng ký
- [x] Hiển thị trạng thái đăng ký
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] TypeScript types

## 🎯 Kết luận

EventDetailPage giờ đã hoàn chỉnh với đầy đủ các tính năng:
- ✅ Hiển thị thông tin chi tiết sự kiện
- ✅ Đăng ký tham gia sự kiện
- ✅ Hủy đăng ký
- ✅ Kiểm tra trạng thái đăng ký
- ✅ Xử lý các điều kiện đăng ký
- ✅ UI/UX thân thiện
- ✅ Error handling đầy đủ
- ✅ Responsive trên mọi thiết bị
