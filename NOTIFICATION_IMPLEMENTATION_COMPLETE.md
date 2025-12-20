# Triển Khai Hoàn Chỉnh Hệ Thống Thông Báo

## Tổng Quan

Đã triển khai đầy đủ các notification types còn thiếu với real-time support và debouncing cho likes.

---

## ✅ Các Notification Đã Triển Khai

### 1. **Registration Notifications** ✅ (Đã có sẵn)

| Type | Người Nhận | Trigger | Navigation |
|------|------------|---------|------------|
| `new_registration` | Event Manager | Volunteer đăng ký | `/manage-events` |
| `registration_approved` | Volunteer | Manager duyệt | `/events/{eventId}` |
| `registration_rejected` | Volunteer | Manager từ chối | `/events/{eventId}` |
| `event_completed` | Volunteer | Manager đánh dấu hoàn thành | `/events/{eventId}` |

### 2. **Event Notifications** ✅ (Đã có sẵn)

| Type | Người Nhận | Trigger | Navigation |
|------|------------|---------|------------|
| `event_approved` | Event Manager | Admin duyệt | `/events/{eventId}` |
| `event_rejected` | Event Manager | Admin từ chối | `/manage-events` |
| `event_resubmitted` | Event Manager | Manager update event REJECTED | `/manage-events` |

### 3. **Post Notifications** ✅ (MỚI THÊM)

| Type | Người Nhận | Trigger | Navigation |
|------|------------|---------|------------|
| `new_post` | Event Manager | Ai đó post trên event | `/events/{eventId}` |

**File**: `backend/src/controllers/post.controller.ts`

**Features**:
- ✅ Thông báo cho Event Manager khi có post mới
- ✅ Không notify nếu chính manager post
- ✅ Real-time socket notification
- ✅ Database notification

### 4. **Comment Notifications** ✅ (MỚI THÊM)

| Type | Người Nhận | Trigger | Navigation |
|------|------------|---------|------------|
| `new_comment` | Post Author | Ai đó comment trên post | `/events/{eventId}` |

**File**: `backend/src/controllers/comment.controller.ts`

**Features**:
- ✅ Thông báo cho Post Author khi có comment mới
- ✅ Không notify nếu chính author comment
- ✅ Real-time socket notification
- ✅ Database notification

### 5. **Like Notifications** ✅ (MỚI THÊM + DEBOUNCING)

| Type | Người Nhận | Trigger | Navigation |
|------|------------|---------|------------|
| `new_like` | Post Author | Ai đó like post | `/events/{eventId}` |

**File**: `backend/src/controllers/post.controller.ts`

**Features**:
- ✅ Thông báo cho Post Author khi có like mới
- ✅ Không notify nếu chính author like
- ✅ **Debouncing 5 phút** - Tránh spam notifications
- ✅ Real-time socket notification
- ✅ Database notification

**Debouncing Logic**:
```typescript
// Chỉ gửi notification nếu:
// 1. Đây là like đầu tiên, HOẶC
// 2. Đã qua 5 phút kể từ notification like cuối cùng

const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

const recentLikeNotification = await prisma.notification.findFirst({
  where: {
    userId: post.authorId,
    type: 'new_like',
    data: { path: ['postId'], equals: id },
    createdAt: { gte: fiveMinutesAgo }
  }
});

if (!recentLikeNotification) {
  // Gửi notification
}
```

---

## 🔧 Các Thay Đổi Chi Tiết

### Backend Changes

#### 1. `post.controller.ts` - Create Post
```typescript
// Thêm notification cho manager
if (event.managerId !== userId) {
  const { sendPushNotification } = await import('./notification.controller');
  await sendPushNotification(
    event.managerId,
    'Bài viết mới',
    `${fullName} đã đăng bài viết mới trên sự kiện "${event.title}"`,
    { type: 'new_post', eventId: event.id, postId: post.id }
  );

  io.emit(`user:${event.managerId}:notification`, {
    id: post.id,
    title: 'Bài viết mới',
    message: `${fullName} đã đăng bài viết mới trên sự kiện "${event.title}"`,
    type: 'new_post',
    isRead: false,
    createdAt: new Date().toISOString(),
    data: { eventId: event.id, postId: post.id }
  });
}
```

#### 2. `comment.controller.ts` - Create Comment
```typescript
// Thêm notification cho post author
if (post.authorId !== userId) {
  const { sendPushNotification } = await import('./notification.controller');
  await sendPushNotification(
    post.authorId,
    'Bình luận mới',
    `${fullName} đã bình luận trên bài viết của bạn`,
    { type: 'new_comment', eventId: post.event.id, postId, commentId: comment.id }
  );

  io.emit(`user:${post.authorId}:notification`, {
    id: comment.id,
    title: 'Bình luận mới',
    message: `${fullName} đã bình luận trên bài viết của bạn`,
    type: 'new_comment',
    isRead: false,
    createdAt: new Date().toISOString(),
    data: { eventId: post.event.id, postId, commentId: comment.id }
  });
}
```

