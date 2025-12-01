# 📝 EventDetailPage - Quick Reference

## 🎯 Mục đích
Trang hiển thị chi tiết sự kiện và cho phép volunteer đăng ký tham gia.

## 📁 Files đã tạo/cập nhật

1. **`frontend/src/services/registrationService.ts`** ✨ NEW
   - Service xử lý API đăng ký sự kiện
   
2. **`frontend/src/pages/events/EventDetailPage.tsx`** ✏️ UPDATED
   - Component hiển thị chi tiết sự kiện
   - Logic đăng ký/hủy đăng ký

3. **`HUONG_DAN_EVENT_DETAIL.md`** ✨ NEW
   - Hướng dẫn chi tiết về EventDetailPage
   
4. **`DEMO_EVENT_DETAIL.md`** ✨ NEW
   - Scenarios test và demo

## 🚀 Cách chạy

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Truy cập: http://localhost:5173/events/{id}

## ⚡ Tính năng chính

### ✅ Hiển thị thông tin
- Ảnh sự kiện
- Tiêu đề, mô tả
- Thời gian (bắt đầu - kết thúc)
- Địa điểm
- Người quản lý
- Số lượng đăng ký / Giới hạn
- Category và Status badges

### ✅ Đăng ký sự kiện
```typescript
// Điều kiện để đăng ký:
✓ Đã đăng nhập
✓ Role = VOLUNTEER
✓ Chưa đăng ký
✓ Event status = APPROVED
✓ Còn chỗ (nếu có giới hạn)
```

### ✅ Hủy đăng ký
```typescript
// Có thể hủy khi:
✓ Đã đăng ký
✓ Status != COMPLETED
✓ Status != CANCELLED
```

## 📊 Flow Chart

```
User vào trang
    ↓
Load event info
    ↓
Đã login? → NO → Hiển thị "Đăng nhập để đăng ký"
    ↓ YES
Kiểm tra đăng ký hiện tại
    ↓
Đã đăng ký? → YES → Hiển thị trạng thái + "Hủy đăng ký"
    ↓ NO
Role = VOLUNTEER? → NO → Ẩn nút đăng ký
    ↓ YES
Event APPROVED? → NO → "Sự kiện chưa được phê duyệt"
    ↓ YES
Còn chỗ? → NO → "Sự kiện đã đầy"
    ↓ YES
Hiển thị "✓ Đăng ký tham gia"
```

## 🎨 UI Elements

### Status Badges
```typescript
PENDING   → 🟡 Yellow "Chờ duyệt"
APPROVED  → 🟢 Green "Đã duyệt"
REJECTED  → 🔴 Red "Từ chối"
CANCELLED → ⚫ Gray "Đã hủy"
COMPLETED → 🔵 Blue "Hoàn thành"
```

### Category Badges
```typescript
EDUCATION   → 🔵 Blue "Giáo dục"
ENVIRONMENT → 🟢 Green "Môi trường"
HEALTH      → 🔴 Red "Sức khỏe"
COMMUNITY   → 🟣 Purple "Cộng đồng"
OTHER       → ⚫ Gray "Khác"
```

## 🔗 API Endpoints

```typescript
// Lấy chi tiết sự kiện
GET /api/events/:id

// Đăng ký
POST /api/registrations/events/:eventId/register
→ Response: { message, registration }

// Hủy đăng ký
DELETE /api/registrations/events/:eventId/cancel
→ Response: { message }

// Lấy đăng ký của tôi
GET /api/registrations/my-registrations
→ Response: { registrations: [] }
```

## 🧪 Quick Test

### Test Case 1: Đăng ký thành công
```
1. Login volunteer
2. Vào /events/{approved-event-id}
3. Click "Đăng ký tham gia"
4. ✅ Toast: "Đăng ký thành công! Đang chờ phê duyệt."
```

### Test Case 2: Hủy đăng ký
```
1. Đã đăng ký sự kiện
2. Click "Hủy đăng ký"
3. Confirm
4. ✅ Toast: "Đã hủy đăng ký thành công"
```

## 🐛 Common Issues

### Issue: Button không hiển thị
```typescript
// Debug:
console.log('User:', user);
console.log('Event:', event);
console.log('My Registration:', myRegistration);
console.log('Can Register:', canRegister());
```

### Issue: API 401 Unauthorized
```typescript
// Check token:
console.log('Token:', useAuthStore.getState().token);
// → Nếu null → Login lại
```

### Issue: Đăng ký không thành công
```
Check:
□ Token hợp lệ?
□ Role = VOLUNTEER?
□ Event = APPROVED?
□ Chưa đăng ký?
□ Còn chỗ?
```

## 📚 Tài liệu đầy đủ

- **Chi tiết**: `HUONG_DAN_EVENT_DETAIL.md`
- **Test**: `DEMO_EVENT_DETAIL.md`
- **API**: `backend/src/controllers/registration.controller.ts`

## ✅ Checklist

- [x] Registration Service
- [x] EventDetailPage component
- [x] Hiển thị thông tin
- [x] Logic đăng ký
- [x] Logic hủy đăng ký
- [x] UI/UX hoàn chỉnh
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] TypeScript types

## 🎉 Done!

Tính năng EventDetailPage đã hoàn thành và sẵn sàng sử dụng!
