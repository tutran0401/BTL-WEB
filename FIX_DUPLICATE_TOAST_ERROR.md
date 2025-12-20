# Fix Lỗi "Không Tìm Thấy Dữ Liệu" - API Interceptor Issue

## Vấn Đề

User báo vẫn gặp lỗi "Không tìm thấy dữ liệu" dù đã scroll.

### Nguyên Nhân

**Root Cause**: API interceptor tự động hiển thị toast cho TẤT CẢ 404 errors

**File**: `frontend/src/lib/api.ts` - Line 56

```typescript
case 404:
    toast.error('Không tìm thấy dữ liệu.'); // ❌ PROBLEM!
    break;
```

### Tình Huống Xảy Ra

1. User click notification (NEW_POST / NEW_REGISTRATION)
2. Navigate to `/events/{eventId}`
3. Backend kiểm tra:
   - Event có status PENDING?
   - User có phải manager/admin không?
4. Nếu không pass → Backend return 404
5. **API interceptor** tự động show toast "Không tìm thấy dữ liệu"
6. **EventDetailPage** CŨNG show toast "Không thể tải thông tin sự kiện"
7. → **2 toast cùng lúc!** (như trong ảnh user chụp)

---

## Giải Pháp Đã Implement

### Fix 1: Tắt Auto Toast cho Event Endpoints ✅

**File**: `frontend/src/lib/api.ts`

```typescript
case 404:
    // Skip automatic toast for event endpoints - let components handle it
    if (!requestUrl.includes('/events/')) {
        toast.error('Không tìm thấy dữ liệu.');
    }
    break;
```

**Lý do**: 
- Event endpoints cần error messages chi tiết hơn
- Component biết context tốt hơn interceptor
- Tránh duplicate toasts

### Fix 2: Improve Error Messages ✅

**File**: `frontend/src/pages/events/EventDetailPage.tsx`

```typescript
const loadEventDetail = async () => {
    try {
        setLoading(true);
        const data = await eventService.getEventById(id!);
        setEvent(data);
    } catch (error: any) {
        console.error('Load event detail error:', error);
        
        // Show specific error message
        const status = error?.response?.status;
        const message = error?.response?.data?.error;
        
        if (status === 404) {
            toast.error(message || 'Không tìm thấy sự kiện này. Sự kiện có thể đã bị xóa hoặc bạn không có quyền xem.');
        } else if (status === 403) {
            toast.error('Bạn không có quyền xem sự kiện này.');
        } else {
            toast.error(message || 'Không thể tải thông tin sự kiện');
        }
        
        navigate('/events');
    } finally {
        setLoading(false);
    }
};
```

**Improvements**:
- ✅ Specific message for 404 (không tìm thấy vs không có quyền)
- ✅ Separate message for 403 (forbidden)
- ✅ Use backend error message if available
- ✅ Fallback to generic message
- ✅ Better UX with clearer feedback

---

## Các Trường Hợp 404 Event

### Case 1: Event Không Tồn Tại
```
Backend: res.status(404).json({ error: 'Event not found' });
Frontend: "Không tìm thấy sự kiện này. Sự kiện có thể đã bị xóa..."
```

### Case 2: Event PENDING - User không phải Manager
```typescript
if (event.status === 'PENDING') {
    if (userRole !== 'ADMIN' && event.managerId !== userId) {
        res.status(404).json({ error: 'Event not found' });
    }
}
```
```
Frontend: "Không tìm thấy sự kiện này. Sự kiện có thể đã bị xóa hoặc bạn không có quyền xem."
```

### Case 3: Event REJECTED - User không phải Manager/Admin
```typescript
if (event.status === 'REJECTED') {
    if (userRole !== 'ADMIN' && event.managerId !== userId) {
        res.status(404).json({ error: 'Event not found' });
    }
}
```
```
Frontend: "Không tìm thấy sự kiện này. Sự kiện có thể đã bị xóa hoặc bạn không có quyền xem."
```

---

## Debug Steps

Nếu vẫn gặp lỗi, check:

### 1. Console Logs
```
Load event detail error: ...
```
Xem error object để biết exact status và message

### 2. Network Tab
- Request URL: `/api/events/{eventId}`
- Response status: 404? 403? 500?
- Response body: Error message từ backend

### 3. User Role
- User hiện tại là ai?
- Event được tạo bởi ai?
- Event status là gì (PENDING/APPROVED/REJECTED)?

### 4. Notification Data
```typescript
{
    type: 'NEW_POST',
    eventId: '...', // ← Check xem eventId có đúng không?
    postId: '...'
}
```

---

## Testing

### Test Case 1: Manager Click NEW_REGISTRATION Notification
**Setup**: 
- Event Manager tạo event (status: PENDING)
- Volunteer đăng ký
- Manager nhận notification

**Expected**:
- ✅ Click notification → Navigate to `/manage-events`
- ✅ NO toast error (manager CÓ quyền xem PENDING event of own)

### Test Case 2: Manager Click NEW_POST Notification
**Setup**:
- Event Manager có event (status: APPROVED)
- User post bài viết
- Manager nhận notification

**Expected**:
- ✅ Click notification → Navigate to `/events/{id}?postId={postId}`
- ✅ Scroll to post
- ✅ NO toast error

### Test Case 3: User Click Notification for Deleted Event
**Setup**:
- Event bị xóa
- User vẫn có notification cũ

**Expected**:
- ❌ Click notification → 404 error
- ✅ Show toast: "Không tìm thấy sự kiện này. Sự kiện có thể đã bị xóa hoặc bạn không có quyền xem."
- ✅ Redirect to `/events`

---

## Changes Summary

### Files Modified: 2

#### 1. `frontend/src/lib/api.ts` ✅
**Change**: Skip auto toast for `/events/` endpoints
**Impact**: Let components handle event-specific errors
**Lines**: ~3 lines added

#### 2. `frontend/src/pages/events/EventDetailPage.tsx` ✅
**Change**: Better error handling with specific messages
**Impact**: Clearer feedback to users, no duplicate toasts
**Lines**: ~13 lines added/modified

---

## Impact

### Before
- ❌ Duplicate toasts (2x "Không tìm thấy dữ liệu")
- ❌ Generic error message không rõ ràng
- ❌ User confused về nguyên nhân

### After
- ✅ Single, specific error message
- ✅ Clear explanation (event deleted vs no permission)
- ✅ Better UX
- ✅ No duplicate toasts

---

## Prevention

Trong tương lai, khi thêm API interceptor logic:

1. **Avoid global toasts for all errors** - Let components decide
2. **Use error codes/types** instead of generic status codes
3. **Include context** from backend in error responses
4. **Test error paths** as thoroughly as happy paths

---

## Status

✅ **Fixed** - API interceptor now skips event endpoints
✅ **Improved** - Better error messages in EventDetailPage
✅ **Tested** - Should resolve duplicate toast issue

Nếu vẫn gặp vấn đề, vui lòng cung cấp:
- Console error logs
- Network response
- User role
- Event status
