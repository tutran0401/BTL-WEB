# Cập nhật EventsPage và EventDetailPage

## 📋 Tóm tắt các thay đổi

### 1. **EventsPage.tsx** - Trang danh sách sự kiện

#### Các cải tiến đã thực hiện:

✅ **Debouncing cho tìm kiếm**
- Thêm debounce 500ms cho input tìm kiếm
- Giảm số lượng API calls khi người dùng đang gõ
- Cải thiện hiệu suất và trải nghiệm người dùng

✅ **Real-time updates**
- `onEventApproved`: Tự động thêm sự kiện mới được duyệt vào danh sách
- `onEventUpdated`: Cập nhật thông tin sự kiện theo thời gian thực
- `onEventDeleted`: Xóa sự kiện khỏi danh sách khi bị xóa
- `onEventRejected`: Xóa sự kiện khỏi danh sách khi bị từ chối

✅ **Logic hiển thị đúng**
- Backend đã filter đúng: chỉ hiển thị sự kiện APPROVED cho Volunteer/Guest
- Sự kiện PENDING, REJECTED, CANCELLED không hiển thị cho người dùng thường

---

### 2. **EventDetailPage.tsx** - Trang chi tiết sự kiện

#### Các cải tiến đã thực hiện:

✅ **Badge "Đang diễn ra"**
- Hiển thị badge động với gradient màu cam-đỏ (`from-orange-500 to-red-500`)
- Thêm hiệu ứng `animate-pulse` để thu hút sự chú ý
- Chỉ hiển thị khi sự kiện đang trong thời gian diễn ra
- Icon 🔥 để làm nổi bật

✅ **Real-time updates**
- `onRegistrationUpdated`: Cập nhật trạng thái đăng ký của người dùng
- `onEventUpdated`: Phát hiện khi sự kiện bị cập nhật/hủy/từ chối và redirect
- `onEventDeleted`: Phát hiện khi sự kiện bị xóa và redirect về trang danh sách
- `onEventRejected`: Phát hiện khi sự kiện bị từ chối và redirect

✅ **Xử lý các trường hợp đặc biệt**
- Hiển thị thông báo toast khi sự kiện bị xóa/từ chối/hủy
- Tự động redirect về trang danh sách sau 2 giây
- Đảm bảo người dùng không bị mắc kẹt ở trang sự kiện không tồn tại

---

### 3. **SocketContext.tsx** - Context quản lý WebSocket

#### Các cải tiến đã thực hiện:

✅ **Thêm listeners mới**
- `onEventDeleted`: Lắng nghe event `event:deleted`
- `onEventRejected`: Lắng nghe event `event:rejected`

✅ **Hỗ trợ global events**
- Events này được broadcast toàn cục (không phụ thuộc userId)
- Cho phép tất cả người dùng nhận được cập nhật khi sự kiện bị xóa/từ chối

---

### 4. **useRealtimeUpdates.ts** - Hook quản lý real-time updates

#### Các cải tiến đã thực hiện:

✅ **Mở rộng interface**
- Thêm `onEventDeleted` và `onEventRejected` vào options
- Sử dụng refs để tránh re-subscription không cần thiết

✅ **Tích hợp với SocketContext**
- Kết nối với các listeners mới từ SocketContext
- Đảm bảo cleanup đúng cách khi component unmount

---

## 🎯 Các hành động có thể xảy ra với Event

### Backend Events (từ schema.prisma):

```prisma
enum EventStatus {
  PENDING    // Chờ duyệt
  APPROVED   // Đã duyệt
  REJECTED   // Bị từ chối
  COMPLETED  // Đã hoàn thành
  CANCELLED  // Đã hủy
}
```

### Các hành động và xử lý:

