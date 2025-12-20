# Debug Guide - "Không Tìm Thấy Dữ Liệu" Error for NEW_COMMENT

## Vấn Đề

User báo: Click vào notification "Bình luận mới" → Hiện error "Không tìm thấy dữ liệu"

## Nguyên Nhân Có Thể

### 1. Event Đã Bị Xóa
- Notification cũ vẫn còn
- Event đã bị manager/admin xóa
- → Backend return 404

### 2. Event Status Thay Đổi
- Event ban đầu APPROVED (có posts/comments)
- Admin reject event sau đó
- User không phải manager → Không có quyền xem REJECTED event
- → Backend return 404

### 3. Post Đã Bị Xóa
- Comment notification reference đến post đã bị xóa
- Event vẫn tồn tại nhưng post không còn
- → POST list load OK nhưng không có post để scroll đến

### 4. Permission Issue
- Event PENDING, user không phải manager
- → Backend return 404

## Debug Steps

### Step 1: Check Console Logs

Open browser console (F12) và check:

```javascript
EventDetailPage mounted: {
    eventId: "...",
    highlightPostId: "...",
    userId: "...",
    userRole: "..."
}

🔍 Loading event details for ID: ...
```

**Nếu thấy**:
```
❌ Load event detail error: ...
Error details: {
    status: 404,
    message: "Event not found",
    eventId: "..."
}
```

→ Event không tồn tại hoặc user không có quyền xem

### Step 2: Check Network Tab

1. Open DevTools → Network
2. Filter: `events`
3. Click notification
4. Check request:
   - URL: `/api/events/{eventId}`
   - Status: 404? 403? 200?
   - Response body: What error message?

### Step 3: Check Notification Data

In console, log notification object:

```javascript
// In NotificationDropdown.tsx
console.log('Notification clicked:', notification);
console.log('Notification data:', notification.data);
```

**Expected data for NEW_COMMENT**:
```javascript
{
    type: 'NEW_COMMENT',
    eventId: "valid-event-id",
    postId: "valid-post-id",
    commentId: "comment-id"
}
```

**Check**:
- eventId có đúng format không?
- postId có tồn tại không?

---

## Solutions

### Solution 1: Add More Logging (Quick Debug)

**File**: `frontend/src/pages/events/EventDetailPage.tsx`

Add to `loadEventDetail`:

```typescript
const loadEventDetail = async () => {
    try {
        setLoading(true);
        console.log('🔍 Loading event details for ID:', id);
        console.log('User:', { id: user?.id, role: user?.role });
        
        const data = await eventService.getEventById(id!);
        
        console.log('✅ Event loaded:', { 
            id: data.id, 
            title: data.title, 
            status: data.status,
            manager: data.manager?.id
        });
        
        setEvent(data);
    } catch (error: any) {
        console.error('❌ Load event error:', {
            eventId: id,
            status: error?.response?.status,
            message: error?.response?.data?.error,
            fullError: error
        });
        
        // ... existing error handling
    }
};
```

### Solution 2: Better Error Messages

Show specific reason for 404:

```typescript
if (status === 404) {
    const specificMessage = message || 
        'Sự kiện không tồn tại hoặc bạn không có quyền xem. ' +
        'Sự kiện có thể đã bị xóa, từ chối, hoặc đang chờ duyệt.';
    toast.error(specificMessage, { duration: 6000 });
}
```

### Solution 3: Handle Missing Post Gracefully

Even if event loads, post might be deleted:

**In PostList.tsx**: Add check for missing post

```typescript
useEffect(() => {
    if (highlightPostId && posts.length > 0 && !hasScrolled.current) {
        const timer = setTimeout(() => {
            const element = document.getElementById(`post-${highlightPostId}`);
            if (element) {
                hasScrolled.current = true;
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // ... highlight
            } else {
                // Post not found!
                console.warn('⚠️ Post not found in list:', highlightPostId);
                console.warn('Available posts:', posts.map(p => p.id));
                toast('Bài viết có thể đã bị xóa', { icon: '⚠️' });
            }
        }, 500);
        return () => clearTimeout(timer);
    }
}, [highlightPostId, posts]);
```

### Solution 4: Add Notification Cleanup

Clean up old notifications for deleted events/posts:

