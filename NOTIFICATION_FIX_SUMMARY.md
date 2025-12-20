# Thông Báo Đăng Ký Mới - Sửa Lỗi Thành Công

## Các Vấn Đề Đã Sửa

### 1. ✅ Lỗi "Invalid Date"

**Nguyên nhân**: Socket notification không có field `createdAt` và `isRead`

**Giải pháp**: Đã thêm các field cần thiết vào tất cả socket notifications

**Files đã sửa**:
- `backend/src/controllers/registration.controller.ts`
- `backend/src/controllers/event.controller.ts`
- `frontend/src/components/layout/NotificationDropdown.tsx`

**Code thay đổi**:
```typescript
// Trước (thiếu createdAt và isRead)
io.emit(`user:${event.managerId}:notification`, {
  id: registration.id,
  title: 'Đăng ký mới',
  message: '...',
  type: 'new_registration',
  data: { eventId: event.id, registrationId: registration.id }
});

// Sau (đã thêm đầy đủ)
io.emit(`user:${event.managerId}:notification`, {
  id: registration.id,
  title: 'Đăng ký mới',
  message: '...',
  type: 'new_registration',
  isRead: false,
  createdAt: new Date().toISOString(),
  data: { eventId: event.id, registrationId: registration.id }
});
```

### 2. ✅  Navigation Không Đúng

**Vấn đề**: Khi click thông báo đăng ký mới, chuyển đến `/manage-events` thay vì chuyển trực tiếp đến sự kiện cần duyệt

**Giải pháp**: Đã cập nhật logic navigation để chuyển đến `/events/${eventId}` trực tiếp

**File đã sửa**: `frontend/src/components/layout/NotificationDropdown.tsx`

**Code thay đổi**:
```typescript
// Trước
if (notification.type === 'new_registration' && user?.role === 'EVENT_MANAGER') {
    navigate('/manage-events');
}

// Sau
case 'new_registration':
    // Chuyển đến trang chi tiết sự kiện để duyệt đăng ký
    if (notification.data?.eventId) {
        navigate(`/events/${notification.data.eventId}`);
    }
    break;
```

### 3. ✅ Event Manager Không Thể Xem Event REJECTED

**Vấn đề**: Khi click notification cho event bị reject, manager không xem được event (404)

**Giải pháp**: Cho phép manager xem event REJECTED của chính họ

**File đã sửa**: `backend/src/controllers/event.controller.ts`

**Code thay đổi**:
```typescript
// Trước
if (event.status === 'REJECTED') {
  res.status(404).json({ error: 'Event not found' });
  return;
}

// Sau
if (event.status === 'REJECTED') {
  // Cho phép manager của event hoặc admin xem
  if (userRole !== 'ADMIN' && event.managerId !== userId) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
}
```

### 4. ✅ Cải Thiện Error Handling

**Cải tiến**: Thêm error handling cho hàm formatDate để tránh crash khi date invalid

**File đã sửa**: `frontend/src/components/layout/NotificationDropdown.tsx`

**Code thêm vào**:
```typescript
const formatDate = (dateString: string) => {
    try {
        if (!dateString) return 'Vừa xong';
        
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Vừa xong';
        
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Vừa xong';
    }
};
```

## Các Notification Types Đã Cập Nhật Cấu Trúc

Tất cả các notification types sau đã được thêm `createdAt` và `isRead`:

1. ✅ `new_registration` - Đăng ký mới
2. ✅ `registration_approved` - Đăng ký được duyệt
3. ✅ `registration_rejected` - Đăng ký bị từ chối
4. ✅ `event_completed` - Hoàn thành sự kiện
5. ✅ `event_approved` - Sự kiện được duyệt
6. ✅ `event_rejected` - Sự kiện bị từ chối
7. ✅ `event_resubmitted` - Sự kiện được gửi lại

## Navigation Logic Hoàn Chỉnh

```typescript
switch (notification.type) {
    case 'new_registration':
        // Chuyển đến sự kiện để duyệt đăng ký
        navigate(`/events/${eventId}`);
        break;
    
    case 'registration_approved':
    case 'registration_rejected':
    case 'event_completed':
    case 'event_approved':
        // Chuyển đến event detail
        navigate(`/events/${eventId}`);
        break;
    
    case 'event_rejected':
    case 'event_resubmitted':
        // Manager: đến trang quản lý
        // Others: đến event detail
        navigate(isManager ? '/manage-events' : `/events/${eventId}`);
        break;
    
    default:
        // Fallback
        navigate(`/events/${eventId}`);
}
```

## Tổng Kết

✅ **Đã sửa**: Lỗi Invalid Date
✅ **Đã sửa**: Navigation không đúng  
✅ **Đã cải thiện**: Event Manager có thể xem event REJECTED của họ
✅ **Đã thêm**: Error handling cho formatDate
✅ **Đã chuẩn hóa**: Tất cả socket notifications có cùng cấu trúc

## Test

Để test các thay đổi:

1. **Test Invalid Date Fix**:
   - Đăng ký mới cho một sự kiện
   - Kiểm tra notification hiển thị thời gian đúng (không có "Invalid Date")

2. **Test Navigation**:
   - Click vào notification "Đăng ký mới"
   - Phải chuyển đến trang event detail (không phải /manage-events)

3. **Test Event REJECTED Access**:
   - Admin reject một event
   - Manager click vào notification "Sự kiện bị từ chối"
   - Phải có thể xem được event detail (không bị 404)
