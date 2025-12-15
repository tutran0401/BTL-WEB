# 🚀 Phase 3: Real-time & Notifications - Setup Guide

## Bước 1: Cấu hình VAPID Keys ✅ (DONE)

VAPID Keys đã được generate thành công!

### Backend - `backend/.env`

Thêm các dòng sau vào file `backend/.env`:

```env
# Web Push Notifications
VAPID_PUBLIC_KEY=BE85Zva5aEcK3-XmerRBQLX-BCfPCvDGyXIgORBDLki3AbdG9qrcRxel3-OK2CVeWrbSrxznwC2vuE6EK-tAIhI
VAPID_PRIVATE_KEY=JCogD29OXYT7SmpG2RnK_DiE_yop33HXNEhwkkQR6zo
VAPID_SUBJECT=mailto:admin@volunteerhub.com
```

### Frontend - `frontend/.env`

Tạo/cập nhật file `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Web Push Notifications
VITE_VAPID_PUBLIC_KEY=BE85Zva5aEcK3-XmerRBQLX-BCfPCvDGyXIgORBDLki3AbdG9qrcRxel3-OK2CVeWrbSrxznwC2vuE6EK-tAIhI

# Socket.io
VITE_SOCKET_URL=http://localhost:3000
```

⚠️ **LƯU Ý**: Nhớ restart cả backend và frontend sau khi thêm env variables!

---

## Bước 2: Socket.io Integration (Đang implement...)

### Các tính năng sẽ được thêm:

1. ✅ Socket Context & Provider
2. ✅ useSocket Hook
3. ✅ Real-time notification updates
4. ✅ Socket emissions cho:
   - New registration
   - Event approval/rejection
   - New comments
   - New posts

---

## Testing Checklist

- [ ] Backend server đã restart với VAPID keys
- [ ] Frontend app đã restart với VAPID keys
- [ ] Service Worker đã được register
- [ ] Có thể subscribe/unsubscribe notifications
- [ ] Socket.io connection thành công
- [ ] Nhận được real-time updates khi:
  - [ ] Có đăng ký mới
  - [ ] Sự kiện được duyệt
  - [ ] Có comment/post mới
- [ ] Web Push notifications hoạt động
- [ ] Notifications badge cập nhật real-time

---

## Troubleshooting

### Socket không connect?
- Kiểm tra `VITE_SOCKET_URL` trong frontend/.env
- Kiểm tra backend có đang chạy không
- Mở Console và kiểm tra logs

### Web Push không hoạt động?
- Kiểm tra VAPID keys đã đúng chưa
- Xem browser console có lỗi gì không
- Đảm bảo đã cho phép notifications trong browser settings
- Service Worker phải được serve qua HTTPS (hoặc localhost)

### Notifications không real-time?
- Kiểm tra socket connection status
- Xem backend logs có emit events không
- Kiểm tra frontend có listen đúng events không

