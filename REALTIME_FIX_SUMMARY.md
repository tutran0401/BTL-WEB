# FIX: Real-time Dashboard Updates

## Vấn đề
Dashboard không cập nhật real-time khi có hoạt động mới (posts, comments, likes, registrations). 

## Nguyên nhân
**Tên Socket Events không khớp giữa Backend và Frontend:**

### Backend đang emit:
- `new-post` 
- `new-comment`
- `post-liked`
- Không có global events cho dashboard

### Frontend đang lắng nghe:
- `post:created`
- `post:updated`
- `comment:created`
- `like:created`
- `like:removed`
- `registration:created`
- `registration:approved`
- `event:approved`

## Giải pháp đã thực hiện

### 1. ✅ Cập nhật Post Controller
**File: `backend/src/controllers/post.controller.ts`**

#### a) Khi tạo post mới:
```typescript
// Emit socket events
io.to(`event-${eventId}`).emit('new-post', post); // Cho event room
// Also emit global event for dashboard
io.emit('post:created', {
  eventId,
  post
});
```

#### b) Khi xóa post:
```typescript
// Emit socket events
io.to(`event-${post.eventId}`).emit('post-deleted', { postId: id });
// Also emit global event for dashboard
io.emit('post:updated', {
  eventId: post.eventId,
  postId: id,
  action: 'deleted'
});
```

#### c) Khi like/unlike post:
```typescript
// Like
io.emit('like:created', {
  eventId: post.eventId,
  postId: id
});

// Unlike  
io.emit('like:removed', {
  eventId: post.eventId,
  postId: id
});
```

### 2. ✅ Cập nhật Comment Controller
**File: `backend/src/controllers/comment.controller.ts`**

```typescript
// Emit socket events
io.to(`event-${post.event.id}`).emit('new-comment', {
  postId,
  comment
});
// Also emit global event for dashboard
io.emit('comment:created', {
  eventId: post.event.id,
  postId,
  comment
});
```

### 3. ✅ Cập nhật Registration Controller
**File: `backend/src/controllers/registration.controller.ts`**

#### a) Khi đăng ký mới:
```typescript
// Emit global event for dashboard
io.emit('registration:created', {
  eventId: event.id,
  registrationId: registration.id
});
```

#### b) Khi duyệt đăng ký:
```typescript
// Emit global event for dashboard
io.emit('registration:approved', {
  eventId: registration.eventId,
  registrationId: registration.id
});
```

## Cơ chế hoạt động

### Backend
1. Mỗi action quan trọng (create post, like, comment, registration) emit 2 loại events:
   - **Room-specific event**: Cho các user đang ở trong event room (ví dụ: `new-post`, `new-comment`)
   - **Global event**: Cho dashboard (ví dụ: `post:created`, `like:created`)

### Frontend  
1. **SocketContext** (`frontend/src/contexts/SocketContext.tsx`):
   - Tự động connect khi user authenticated
   - Quản lý socket connection state

2. **DashboardPage** (`frontend/src/pages/dashboard/DashboardPage.tsx`):
   - Lắng nghe tất cả global events
   - Sử dụng debouncing (2 seconds) để tránh refresh quá nhiều
   - Khi nhận được event → gọi `fetchDashboard()` để refresh data

### Events được lắng nghe:
```typescript
socket.on('post:created', debouncedRefresh);
socket.on('post:updated', debouncedRefresh);
socket.on('comment:created', debouncedRefresh);
socket.on('like:created', debouncedRefresh);
socket.on('like:removed', debouncedRefresh);
socket.on('registration:created', debouncedRefresh);
socket.on('registration:approved', debouncedRefresh);
socket.on('event:approved', debouncedRefresh);
```

## Kiểm tra

### 1. Restart Backend Server
```bash
cd backend
npm run dev
```

### 2. Refresh Frontend
Refresh trang web để đảm bảo socket connection mới

### 3. Test Real-time Updates
1. **Test Post Creation**:
   - Mở dashboard
   - Tạo post mới trong một event
   - Dashboard sẽ refresh sau 2 giây

2. **Test Like**:
   - Like/unlike một post
   - Dashboard sẽ cập nhật trending events

3. **Test Comment**:
   - Thêm comment vào post
   - Dashboard sẽ cập nhật số lượng comment

4. **Test Registration**:
   - Đăng ký một event mới
   - Dashboard sẽ cập nhật active events

### 4. Kiểm tra Console
Mở browser console để xem socket events:
```
✅ Socket connected: <socket-id>
📊 Dashboard update triggered - refreshing data...
```

## Lợi ích

✅ **Real-time updates**: Dashboard tự động cập nhật khi có hoạt động mới  
✅ **Debouncing**: Tránh refresh quá nhiều (chỉ refresh sau 2s kể từ event cuối cùng)  
✅ **Lightweight**: Chỉ gửi metadata qua socket, fetch full data khi cần  
✅ **Reliable**: Vẫn có room-specific events cho các tính năng khác  

## Troubleshooting

### Nếu vẫn không hoạt động:

1. **Kiểm tra Socket Connection**:
   ```
   Mở Console → Xem có log "✅ Socket connected" không
   ```

2. **Kiểm tra Environment Variables**:
   ```
   Frontend .env: VITE_SOCKET_URL=http://localhost:3000
   Backend .env: FRONTEND_URL=http://localhost:5173
   ```

3. **Kiểm tra CORS**:
   Đảm bảo backend và frontend URL khớp với config trong `server.ts`

4. **Clear Cache & Hard Reload**:
   Ctrl+Shift+R (hoặc Cmd+Shift+R trên Mac)

## Files đã thay đổi

- ✅ `backend/src/controllers/post.controller.ts`
- ✅ `backend/src/controllers/comment.controller.ts`  
- ✅ `backend/src/controllers/registration.controller.ts`

## Tổng kết

Vấn đề real-time update đã được khắc phục bằng cách:
1. Chuẩn hóa tên socket events giữa backend và frontend
2. Thêm global events cho dashboard
3. Sử dụng debouncing để tối ưu performance

Dashboard giờ đây sẽ tự động cập nhật khi có bất kỳ hoạt động nào! 🎉