**Backend**: Add cron job to remove notifications for deleted entities

```typescript
// Pseudo-code
async function cleanupStaleNotifications() {
    // Find notifications for deleted events
    const notifications = await prisma.notification.findMany({
        where: {
            type: { in: ['NEW_POST', 'NEW_COMMENT', 'NEW_LIKE'] }
        }
    });
    
    for (const notif of notifications) {
        const eventId = notif.data.eventId;
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        
        if (!event || event.status === 'DELETED') {
            await prisma.notification.delete({ where: { id: notif.id } });
        }
    }
}
```

---

## Testing Scenarios

### Scenario 1: Normal Case (Should Work)

1. Event A is APPROVED
2. User B posts on Event A
3. User C comments on B's post
4. User B receives NEW_COMMENT notification
5. Click notification
6. **Expected**: Navigate to Event A, scroll to post, highlight

### Scenario 2: Event Deleted

1. Event A exists with posts
2. User comments → Notification sent
3. Manager deletes Event A
4. User clicks old notification
5. **Expected**: 404 error, toast "Event không tồn tại..."

### Scenario 3: Event Rejected

1. Event A is APPROVED, has posts/comments
2. Admin rejects Event A (status → REJECTED)
3. Volunteer (post author) clicks NEW_COMMENT notification
4. **Expected**: 404 (volunteer can't see REJECTED events)
5. **Issue**: Confusing for user

**Potential Fix**: Allow original post authors to view their posts even if event rejected?

### Scenario 4: Post Deleted

1. Event A exists
2. Post B has comments
3. Author deletes Post B
4. Commenter clicks old NEW_COMMENT notification
5. **Expected**: Event loads OK, but post not in list
6. **Current**: No error, no scroll (silent fail)
7. **Should**: Show toast "Bài viết đã bị xóa"

---

## Recommended Fixes Priority

### High Priority

1. ✅ **Add better error messages** - Already done
2. ⏳ **Add debug logging** - Need to apply (encoding issues prevent edit)
3. ⏳ **Handle missing post gracefully** - Show toast if post not found after event loads

### Medium Priority

4. **Allow post authors to view their posts in REJECTED events**
   - Currently: Event REJECTED → Volunteer can't see
   - Better: Volunteer can still see their own posts/comments
   - Implementation: Update backend access control

5. **Notification cleanup job**
   - Remove notifications for deleted events/posts
   - Run daily or weekly

### Low Priority

6. **Notification preview validation**
   - Before showing notification, validate entity exists
   - Hide/mark stale notifications

---

## Quick Fix for User

User can manually add logging by:

1. Open browser console (F12)
2. Before clicking notification, run:

```javascript
// Monitor API requests
let originalFetch = window.fetch;
window.fetch = async function(...args) {
    console.log('API Request:', args[0]);
    const result = await originalFetch.apply(this, args);
    console.log('API Response:', result.status, args[0]);
    return result;
};
```

3. Click notification
4. Check console for exact request/response

---

## Current Status

### ✅ Fixes Applied

1. Disabled auto-toast for /events/ endpoints
2. Better error messages in EventDetailPage
3. Fixed infinite scroll with hasScrolled ref

### ⏳ Pending

1. Debug logging (need to add manually due to encoding issues)
2. Missing post toast
3. Notification cleanup

### 🐛 Known Issues

1. **Event REJECTED after approval**: Volunteers lose access to their own posts
2. **Post deleted**: Silent fail, no feedback
3. **Old notifications**: Not cleaned up

---

## Manual Debug Checklist

When user reports "Không tìm thấy dữ liệu":

- [ ] Check console for error logs
- [ ] Check network tab for 404/403
- [ ] Verify eventId in notification data
- [ ] Check if event exists in database
- [ ] Check event status (APPROVED/REJECTED/DELETED)
- [ ] Verify user permissions
- [ ] Check if post still exists
- [ ] Check notification timestamp (how old?)

---

## Next Steps

1. User should:
   - Open console when clicking notification
   - Report exact error message
   - Report eventId from notification data

2. Developer should:
   - Add comprehensive logging
   - Add missing post detection
   - Consider permission model for REJECTED events

3. System should:
   - Clean up stale notifications
   - Validate data before emitting notifications
   - Better error feedback to users
