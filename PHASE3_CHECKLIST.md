# ✅ Phase 3 Implementation Checklist

## 📋 Pre-Flight Checklist

Đánh dấu ✅ vào mỗi mục trước khi test:

### Backend Setup
- [ ] File `backend/.env` đã có VAPID_PUBLIC_KEY
- [ ] File `backend/.env` đã có VAPID_PRIVATE_KEY
- [ ] File `backend/.env` đã có VAPID_SUBJECT
- [ ] Backend server đang chạy (`npm run dev`)
- [ ] Không có errors trong backend console

### Frontend Setup
- [ ] File `frontend/.env` đã có VITE_VAPID_PUBLIC_KEY
- [ ] File `frontend/.env` đã có VITE_SOCKET_URL
- [ ] File `frontend/.env` đã có VITE_API_URL
- [ ] Frontend app đang chạy (`npm run dev`)
- [ ] Không có errors trong browser console

---

## 🧪 Testing Checklist

### Test 1: Socket Connection ✅
- [ ] Mở browser và login
- [ ] Mở DevTools Console (F12)
- [ ] Thấy log: "✅ Socket connected: [id]"
- [ ] Không có socket connection errors

**Expected Result:** Socket connects successfully on login

---

### Test 2: Push Notification Subscribe ✅
- [ ] Click vào Bell icon (🔔) ở navbar
- [ ] Browser hiện popup xin quyền notifications
- [ ] Click "Allow" để cho phép
- [ ] Bell icon đổi màu (có fill)
- [ ] Toast hiện: "Đã bật thông báo thành công"

**Expected Result:** Successfully subscribed to push notifications

---

### Test 3: Real-time Registration Notification ✅

**Setup:**
- Browser/Tab 1: Login as Manager (manager1@volunteerhub.com / 123456)
- Browser/Tab 2: Login as Volunteer (volunteer1@volunteerhub.com / 123456)

**Steps:**
- [ ] Tab 1 (Manager): Vào "Quản lý sự kiện", tạo sự kiện mới
- [ ] Admin duyệt sự kiện (nếu cần)
- [ ] Tab 2 (Volunteer): Vào trang Events, đăng ký sự kiện vừa tạo
- [ ] Tab 1 (Manager): Quan sát notifications

**Expected Results:**
- [ ] Toast notification hiện: "Có người đăng ký: [Event Title]"
- [ ] Badge count tăng (+1)
- [ ] Danh sách sự kiện tự động refresh
- [ ] Số registrations của event tăng lên

---

### Test 4: Event Approval Notification ✅

**Setup:**
- Browser/Tab 1: Login as Manager
- Browser/Tab 2: Login as Admin (admin@volunteerhub.com / 123456)

**Steps:**
- [ ] Tab 1 (Manager): Tạo sự kiện mới
- [ ] Tab 2 (Admin): Vào Admin Dashboard
- [ ] Tab 2 (Admin): Duyệt sự kiện vừa tạo
- [ ] Tab 1 (Manager): Quan sát notifications

**Expected Results:**
- [ ] Toast hiện: "Sự kiện của bạn đã được duyệt!"
- [ ] Badge count tăng
- [ ] Event status đổi thành "APPROVED"
- [ ] Không cần refresh trang

---

### Test 5: Real-time Comments ✅

**Setup:**
- Browser/Tab 1: Login as User A
- Browser/Tab 2: Login as User B

**Steps:**
- [ ] Tab 1 (User A): Vào event detail page của một sự kiện
- [ ] Tab 2 (User B): Vào cùng event detail page đó
- [ ] Tab 2 (User B): Post một comment mới
- [ ] Tab 1 (User A): Quan sát

**Expected Results:**
- [ ] Comment của User B xuất hiện ngay lập tức ở Tab 1
- [ ] Không cần refresh trang
- [ ] Real-time update hoạt động

---

### Test 6: Web Push (Background) ✅

**Setup:**
- Login và subscribe to push notifications

**Steps:**
- [ ] Đóng tab của ứng dụng (hoặc minimize browser)
- [ ] Trigger một notification (ví dụ: đăng ký sự kiện từ máy khác)
- [ ] Quan sát desktop

**Expected Results:**
- [ ] Browser notification xuất hiện trên desktop
- [ ] Notification có đúng title và message
- [ ] Click vào notification mở lại ứng dụng
- [ ] Navigate đến đúng trang

---

### Test 7: NotificationDropdown ✅

**Steps:**
- [ ] Click vào Bell icon để mở dropdown
- [ ] Thấy danh sách notifications
- [ ] Unread notifications có highlight (màu xanh nhạt)
- [ ] Badge count hiển thị đúng số unread
- [ ] Click vào notification → navigate đến trang liên quan
- [ ] Click "Đánh dấu đã đọc" → badge count về 0

**Expected Results:**
- [ ] Dropdown hoạt động mượt mà
- [ ] Real-time updates khi có notification mới
- [ ] Badge count chính xác

---

### Test 8: Event Room (Join/Leave) ✅