| Hành động | Backend Socket Event | Frontend Handler | EventsPage | EventDetailPage |
|-----------|---------------------|------------------|------------|-----------------|
| **Tạo mới** | - | - | ❌ Không hiển thị (PENDING) | ❌ Không thể xem |
| **Approve** | `event:approved` | `onEventApproved` | ✅ Thêm vào danh sách | ✅ Có thể xem |
| **Update** | `event:updated` | `onEventUpdated` | ✅ Cập nhật thông tin | ✅ Reload chi tiết |
| **Reject** | `event:rejected` | `onEventRejected` | ✅ Xóa khỏi DS | ✅ Redirect + toast |
| **Delete** | `event:deleted` | `onEventDeleted` | ✅ Xóa khỏi DS | ✅ Redirect + toast |
| **Cancel** | `event:updated` (status=CANCELLED) | `onEventUpdated` | ✅ Xóa khỏi DS | ✅ Redirect + toast |

---

## 🔄 Flow xử lý Real-time

### EventsPage Flow:
```
1. User đang xem danh sách sự kiện
2. Admin/Manager thực hiện hành động (approve/delete/reject)
3. Backend emit socket event
4. Frontend Socket listener nhận event
5. useRealtimeUpdates hook xử lý
6. EventsPage update state:
   - Approved: Refresh list
   - Updated: Update event info
   - Deleted/Rejected: Remove from list
7. UI tự động cập nhật
```

### EventDetailPage Flow:
```
1. User đang xem chi tiết sự kiện
2. Admin/Manager thực hiện hành động
3. Backend emit socket event
4. Frontend Socket listener nhận event
5. useRealtimeUpdates hook xử lý
6. EventDetailPage:
   - Updated (normal): Reload event details
   - Updated (cancelled/rejected): Toast + Redirect
   - Deleted: Toast + Redirect
   - Rejected: Toast + Redirect
7. User được thông báo và chuyển hướng (nếu cần)
```

---

## 🎨 UI Improvements

### Badge "Đang diễn ra":
```tsx
<span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full shadow-lg animate-pulse">
  🔥 Đang diễn ra
</span>
```

**Đặc điểm:**
- Gradient cam-đỏ nổi bật
- Animation pulse để thu hút chú ý
- Chỉ hiển thị khi `startDate <= now <= endDate`
- Kết hợp với category badge

---

## ✅ Checklist hoàn thành

- [x] Debouncing cho search trong EventsPage
- [x] Real-time updates cho EventsPage (approve, update, delete, reject)
- [x] Badge "Đang diễn ra" trong EventDetailPage
- [x] Real-time updates cho EventDetailPage (registration, event updates, delete, reject)
- [x] Xử lý redirect khi event bị xóa/từ chối
- [x] Toast notifications cho các hành động quan trọng
- [x] Thêm global event listeners (delete, reject) vào SocketContext
- [x] Mở rộng useRealtimeUpdates hook
- [x] Logic filter đúng: chỉ hiển thị APPROVED events cho người dùng thường

---

## 🧪 Cách test

### Test Debouncing:
1. Mở EventsPage
2. Gõ vào ô tìm kiếm
3. Kiểm tra Network tab: chỉ có 1 request sau khi ngừng gõ 500ms

### Test Real-time Updates (EventsPage):
1. Mở 2 tabs: Tab A (EventsPage), Tab B (Admin/Manager panel)
2. Từ Tab B, approve/delete/reject một event
3. Tab A sẽ tự động cập nhật danh sách

### Test Real-time Updates (EventDetailPage):
1. Mở 2 tabs: Tab A (EventDetailPage), Tab B (Admin panel)
2. Từ Tab B, delete hoặc reject event đó
3. Tab A sẽ hiển thị toast và redirect về EventsPage

### Test Badge "Đang diễn ra":
1. Tạo event với thời gian hiện tại nằm giữa startDate và endDate
2. Mở EventDetailPage
3. Badge "🔥 Đang diễn ra" sẽ xuất hiện với animation pulse

---

## 📝 Notes

- Tất cả socket events đều có logging trong console để debug
- Debounce time có thể điều chỉnh (hiện tại: 500ms)
- Redirect delay có thể điều chỉnh (hiện tại: 2000ms)
- Toast notifications tự động dismiss sau 5 giây
