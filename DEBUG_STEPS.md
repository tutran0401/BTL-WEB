# Debug Instructions - Immediate Steps

## Bước 1: Mở Console

1. Nhấn **F12** trên keyboard
2. Click tab **Console** (nếu chưa mở)
3. **XÓA** all logs cũ (click icon 🚫 hoặc nhấn Ctrl+L)

## Bước 2: Reproduce Error

1. **Làm mới** trang (F5)
2. Click vào notification "Bình luận mới"
3. Chờ error xuất hiện

## Bước 3: Check Console Logs

Tìm các dòng log sau trong console:

```
EventDetailPage mounted: { ... }
🔍 Loading event details for ID: ...
❌ Load event detail error: ...
Error details: { status: ..., message: ... }
```

## Bước 4: Screenshot

Chụp màn hình **TOÀN BỘ** console logs và gửi lại cho tôi

---

## Expected Logs

Nếu thấy log như này:
```javascript
❌ Load event detail error: Error
Error details: {
    status: 404,
    message: "Event not found",
    eventId: "xyz123"
}
```

→ Event không tồn tại

Nếu thấy:
```javascript
Error details: {
    status: 403,
    message: "Forbidden"
}
```

→ Permission issue

---

## Quick Check

Trước khi reproduce, hãy check:

**Tab Network** trong DevTools:
1. Clear all requests (icon 🚫)
2. Click notification
3. Tìm request `/api/events/...`
4. Click vào request đó
5. Check **Response** tab
6. Screenshot response

---

**VUI LÒNG GỬI**:
- ✅ Screenshot console logs
- ✅ Screenshot network response

Tôi sẽ fix ngay khi có thông tin này!
