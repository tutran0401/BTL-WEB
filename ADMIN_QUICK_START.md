# 🚀 ADMIN MODULE - QUICK START GUIDE

**5 phút để bắt đầu sử dụng Admin Dashboard!**

---

## ⚡ Khởi động nhanh

### 1. Chạy Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Running at `http://localhost:3000`

### 2. Chạy Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Running at `http://localhost:5173`

### 3. Đăng nhập Admin
```
URL: http://localhost:5173/login
Email: admin@volunteerhub.com
Password: 123456
```

---

## 🎯 Tour nhanh 5 phút

### Bước 1: Xem Dashboard (1 phút)
1. Sau khi login, click **"Admin"** trong navbar
2. Xem 4 stats cards:
   - 💙 Tổng người dùng
   - 💚 Tổng sự kiện
   - 💜 Đăng ký tham gia
   - 🧡 Chờ duyệt
3. Scroll xuống xem:
   - Breakdown by Role & Category
   - Recent Users & Events

### Bước 2: Export Data (30 giây)
1. Scroll xuống phần "Xuất dữ liệu"
2. Click **"CSV"** trong "Danh sách sự kiện"
3. File tải xuống → Mở bằng Excel
4. Thử các buttons khác: JSON, Users CSV, Users JSON

### Bước 3: Quản lý Users (2 phút)
1. Click tab **"Quản lý User"**
2. Thử search: gõ "volunteer" → Enter
3. Thử filter: Chọn "Tình nguyện viên"
4. Tìm một volunteer → Click **"Khóa"** (red button)
5. Confirm → Xem status đổi sang "Đã khóa"
6. Click **"Mở"** (green button) để unlock

### Bước 4: Duyệt Sự kiện (1.5 phút)
1. Click tab **"Duyệt sự kiện"**
2. Xem badge số lượng chờ duyệt
3. Click icon 👁️ để xem chi tiết event
4. Click **"Duyệt"** (green) cho một event
5. Confirm → Event biến mất
6. Click tab **"Đã duyệt"** → Event xuất hiện ở đây
7. Thử **"Từ chối"** và **"Xóa"** tương tự

---

## 🎨 Màu sắc & Icons

### Stats Cards
- 💙 **Blue**: Tổng người dùng
- 💚 **Green**: Tổng sự kiện
- 💜 **Purple**: Đăng ký
- 🧡 **Orange**: Chờ duyệt

### Role Badges
- 🔴 **Red**: Admin
- 🔵 **Blue**: Quản lý sự kiện
- 🟢 **Green**: Tình nguyện viên

### Status Badges
- 🟢 **Green**: Active / Approved
- 🔴 **Red**: Locked / Rejected
- 🟡 **Yellow**: Pending

### Action Buttons
- 👁️ **Eye**: Xem chi tiết
- ✅ **Check**: Duyệt
- ❌ **X**: Từ chối
- 🗑️ **Delete**: Xóa
- 🔒 **Lock**: Khóa tài khoản
- 🔓 **Unlock**: Mở khóa

---

## 🔥 Tính năng HOT

### 1. Real-time Badge
Tab "Duyệt sự kiện" có **badge số lượng** cập nhật real-time!

### 2. Smart Filters
Quản lý User: Combine Search + Role + Status = Powerful! 💪

### 3. One-Click Export
Export CSV/JSON trong 1 click! Perfect cho báo cáo! 📊

### 4. Safe Lock
Không thể khóa Admin users → Tránh khóa nhầm! 🔐

### 5. Beautiful UI
Gradient cards, smooth animations, responsive! 🎨

---

## 📱 Mobile Support

**Desktop**: Full features  
**Tablet**: Tất cả features hoạt động  
**Mobile**: Responsive, touch-friendly

Test bằng cách resize browser hoặc mở DevTools!

---

## 🎓 Các thao tác thường dùng

### Tìm user cụ thể
```
1. Tab "Quản lý User"
2. Search: gõ email hoặc tên
3. Enter
```

### Duyệt tất cả events pending
```
1. Tab "Duyệt sự kiện"
2. Mặc định show pending
3. Click "Duyệt" từng event
```

### Khóa user vi phạm
```
1. Tab "Quản lý User"
2. Tìm user
3. Click "Khóa"
4. Confirm
```

### Export report cuối tháng
```
1. Tab "Tổng quan"
2. Scroll xuống
3. Click "CSV" cho Events
4. Click "CSV" cho Users
5. Done! 2 files ready
```

---

## 🐛 Troubleshooting

### "Không thể tải dữ liệu"
→ Check backend có chạy không?  
→ Check URL: `http://localhost:3000`

### "Unauthorized"
→ Đăng xuất và đăng nhập lại  
→ Check account có role ADMIN không

### Badge số không đúng
→ Refresh page (F5)  
→ Check database có data không

### Export không download
→ Check browser download settings  
→ Allow downloads from localhost

---

## 💡 Pro Tips

1. **Dùng Search thay vì scroll**: Nhanh hơn nhiều!
2. **Filter combo**: Search + Role + Status = Tìm chính xác
3. **View detail trước khi action**: Click 👁️ để chắc chắn
4. **Export định kỳ**: Backup data thường xuyên
5. **Mobile-first**: Test trên mobile để đảm bảo UX

---

## 📞 Cần giúp đỡ?

### Documentation
- **Full Docs**: `ADMIN_MODULE_COMPLETE.md`
- **Testing Guide**: `ADMIN_TESTING_GUIDE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`

### Check Console
- Browser: F12 → Console tab
- Backend: Terminal logs
- Network: F12 → Network tab

### Common Issues
1. 401 Error → Re-login
2. 403 Error → Check role
3. 404 Error → Check URL
4. 500 Error → Check backend logs

---

## 🎉 Chúc mừng!

Bạn đã sẵn sàng sử dụng Admin Dashboard!

**Next Steps:**
- ✅ Test tất cả tính năng
- ✅ Thử trên mobile
- ✅ Export sample data
- ✅ Khóa/mở test users
- ✅ Duyệt/từ chối events

**Enjoy! 🚀**

---

**Version**: 1.0  
**Date**: December 15, 2025  
**Status**: Production Ready