**Steps:**
- [ ] Vào event detail page
- [ ] Check console: "📍 Joined event room: [eventId]"
- [ ] Rời khỏi trang
- [ ] Check console: "🚪 Left event room: [eventId]"

**Expected Results:**
- [ ] Successfully join event room
- [ ] Successfully leave event room
- [ ] No errors in console

---

### Test 9: Socket Disconnect/Reconnect ✅

**Steps:**
- [ ] Login và check socket connected
- [ ] Logout
- [ ] Check console: "❌ Socket disconnected"
- [ ] Login lại
- [ ] Check console: "✅ Socket connected"

**Expected Results:**
- [ ] Socket disconnects on logout
- [ ] Socket reconnects on login
- [ ] No hanging connections

---

### Test 10: Multiple Notifications ✅

**Steps:**
- [ ] Trigger nhiều notifications liên tiếp:
  - Đăng ký sự kiện
  - Post comment
  - Approve event
- [ ] Quan sát toast notifications
- [ ] Mở NotificationDropdown

**Expected Results:**
- [ ] Tất cả notifications đều hiện
- [ ] Toast không chồng lên nhau
- [ ] Badge count đúng
- [ ] Notifications trong dropdown đầy đủ

---

## 🎯 Performance Checklist

- [ ] Socket connection nhanh (< 1s)
- [ ] Real-time updates tức thì (< 200ms)
- [ ] Không có memory leaks
- [ ] Toast notifications không spam
- [ ] UI không lag khi nhận notifications
- [ ] Badge count cập nhật mượt mà

---

## 🔒 Security Checklist

- [ ] VAPID private key không bị expose ra frontend
- [ ] Socket authentication hoạt động (chỉ authenticated users)
- [ ] User chỉ nhận notifications của mình
- [ ] Event rooms isolation hoạt động
- [ ] No sensitive data in socket events

---

## 📱 Browser Compatibility

Test trên các browsers:
- [ ] Chrome/Edge (Chromium) - Recommended
- [ ] Firefox
- [ ] Safari (nếu có Mac)
- [ ] Opera

---

## 🐛 Error Handling Checklist

- [ ] Socket disconnect → hiển thị thông báo (optional)
- [ ] Socket reconnect → tự động retry
- [ ] Push permission denied → thông báo user
- [ ] Network error → graceful degradation
- [ ] Invalid notifications → không crash app

---

## 📝 Documentation Checklist

- [ ] `PHASE3_SETUP_GUIDE.md` - Setup instructions
- [ ] `PHASE3_QUICK_START.md` - Quick start guide
- [ ] `PHASE3_IMPLEMENTATION_COMPLETE.md` - Full docs
- [ ] `PHASE3_SUMMARY.md` - Overview
- [ ] `note.md` updated with completion status

---

## ✨ Final Verification

Chạy qua tất cả scenarios một lần nữa:

### Scenario A: Complete User Journey (Manager)
1. [ ] Login as Manager
2. [ ] Socket connects
3. [ ] Subscribe to push notifications
4. [ ] Create event
5. [ ] Wait for admin approval
6. [ ] Receive approval notification (real-time)
7. [ ] Volunteer registers
8. [ ] Receive registration notification (real-time)
9. [ ] Open ManageEventsPage
10. [ ] See updated registration count
11. [ ] All working! ✅

### Scenario B: Complete User Journey (Volunteer)
1. [ ] Login as Volunteer
2. [ ] Socket connects
3. [ ] Subscribe to push notifications
4. [ ] Browse events
5. [ ] Register for event
6. [ ] Go to event detail page
7. [ ] See real-time comments/posts
8. [ ] Receive notifications for event updates
9. [ ] All working! ✅

---

## 🎉 Completion Criteria

✅ **Phase 3 is COMPLETE when:**

- [ ] All 10 tests pass
- [ ] No linter errors
- [ ] No console errors
- [ ] Socket connection stable
- [ ] Push notifications working
- [ ] Real-time updates instant
- [ ] UI smooth and responsive
- [ ] Documentation complete
- [ ] Both Manager and Volunteer flows work
- [ ] Production ready

---

## 📊 Results

**Tests Passed:** ___ / 10  
**Performance:** ⭐⭐⭐⭐⭐  
**User Experience:** ⭐⭐⭐⭐⭐  
**Code Quality:** ⭐⭐⭐⭐⭐  

**Overall Status:** 
- [ ] ✅ READY FOR PRODUCTION
- [ ] ⚠️ NEEDS FIXES
- [ ] ❌ NOT WORKING

---

## 🚀 Next Steps

Sau khi tất cả tests pass:

1. [ ] Deploy to staging environment
2. [ ] Test trên staging
3. [ ] Setup monitoring cho socket connections
4. [ ] Configure production VAPID keys
5. [ ] Enable analytics cho notifications
6. [ ] Deploy to production! 🎉

---

**Good luck with testing! 🍀**

Nếu có bất kỳ test nào fail, check:
- `PHASE3_QUICK_START.md` - Troubleshooting section
- Browser console logs
- Backend server logs
- Environment variables