#### 3. `post.controller.ts` - Toggle Like
```typescript
// Thêm notification cho post author với debouncing
if (post.authorId !== userId) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const recentLikeNotification = await prisma.notification.findFirst({
    where: {
      userId: post.authorId,
      type: 'new_like',
      data: { path: ['postId'], equals: id },
      createdAt: { gte: fiveMinutesAgo }
    }
  });

  if (!recentLikeNotification) {
    // Gửi notification
    await sendPushNotification(...);
    io.emit(...);
  }
}
```

### Frontend Changes

#### `NotificationDropdown.tsx` - Navigation Logic

```typescript
switch (notification.type) {
  case 'new_registration':
    // Chuyển đến trang quản lý sự kiện
    navigate('/manage-events');
    break;
  
  case 'registration_approved':
  case 'registration_rejected':
  case 'event_completed':
  case 'event_approved':
    navigate(`/events/${eventId}`);
    break;
  
  case 'event_rejected':
  case 'event_resubmitted':
    navigate('/manage-events');
    break;
  
  case 'new_post':
  case 'new_comment':
  case 'new_like':
    // Chuyển đến event discussion
    navigate(`/events/${eventId}`);
    break;
  
  default:
    navigate(`/events/${eventId}`);
}
```

---

## 🎯 Real-time Features

Tất cả notifications đều có real-time support thông qua Socket.IO:

### Socket Events
- `user:${userId}:notification` - User-specific notifications
- `event-${eventId}:new-post` - Event-specific post updates
- `event-${eventId}:new-comment` - Event-specific comment updates
- `event-${eventId}:post-liked` - Event-specific like updates

### Frontend Socket Listeners

File: `NotificationDropdown.tsx`

```typescript
useEffect(() => {
  if (!socket || !isConnected || !user) return;

  const handleNotification = (notification: any) => {
    console.log('🔔 Real-time notification received:', notification);
    
    // Add to notifications list
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast
    toast.success(notification.message, { duration: 5000 });
  };

  socket.on(`user:${user.id}:notification`, handleNotification);
  socket.on('notification', handleNotification);

  return () => {
    socket.off(`user:${user.id}:notification`, handleNotification);
    socket.off('notification', handleNotification);
  };
}, [socket, isConnected, user]);
```

---

## 📊 Notification Structure

Tất cả notifications đều có cấu trúc chuẩn:

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO format
  data: {
    eventId: string;
    postId?: string;
    commentId?: string;
    registrationId?: string;
  };
}
```

---

## 🚀 Testing Guide

### Test Post Notifications

1. Login as User A (not manager)
2. Đăng bài viết trên một event
3. Event Manager phải nhận notification "Bài viết mới"
4. Click notification → phải chuyển đến event detail

### Test Comment Notifications

1. Login as User A, tạo post
2. Login as User B, comment trên post của User A
3. User A phải nhận notification "Bình luận mới"
4. Click notification → phải chuyển đến event detail

### Test Like Notifications (với Debouncing)

1. Login as User A, tạo post
2. Login as User B, like post của User A
3. User A phải nhận notification "Lượt thích mới"
4. User B like lại trong vòng 5 phút → User A KHÔNG nhận notification mới
5. Đợi 5 phút, User B like lại → User A nhận notification mới

### Test Registration Notifications

1. Login as Volunteer, đăng ký event
2. Event Manager phải nhận notification
3. Click notification → phải chuyển đến `/manage-events`

---

## 📝 Notes

### Debouncing Implementation

- **Like notifications**: 5 phút cooldown
- **Mục đích**: Tránh spam khi nhiều người like cùng lúc
- **Logic**: Check notification gần nhất của cùng type và postId trong database

### Navigation Strategy

| Notification Type | User Role | Destination |
|------------------|-----------|-------------|
| `new_registration` | EVENT_MANAGER | `/manage-events` |
| `new_registration` | Others | `/events/{eventId}` |
| `event_rejected` | EVENT_MANAGER | `/manage-events` |
| `event_resubmitted` | EVENT_MANAGER | `/manage-events` |
| All others | Any | `/events/{eventId}` |

### Error Handling

- `formatDate()` có try-catch để handle invalid dates
- Tất cả socket notifications có `createdAt` và `isRead` fields
- Fallback navigation nếu notification type không match

---

## 🎉 Summary

### Đã Hoàn Thành

✅ **7 Registration/Event notifications** (có sẵn, đã fix)
✅ **1 Post notification** (mới thêm)
✅ **1 Comment notification** (mới thêm)
✅ **1 Like notification** (mới thêm + debouncing)

### Features Implemented

✅ Real-time notifications qua Socket.IO
✅ Database persistence
✅ Smart navigation logic
✅ Debouncing cho likes (5 phút)
✅ Error handling cho invalid dates
✅ Notification không gửi cho chính người thực hiện action

### Total Notification Types: **10**

Hệ thống thông báo đã hoàn chỉnh và sẵn sàng sử dụng! 🚀
