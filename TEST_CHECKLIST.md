# ✅ EventDetailPage - Quick Test Checklist

## 🏃 Trước khi test

- [ ] Backend đang chạy (`cd backend && npm run dev`)
- [ ] Frontend đang chạy (`cd frontend && npm run dev`)
- [ ] Database có dữ liệu test (events + users)
- [ ] Có ít nhất 1 event với status APPROVED

---

## 📝 Test Cases

### 1️⃣ User chưa đăng nhập (2 phút)

**Steps:**
1. [ ] Mở http://localhost:5173/events
2. [ ] Click vào một sự kiện
3. [ ] Xem trang chi tiết

**Expected:**
- [ ] Hiển thị đầy đủ thông tin sự kiện
- [ ] Có nút "Đăng nhập để đăng ký"
- [ ] Click nút → chuyển đến /login
- [ ] Không có lỗi console

---

### 2️⃣ Volunteer xem sự kiện (2 phút)

**Steps:**
1. [ ] Login với volunteer
2. [ ] Vào /events/{id} (sự kiện APPROVED)

**Expected:**
- [ ] Hiển thị đầy đủ thông tin
- [ ] Có nút "✓ Đăng ký tham gia" (màu xanh)
- [ ] Không có lỗi console

---

### 3️⃣ Đăng ký sự kiện (3 phút)

**Steps:**
1. [ ] Đang ở trang chi tiết (as volunteer)
2. [ ] Click nút "✓ Đăng ký tham gia"
3. [ ] Đợi response

**Expected:**
- [ ] Nút disabled + text "Đang đăng ký..."
- [ ] Toast: "Đăng ký thành công! Đang chờ phê duyệt."
- [ ] Nút đăng ký biến mất
- [ ] Xuất hiện box: "Trạng thái đăng ký của bạn: [PENDING]"
- [ ] Có nút "Hủy đăng ký" (màu đỏ)
- [ ] Không có lỗi console

---

### 4️⃣ Hủy đăng ký (2 phút)

**Steps:**
1. [ ] Đã đăng ký sự kiện (status box hiển thị)
2. [ ] Click "Hủy đăng ký"
3. [ ] Confirm trong dialog

**Expected:**
- [ ] Nút disabled + text "Đang xử lý..."
- [ ] Toast: "Đã hủy đăng ký thành công"
- [ ] Status box biến mất
- [ ] Nút "Đăng ký tham gia" hiển thị lại
- [ ] Không có lỗi console

---

### 5️⃣ Admin/Manager không thể đăng ký (1 phút)

**Steps:**
1. [ ] Logout
2. [ ] Login với admin hoặc manager
3. [ ] Vào trang chi tiết sự kiện

**Expected:**
- [ ] Hiển thị thông tin sự kiện
- [ ] KHÔNG hiển thị nút đăng ký
- [ ] Không có error toast
- [ ] Không có lỗi console

---

### 6️⃣ Sự kiện chưa approve (1 phút)

**Steps:**
1. [ ] Login volunteer
2. [ ] Vào sự kiện có status PENDING hoặc REJECTED

**Expected:**
- [ ] Hiển thị thông tin
- [ ] Hiển thị: "Sự kiện chưa được phê duyệt" (disabled)
- [ ] Không có nút đăng ký active

---

### 7️⃣ Sự kiện đã đầy (3 phút)

**Setup:**
1. [ ] Tạo event với maxParticipants = 1
2. [ ] Approve event
3. [ ] Đăng ký với volunteer A
4. [ ] Manager approve đăng ký

**Steps:**
1. [ ] Login volunteer B (user khác)
2. [ ] Vào sự kiện đã đầy

**Expected:**
- [ ] Hiển thị: "Sự kiện đã đầy"
- [ ] Không có nút đăng ký
- [ ] Hiển thị "1/1 người"

---

### 8️⃣ Responsive Design (3 phút)

**Steps:**
1. [ ] Mở DevTools (F12)
2. [ ] Toggle device toolbar (Ctrl+Shift+M)

**Test Mobile (375px):**
- [ ] Ảnh full width
- [ ] Grid → 1 cột
- [ ] Buttons full width
- [ ] Text dễ đọc
- [ ] Không bị horizontal scroll

**Test Tablet (768px):**
- [ ] Grid → 2 cột
- [ ] Layout hợp lý

