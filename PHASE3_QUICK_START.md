# 🚀 Phase 3: Quick Start Guide

## Bước 1: Cấu Hình Environment Variables

### Backend (`backend/.env`)

Tạo hoặc cập nhật file `backend/.env`:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DATABASE_URL="file:./dev.db"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Web Push Notifications
VAPID_PUBLIC_KEY=BE85Zva5aEcK3-XmerRBQLX-BCfPCvDGyXIgORBDLki3AbdG9qrcRxel3-OK2CVeWrbSrxznwC2vuE6EK-tAIhI
VAPID_PRIVATE_KEY=JCogD29OXYT7SmpG2RnK_DiE_yop33HXNEhwkkQR6zo
VAPID_SUBJECT=mailto:admin@volunteerhub.com
```

### Frontend (`frontend/.env`)

Tạo hoặc cập nhật file `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Web Push Notifications
VITE_VAPID_PUBLIC_KEY=BE85Zva5aEcK3-XmerRBQLX-BCfPCvDGyXIgORBDLki3AbdG9qrcRxel3-OK2CVeWrbSrxznwC2vuE6EK-tAIhI

# Socket.io
VITE_SOCKET_URL=http://localhost:3000
```

---

## Bước 2: Restart Backend & Frontend

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

⚠️ **QUAN TRỌNG:** Phải restart cả hai sau khi thêm environment variables!

---

## Bước 3: Kiểm Tra Hoạt Động

### ✅ Test 1: Socket Connection

1. Mở ứng dụng và đăng nhập
2. Mở Browser Console (F12)
3. Kiểm tra có log: `✅ Socket connected: [socket-id]`

**Thành công:** Thấy message kết nối  
**Thất bại:** Kiểm tra lại VITE_SOCKET_URL và backend có chạy không

---

### ✅ Test 2: Web Push Notifications

1. Đăng nhập vào ứng dụng
2. Click vào icon Bell 🔔 ở góc phải navbar
3. Trình duyệt sẽ hỏi quyền thông báo → **Cho phép**
4. Icon Bell sẽ đổi màu (có fill) khi đã subscribe

**Thành công:** Icon đổi màu, toast hiện "Đã bật thông báo thành công"  
**Thất bại:** Kiểm tra VAPID keys có đúng không

---

### ✅ Test 3: Real-time Notification Flow

#### Scenario: Đăng ký sự kiện

**Setup:**
- Account A: Manager (đã tạo sự kiện)
- Account B: Volunteer

**Steps:**
1. **Account A:** Đăng nhập, vào trang "Quản lý sự kiện"
2. **Account B:** Đăng nhập (tab khác hoặc browser khác), đăng ký sự kiện của A
3. **Account A:** Sẽ thấy:
   - ✅ Toast notification: "Có người đăng ký: [Tên sự kiện]"
   - ✅ Badge notification count tăng
   - ✅ Danh sách sự kiện tự động refresh (số registrations tăng)

**Thành công:** Account A nhận được thông báo ngay lập tức  
**Thất bại:** Kiểm tra socket connection và backend logs

---

#### Scenario: Duyệt sự kiện

**Setup:**
- Account A: Manager
- Account B: Admin

**Steps:**
1. **Account A:** Tạo sự kiện mới
2. **Account B:** Đăng nhập với admin, vào trang Admin Dashboard
3. **Account B:** Duyệt sự kiện của Account A
4. **Account A:** Sẽ thấy:
   - ✅ Toast notification: "Sự kiện của bạn đã được duyệt!"
   - ✅ Badge notification count tăng
   - ✅ Status sự kiện đổi thành "APPROVED"

**Thành công:** Account A nhận notification real-time  
**Thất bại:** Kiểm tra socket connection

---

### ✅ Test 4: Real-time Comments/Posts

1. **User A:** Vào trang chi tiết một sự kiện
2. **User B:** (tab khác) Vào cùng sự kiện đó, post comment
3. **User A:** Sẽ thấy comment của B xuất hiện ngay lập tức, không cần refresh

**Thành công:** Comment hiện real-time  
**Thất bại:** Kiểm tra socket room (join-event event)

---

## 🎯 Quick Checklist

Đánh dấu ✅ khi hoàn thành:

- [ ] Backend `.env` có VAPID keys
- [ ] Frontend `.env` có VAPID_PUBLIC_KEY và SOCKET_URL
- [ ] Backend đã restart
- [ ] Frontend đã restart
- [ ] Socket connected khi login (check console)
- [ ] Có thể subscribe to push notifications
- [ ] Nhận được real-time notifications khi đăng ký sự kiện
- [ ] Nhận được notifications khi sự kiện được duyệt
- [ ] Comments/Posts update real-time
- [ ] Web push notifications hoạt động (test với tab đóng)

---

## 🐛 Common Issues

### Issue 1: Socket không connect

**Symptoms:** Console không có log "Socket connected"

**Solutions:**
1. Check `VITE_SOCKET_URL` trong `frontend/.env` → phải là `http://localhost:3000`
2. Backend có chạy không? Check terminal backend
3. User đã đăng nhập chưa? (Socket chỉ connect khi authenticated)
4. Clear cache và hard refresh (Ctrl+Shift+R)

---

### Issue 2: Web Push không hoạt động

**Symptoms:** Click Bell icon nhưng không có popup xin quyền

**Solutions:**
1. Check VAPID keys có match giữa backend và frontend không
2. Restart cả backend và frontend
3. Clear Service Workers: DevTools → Application → Service Workers → Unregister
4. Hard refresh browser
5. Kiểm tra browser có hỗ trợ Push API không (Chrome, Edge, Firefox OK)

---

### Issue 3: Notifications không real-time

**Symptoms:** Phải refresh trang mới thấy notifications mới

**Solutions:**
1. Check socket connection (xem Issue 1)
2. Mở browser console, xem có errors không
3. Check backend logs có emit socket events không
4. Verify user đã subscribe to push notifications chưa

---

## 📱 Test Accounts

```
Admin:
  Email: admin@volunteerhub.com
  Password: 123456

Manager:
  Email: manager1@volunteerhub.com
  Password: 123456

Volunteer:
  Email: volunteer1@volunteerhub.com
  Password: 123456
```

---

## 🎉 Success!

Nếu tất cả tests pass, Phase 3 đã hoạt động hoàn hảo! 🚀

**Các tính năng đã có:**
✅ Real-time notifications  
✅ Web Push notifications  
✅ Socket.io bidirectional communication  
✅ Auto-refresh UI khi có updates  
✅ Background notifications  
✅ Event rooms  

**Next:** Bạn có thể customize thêm notifications, thêm sound alerts, hoặc làm PWA!

