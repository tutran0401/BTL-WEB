# 🧪 HƯỚNG DẪN TEST MODULE ADMIN

**Date**: December 15, 2025  
**Module**: Admin Dashboard Complete

---

## 🎯 Mục tiêu test

Đảm bảo tất cả tính năng của module Admin hoạt động đúng:
1. Đăng nhập Admin
2. Dashboard với statistics
3. Quản lý người dùng
4. Duyệt/xóa sự kiện
5. Export dữ liệu

---

## 🚀 Chuẩn bị

### 1. Khởi động Backend
```bash
cd backend
npm run dev
```
✅ Backend chạy tại: `http://localhost:3000`

### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend chạy tại: `http://localhost:5173`

### 3. Seed Database (nếu chưa có data)
```bash
cd backend
npx prisma db seed
```

### 4. Tài khoản test
```
Admin:     admin@volunteerhub.com / 123456
Manager:   manager1@volunteerhub.com / 123456
Volunteer: volunteer1@volunteerhub.com / 123456
```

---

## 📋 Test Cases

### TEST 1: Đăng nhập Admin ✅

**Steps:**
1. Mở trình duyệt: `http://localhost:5173`
2. Click "Đăng nhập"
3. Nhập:
   - Email: `admin@volunteerhub.com`
   - Password: `123456`
4. Click "Đăng nhập"

**Expected Results:**
- ✅ Không có lỗi validation
- ✅ Loading spinner xuất hiện
- ✅ Toast success: "Đăng nhập thành công"
- ✅ Redirect về trang Dashboard
- ✅ Navbar hiển thị tên "Admin User"
- ✅ Navbar có link "Admin"

**Potential Issues:**
- ❌ Token không lưu → Check localStorage
- ❌ Không redirect → Check ProtectedRoute
- ❌ 401 error → Check backend API

---

### TEST 2: Admin Dashboard - Tổng quan ✅

**Steps:**
1. Đăng nhập as Admin
2. Click "Admin" trong navbar
3. Mặc định tab "Tổng quan" được chọn

**Expected Results:**

**Statistics Cards (4 cards với gradient):**
- ✅ Tổng người dùng (Blue gradient)
- ✅ Tổng sự kiện (Green gradient)  
- ✅ Đăng ký tham gia (Purple gradient)
- ✅ Chờ duyệt (Orange gradient)
- ✅ Các số liệu hiển thị chính xác

**Event Status Section:**
- ✅ Đang hoạt động (số lượng events APPROVED)
- ✅ Chờ duyệt (số lượng events PENDING)
- ✅ Đã hoàn thành (số lượng events COMPLETED)

**Breakdown Charts:**
- ✅ "Người dùng theo vai trò" hiển thị:
  - Tình nguyện viên
  - Quản lý sự kiện
  - Admin
- ✅ "Sự kiện theo danh mục" hiển thị các category

**Recent Activity:**
- ✅ "Người dùng mới nhất" (5 users)
  - Tên, email
  - Role badge (màu sắc đúng)
- ✅ "Sự kiện mới nhất" (5 events)
  - Tên sự kiện
  - Tên manager
  - Status badge

**Export Section:**
- ✅ 4 buttons: Events JSON, Events CSV, Users JSON, Users CSV
- ✅ Buttons có màu sắc phù hợp (blue/green)

**Potential Issues:**
- ❌ Numbers sai → Check database queries
- ❌ Charts không hiển thị → Check data format
- ❌ Loading forever → Check API endpoint

---

### TEST 3: Export Dữ liệu ✅

**Steps:**
1. Ở tab "Tổng quan"
2. Scroll xuống "Xuất dữ liệu"
3. Test từng button

**Test 3.1: Export Events JSON**
- Click "JSON" trong "Danh sách sự kiện"
- **Expected:**
  - ✅ Toast "Đang xuất dữ liệu..."
  - ✅ File tải xuống: `events-2025-12-15.json`
  - ✅ Mở file → JSON hợp lệ với tất cả events
  - ✅ Toast success "Xuất dữ liệu thành công"