**Test Desktop (1920px):**
- [ ] Grid → 2 cột
- [ ] Content centered (container)

---

### 9️⃣ Loading States (1 phút)

**Steps:**
1. [ ] Throttle network (DevTools → Network → Slow 3G)
2. [ ] Vào trang chi tiết

**Expected:**
- [ ] Hiển thị spinner khi đang load
- [ ] Không hiển thị nội dung
- [ ] Sau khi load → hiển thị đầy đủ thông tin

---

### 🔟 Error Handling (2 phút)

**Test Event không tồn tại:**
1. [ ] Vào /events/invalid-id

**Expected:**
- [ ] Toast: "Không thể tải thông tin sự kiện"
- [ ] Redirect về /events

**Test Network Error:**
1. [ ] Stop backend
2. [ ] Try đăng ký

**Expected:**
- [ ] Toast: "Không thể kết nối đến server."

---

## 🎨 Visual Check

### Badges (1 phút)
- [ ] Category badges có màu đúng
- [ ] Status badges có màu đúng
- [ ] Text trong badges dễ đọc

### Buttons (1 phút)
- [ ] Nút đăng ký: Blue, to, rõ ràng
- [ ] Nút hủy: Red
- [ ] Hover effect hoạt động
- [ ] Disabled state rõ ràng (opacity 50%)

### Layout (1 phút)
- [ ] Spacing đều đặn
- [ ] Font sizes hợp lý
- [ ] Colors tương phản tốt
- [ ] Icons hiển thị đẹp (📅, 📍, 👤, 👥)

---

## 🐛 Browser Console Check

**Mở F12 → Console, kiểm tra:**
- [ ] Không có error màu đỏ
- [ ] Không có warning quan trọng
- [ ] Network requests thành công (200)
- [ ] No 404, 500 errors

---

## ⚡ Performance Check (tùy chọn)

1. [ ] Lighthouse test (F12 → Lighthouse → Analyze)
   - Performance > 80
   - Accessibility > 90
   - Best Practices > 80

2. [ ] Page load < 2 seconds

---

## 📊 Database Verification

**Optional: Check data in database**

```sql
-- Xem sự kiện
SELECT id, title, status, "maxParticipants" 
FROM "Event" 
WHERE id = 'event-id-here';

-- Xem đăng ký
SELECT r.id, r.status, u."fullName", u.email
FROM "Registration" r
JOIN "User" u ON r."userId" = u.id
WHERE r."eventId" = 'event-id-here';
```

---

## ✅ Final Checklist

### Core Functions:
- [ ] Hiển thị thông tin đầy đủ
- [ ] Đăng ký thành công
- [ ] Hủy đăng ký thành công
- [ ] Hiển thị trạng thái đúng

### UI/UX:
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsive design
- [ ] Badges với màu sắc

### Error Handling:
- [ ] Event not found
- [ ] Network errors
- [ ] Validation errors
- [ ] User-friendly messages

---

## 🎯 Điểm số

**Tính điểm:**
- Core Functions: __ / 4 tests
- Basic Flows: __ / 10 tests  
- UI/UX: __ / 3 checks
- Error Handling: __ / 1 test

**Total: __ / 18**

---

## 🚀 Quick Commands

### Terminal:
```bash
# Start backend
cd backend && npm run dev

# Start frontend (terminal mới)
cd frontend && npm run dev
```

### Browser Console:
```javascript
// Get event ID từ URL
const eventId = window.location.pathname.split('/').pop();

// Load test utilities
// Copy nội dung từ frontend/test-event-detail.js

// Run full test
testUtils.test(eventId);
```

---

## 📝 Notes

**Ghi chú trong quá trình test:**

Issue tìm thấy:
- 
- 
- 

Đã fix:
- 
- 
- 

---

## ✨ Pass Criteria

**Test PASS khi:**
- [ ] Tất cả core functions hoạt động
- [ ] Không có console errors
- [ ] UI responsive trên mọi thiết bị
- [ ] Error handling đầy đủ
- [ ] Toast messages hiển thị đúng

---

**Thời gian test ước tính:** 25-30 phút  
**Người test:** ___________  
**Ngày test:** ___________  
**Kết quả:** ⭕ PASS / ❌ FAIL
