# Bug Fixes - Event Approval Flow

## 🐛 Các Bug đã được sửa

### 1. **Logic kiểm tra Admin trong getAllEvents (Backend)**

**Vấn đề:**
- Route `/api/events` là public route nên `req.user` có thể là `undefined`
- Logic cũ: `if (!req.user || req.user.role !== 'ADMIN')` không đúng
- Khi Admin gọi API với filter `status=PENDING`, logic không hoạt động đúng

**Giải pháp:**
```typescript
// Trước (SAI):
if (!req.user || req.user.role !== 'ADMIN') {
  where.status = 'APPROVED';
} else if (status) {
  where.status = status;
}

// Sau (ĐÚNG):
if (req.user?.role === 'ADMIN') {
  // Admin có thể filter theo status bất kỳ
  if (status) {
    where.status = status;
  }
  // Nếu không có filter status, admin sẽ thấy tất cả
} else {
  // Non-admin chỉ thấy events đã approve
  where.status = 'APPROVED';
}
```

**File:** `backend/src/controllers/event.controller.ts`

---

### 2. **Thiếu Optional Authentication Middleware**

**Vấn đề:**
- Route GET `/api/events` là public nhưng cần biết user có phải Admin không
- Không có cách nào để authenticate optional (không bắt buộc)

**Giải pháp:**
- Tạo middleware `optionalAuthenticate` mới
- Middleware này sẽ validate token nếu có, nhưng không reject request nếu không có token
- Apply middleware cho route GET events

```typescript
// Middleware mới
export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(); // Không có token, tiếp tục
    return;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch (error) {
    req.user = undefined; // Token không hợp lệ, bỏ qua
  }
  
  next();
};
```

**Files:**
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/routes/event.routes.ts`

---

### 3. **UI Bug - Disable buttons khi đang xử lý**

**Vấn đề:**
- Khi click nút "Duyệt" hoặc "Từ chối", chỉ nút đó bị disable
- User có thể click nút còn lại trong khi đang xử lý
- Có thể gây conflict hoặc multiple requests

**Giải pháp:**
```tsx
// Trước (SAI):
disabled={updatingEventId === event.id}

// Sau (ĐÚNG):
disabled={updatingEventId !== null}
```

Disable TẤT CẢ các nút khi đang xử lý bất kỳ event nào.

**File:** `frontend/src/components/admin/EventApproval.tsx`

---

### 4. **Không tự động cập nhật stats sau approve/reject**

**Vấn đề:**
- Sau khi duyệt/từ chối sự kiện, badge số lượng pending trên tab không tự động cập nhật
- Phải refresh trang mới thấy số liệu mới

**Giải pháp:**
- Thêm callback `onEventStatusChanged` vào EventApproval component
- AdminDashboardPage truyền callback để reload stats
- Callback được gọi sau mỗi lần approve/reject thành công

```tsx
// AdminDashboardPage
const handleEventStatusChanged = () => {
  loadDashboardData(); // Reload stats
};

<EventApproval onEventStatusChanged={handleEventStatusChanged} />

// EventApproval
const handleApprove = async (eventId: string) => {
  // ... approve logic ...
  if (onEventStatusChanged) {
    onEventStatusChanged(); // Trigger reload
  }
};
```

**Files:**
- `frontend/src/pages/admin/AdminDashboardPage.tsx`
- `frontend/src/components/admin/EventApproval.tsx`

---

## ✅ Kết quả sau khi fix

### Backend
- ✅ Admin có thể lọc events theo status (PENDING, APPROVED, REJECTED)
- ✅ Non-admin chỉ thấy events APPROVED
- ✅ Route GET events hoạt động cho cả public và authenticated users
- ✅ Logic phân quyền rõ ràng và chính xác

### Frontend
- ✅ UI không cho phép spam click buttons
- ✅ Stats tự động cập nhật sau approve/reject
- ✅ Badge số lượng pending real-time
- ✅ UX mượt mà hơn với loading states

---

## 🧪 Testing

### Test Case 1: Admin lọc sự kiện PENDING
```bash
# Request
GET /api/events?status=PENDING
Headers: Authorization: Bearer <admin-token>

# Expected: Trả về danh sách events có status PENDING
```

### Test Case 2: Public user xem events
```bash
# Request
GET /api/events

# Expected: Chỉ trả về events có status APPROVED
```

### Test Case 3: Admin approve event
```bash
# Request
PATCH /api/events/:id/approve
Headers: Authorization: Bearer <admin-token>

# Expected:
- Event status changed to APPROVED
- Event removed from pending list
- Badge count decreased by 1
```

### Test Case 4: Spam click prevention
```
1. Click "Duyệt" trên event A
2. Ngay lập tức click "Từ chối" trên event A hoặc event B
3. Expected: Nút thứ 2 không hoạt động (disabled)
```

---

## 📝 Notes

### Best Practices Applied
1. **Optional Authentication**: Sử dụng middleware optional cho routes cần support cả public và authenticated
2. **Callback Pattern**: Dùng callbacks để component con notify parent về state changes
3. **Optimistic UI**: Disable all buttons during operation để tránh race conditions
4. **Clear Authorization Logic**: Admin logic rõ ràng, dễ maintain

### Potential Improvements
- [ ] Add loading skeleton cho danh sách pending events
- [ ] Add real-time updates với WebSocket
- [ ] Add bulk approve/reject
- [ ] Add reason field khi reject event
- [ ] Add audit log cho approve/reject actions

---

## 🔍 How to Verify

### Backend
```bash
cd backend
npm run dev

# Test với Postman/Thunder Client:
# 1. GET /api/events (no auth) -> only APPROVED
# 2. GET /api/events?status=PENDING (with admin token) -> PENDING events
# 3. PATCH /api/events/:id/approve (admin token) -> success
```

### Frontend
```bash
cd frontend
npm run dev

# Test trong browser:
# 1. Login as Admin
# 2. Go to Admin Dashboard -> Tab "Duyệt sự kiện"
# 3. Approve/Reject một event
# 4. Verify badge số lượng giảm đi
# 5. Try spam click buttons -> should be disabled
```

---

## 🎯 Summary

Tất cả các bug trong luồng duyệt sự kiện đã được fix:
- ✅ Backend logic chính xác
- ✅ Authentication đúng cách
- ✅ UI/UX smooth
- ✅ Real-time stats update
- ✅ Không còn race conditions

Hệ thống approval giờ hoạt động ổn định và chính xác! 🚀