**Test 3.2: Export Events CSV**
- Click "CSV" trong "Danh sách sự kiện"
- **Expected:**
  - ✅ File tải xuống: `events-2025-12-15.csv`
  - ✅ Mở Excel/Google Sheets → Dữ liệu hiển thị đúng
  - ✅ Headers: ID, Title, Description, Location, ...

**Test 3.3: Export Users JSON**
- Click "JSON" trong "Danh sách người dùng"
- **Expected:**
  - ✅ File tải xuống: `users-2025-12-15.json`
  - ✅ JSON chứa tất cả users

**Test 3.4: Export Users CSV**
- Click "CSV" trong "Danh sách người dùng"
- **Expected:**
  - ✅ File tải xuống: `users-2025-12-15.csv`
  - ✅ Headers: ID, Email, Full Name, Phone, Role, ...

**Potential Issues:**
- ❌ File không tải → Check browser download settings
- ❌ CSV lỗi encoding → Check UTF-8 BOM
- ❌ 500 error → Check backend controller

---

### TEST 4: Quản lý User ✅

**Steps:**
1. Click tab "Quản lý User"
2. Xem danh sách users

**Test 4.1: View User List**
- **Expected:**
  - ✅ Bảng hiển thị users
  - ✅ Columns: Người dùng, Vai trò, Trạng thái, Ngày tạo, Hành động
  - ✅ Avatar icon cho mỗi user
  - ✅ Badges màu sắc đúng
  - ✅ Admin users không có nút Lock
  - ✅ Pagination hiển thị nếu > 10 users

**Test 4.2: Search Users**
- Type "volunteer" trong search box
- Click "Tìm kiếm" hoặc Enter
- **Expected:**
  - ✅ Chỉ hiển thị users có "volunteer" trong tên/email
  - ✅ Kết quả instant

- Clear search và type "admin"
- **Expected:**
  - ✅ Hiển thị admin users

**Test 4.3: Filter by Role**
- Select "Tình nguyện viên" trong dropdown
- **Expected:**
  - ✅ Chỉ hiển thị VOLUNTEER users
  - ✅ Page reset về 1

- Select "Quản lý sự kiện"
- **Expected:**
  - ✅ Chỉ hiển thị EVENT_MANAGER users

- Select "Tất cả vai trò"
- **Expected:**
  - ✅ Hiển thị tất cả users

**Test 4.4: Filter by Status**
- Select "Hoạt động"
- **Expected:**
  - ✅ Chỉ hiển thị ACTIVE users

- Select "Tất cả trạng thái"
- **Expected:**
  - ✅ Hiển thị tất cả users

**Test 4.5: Lock User Account**
- Tìm một VOLUNTEER user đang ACTIVE
- Click button "Khóa" (red, lock icon)
- **Expected:**
  - ✅ Confirmation dialog: "Bạn có chắc muốn khóa tài khoản này?"
  - Click OK
  - ✅ Toast success: "Đã khóa tài khoản thành công"
  - ✅ User status badge → Red "Đã khóa"
  - ✅ Button đổi thành "Mở" (green, unlock icon)

- Mở tab mới, thử login với tài khoản vừa khóa
- **Expected:**
  - ✅ Login fail hoặc "Account is locked"

**Test 4.6: Unlock User Account**
- Click button "Mở" (green, unlock icon)
- **Expected:**
  - ✅ Confirmation dialog: "Bạn có chắc muốn mở khóa tài khoản này?"
  - Click OK
  - ✅ Toast success: "Đã mở khóa tài khoản thành công"
  - ✅ User status badge → Green "Hoạt động"
  - ✅ Button đổi thành "Khóa" (red)

- Thử login lại với tài khoản
- **Expected:**
  - ✅ Login thành công

**Test 4.7: Pagination**
- Nếu có > 10 users:
- **Expected:**
  - ✅ Pagination controls hiển thị
  - Click "Sau" → Page 2
  - ✅ URL update hoặc state change
  - ✅ Hiển thị users 11-20
  - Click "Trước" → Page 1
  - ✅ Về users 1-10

**Potential Issues:**
- ❌ Search không hoạt động → Check API query params
- ❌ Lock không work → Check authorization
- ❌ Badge màu sai → Check CSS classes

---

### TEST 5: Duyệt Sự kiện ✅

**Steps:**
1. Click tab "Duyệt sự kiện"

**Test 5.1: View Pending Events**
- **Expected:**
  - ✅ Tab "Chờ duyệt" active by default
  - ✅ Badge hiển thị số lượng pending (nếu có)
  - ✅ List các events PENDING
  - ✅ Mỗi event card hiển thị:
    - Title
    - Description (2 lines)
    - Start date
    - Location
    - Số lượng registrations / max
    - Manager name
    - Status badge (yellow)
    - Category badge
    - Buttons: Eye (view), Duyệt (green), Từ chối (red)

**Test 5.2: View Event Detail**
- Click icon Eye (👁️) của một event
- **Expected:**
  - ✅ Modal mở ra
  - ✅ Title: "Chi tiết sự kiện"
  - ✅ Hiển thị đầy đủ:
    - Tên sự kiện
    - Mô tả (full text)
    - Danh mục
    - Trạng thái
    - Địa điểm
    - Thời gian bắt đầu
    - Thời gian kết thúc
    - Người quản lý (name + email)
    - Hình ảnh (nếu có)
  - Click X hoặc ngoài modal → Close

**Test 5.3: Approve Event**
- Click button "Duyệt" (green check icon)
- **Expected:**
  - ✅ Confirmation: "Phê duyệt sự kiện này?"
  - Click OK
  - ✅ Toast success: "Đã phê duyệt sự kiện"
  - ✅ Event biến mất khỏi list
  - ✅ Badge "Chờ duyệt" count giảm 1
  - ✅ Stats card "Chờ duyệt" giảm 1

- Click tab "Đã duyệt"
- **Expected:**
  - ✅ Event vừa approve xuất hiện ở đây
  - ✅ Status badge: Green "Đã duyệt"
  - ✅ Buttons: Eye, Xóa

**Test 5.4: Reject Event**
- Tạo event mới as manager:
  - Login as `manager1@volunteerhub.com`
  - Tạo một event mới
  - Logout, login lại as admin

- Ở tab "Chờ duyệt", tìm event vừa tạo
- Click button "Từ chối" (red X icon)
- **Expected:**
  - ✅ Confirmation: "Từ chối sự kiện này?"
  - Click OK
  - ✅ Toast success: "Đã từ chối sự kiện"
  - ✅ Event biến mất khỏi list "Chờ duyệt"

- Click tab "Từ chối"
- **Expected:**
  - ✅ Event xuất hiện ở list này
  - ✅ Status badge: Red "Từ chối"
  - ✅ Buttons: Eye, Xóa

**Test 5.5: Delete Event**
- Ở tab "Từ chối", click button "Xóa"
- **Expected:**
  - ✅ Confirmation: "Xóa sự kiện này? Hành động này không thể hoàn tác!"
  - Click OK
  - ✅ Toast success: "Đã xóa sự kiện"
  - ✅ Event biến mất hoàn toàn
  - ✅ Total events count giảm 1

**Test 5.6: Filter Tabs**
- Click tab "Đã duyệt"
- **Expected:**
  - ✅ Hiển thị tất cả APPROVED events
  - ✅ Buttons: Eye, Xóa (không có Duyệt/Từ chối)

- Click tab "Từ chối"
- **Expected:**
  - ✅ Hiển thị tất cả REJECTED events

- Click tab "Chờ duyệt"
- **Expected:**
  - ✅ Về list PENDING events

**Test 5.7: Empty State**
- Nếu không có pending events:
- **Expected:**
  - ✅ Calendar icon (gray)
  - ✅ Text: "Không có sự kiện nào"

**Potential Issues:**
- ❌ Approve không work → Check API endpoint
- ❌ Badge count không update → Check state management
- ❌ Delete fail → Check cascade delete trong DB

---

### TEST 6: Notifications & Real-time ✅

**Test 6.1: Manager receives notification**
- Login as admin, approve một event
- Logout, login as manager (owner của event)
- **Expected:**
  - ✅ Notification bell có badge số
  - ✅ Click bell → Notification "Sự kiện được duyệt"
  - ✅ Click notification → Navigate to event

**Test 6.2: Web Push (if enabled)**
- Grant notification permission
- Admin approve event
- **Expected:**
  - ✅ Manager nhận browser notification
  - ✅ Click notification → Open app

---

### TEST 7: Responsive Design 📱

**Desktop (≥768px):**
- **Expected:**
  - ✅ Full navigation bar
  - ✅ Stats cards: 4 columns
  - ✅ Charts side by side
  - ✅ User table full width

**Tablet (768px - 1024px):**
- **Expected:**
  - ✅ Stats cards: 2 columns
  - ✅ Charts stacked
  - ✅ Table scrollable

**Mobile (<768px):**
- Resize browser hoặc mở DevTools mobile view
- **Expected:**
  - ✅ Hamburger menu
  - ✅ Stats cards: 1 column, stacked
  - ✅ Charts full width
  - ✅ Table horizontal scroll
  - ✅ Buttons touch-friendly
  - ✅ Modal full height

---

### TEST 8: Edge Cases & Error Handling ⚠️

**Test 8.1: Network Error**
- Tắt backend (Ctrl+C trong terminal)
- Try to load admin dashboard
- **Expected:**
  - ✅ Loading spinner → Error state
  - ✅ Toast error: "Không thể tải dữ liệu dashboard"

**Test 8.2: Unauthorized Access**
- Logout
- Navigate directly to `http://localhost:5173/admin`
- **Expected:**
  - ✅ Redirect to `/login`

- Login as VOLUNTEER
- Navigate to `/admin`
- **Expected:**
  - ✅ Redirect to `/` or error page

**Test 8.3: Invalid Token**
- Login as admin
- Clear localStorage token
- Refresh page hoặc click action
- **Expected:**
  - ✅ Redirect to login
  - ✅ Toast: "Phiên đăng nhập hết hạn"

**Test 8.4: Cannot Lock Admin**
- View user list
- Find admin user
- **Expected:**
  - ✅ No Lock/Unlock button for admin role

**Test 8.5: Double Click Protection**
- Click "Duyệt" event
- Nhanh chóng click lại trước khi API response
- **Expected:**
  - ✅ Button disabled during request
  - ✅ Loading indicator
  - ✅ Không gọi API 2 lần

---

## 📊 Test Results Template

### Test Summary
```
✅ PASSED: __/__ tests
❌ FAILED: __/__ tests
⚠️  SKIPPED: __/__ tests

Total: 8 test suites
```

### Detailed Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Đăng nhập Admin | ✅ | |
| 2. Dashboard - Tổng quan | ✅ | |
| 3. Export Dữ liệu | ✅ | |
| 4. Quản lý User | ✅ | |
| 5. Duyệt Sự kiện | ✅ | |
| 6. Notifications | ✅ | |
| 7. Responsive Design | ✅ | |
| 8. Edge Cases | ✅ | |

---

## 🐛 Bug Report Template

**If you find any bugs:**

```markdown
### Bug Title
[Brief description]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080

**Screenshots:**
[Attach if relevant]

**Console Errors:**
[Paste any errors from browser console]

**Priority:**
[ ] High
[ ] Medium
[ ] Low
```

---

## ✅ Final Checklist

Trước khi demo/deployment:

### Functionality
- [ ] Admin login works
- [ ] Dashboard stats accurate
- [ ] Export JSON/CSV works
- [ ] User management CRUD works
- [ ] Event approval works
- [ ] Notifications sent
- [ ] All filters work
- [ ] Pagination works

### UI/UX
- [ ] No visual glitches
- [ ] Colors consistent
- [ ] Badges correct
- [ ] Icons displayed
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] Responsive on all devices

### Security
- [ ] Auth required
- [ ] Role checking works
- [ ] Cannot access without permission
- [ ] Token validation
- [ ] CORS configured

### Performance
- [ ] Page loads < 3s
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] API calls optimized

### Data
- [ ] Seed data loaded
- [ ] Database healthy
- [ ] No missing relations

---

## 🎉 Kết luận

Sau khi hoàn thành tất cả test cases:
- ✅ Module Admin hoạt động 100%
- ✅ Sẵn sàng cho demo
- ✅ Sẵn sàng cho production

**Happy Testing! 🚀**

---

**Created**: December 15, 2025  
**Last Updated**: December 15, 2025  
**Status**: Ready for Testing

