# Audit Logic Thông Báo - Các Vấn Đề Cần Sửa

## Vấn Đề Phát Hiện

### 1. ❌ Navigation Không Chính Xác cho Posts/Comments/Likes

**Hiện tại**: 
- Click vào notification NEW_POST/NEW_COMMENT/NEW_LIKE → Chỉ chuyển đến `/events/{eventId}`
- Không scroll xuống post cụ thể hoặc comment cụ thể

**Vấn đề**:
- EventDetailPage hiển thị PostList ở dưới cùng
- User phải scroll xuống mới thấy được post  
- Không focus vào post/comment cụ thể được nhắc đến trong notification

**Giải pháp đề xuất**:
1. PostList component cần hỗ trợ prop `highlightPostId`
2. Navigation cần pass postId qua query params: `/events/{eventId}?postId={postId}`
3. PostList tự động scroll và highlight post được chỉ định

### 2. ❌ Thiếu Badge Hiển Thị Pending Registrations

**Hiện tại**:
- ManageEventsPage không hiển thị badge số lượng đăng ký chờ duyệt
- Manager không biết có bao nhiêu đăng ký mới cần xử lý

**Vấn đề**:
- Backend trả về `_count.registrations` nhưng đếm TẤT CẢ registrations
- Không có field riêng cho pending registrations

**Giải pháp đề xuất**:
1. Backend: Thêm `_count.pendingRegistrations` vào event response
2. Frontend: Hiển thị badge với số pending registrations
3. Badge nổi bật với màu đỏ/cam để thu hút attention

### 3. ⚠️ Notification Data Thiếu Thông Tin

**Hiện tại**:
```typescript
{ type: 'NEW_POST', eventId, postId }
{ type: 'NEW_COMMENT', eventId, postId, commentId }  
{ type: 'NEW_LIKE', eventId, postId }
```

**Vấn đề**:
- Có postId nhưng frontend không sử dụng
- Không có authorName trong notification data

**Giải pháp đề xuất**:
- Include author info trong notification data để hiển thị tốt hơn
- Frontend sử dụng postId để navigate đúng

---

## Chi Tiết Các Sửa Lưu

### Fix 1: Update Navigation Logic

**File**: `frontend/src/components/layout/NotificationDropdown.tsx`

```typescript
case 'NEW_POST':
case 'NEW_COMMENT':
case 'NEW_LIKE':
    // Chuyển đến event và scroll đến post cụ thể
    if (notification.data?.eventId) {
        const postId = notification.data?.postId;
        if (postId) {
            navigate(`/events/${notification.data.eventId}?postId=${postId}`);
        } else {
            navigate(`/events/${notification.data.eventId}`);
        }
    }
    break;
```

### Fix 2: Update PostList Component

**File**: `frontend/src/components/social/PostList.tsx`

Cần thêm:
1. Accept `highlightPostId` prop
2. useEffect để scroll đến post khi component mount
3. Highlight post với border/background khác biệt

```typescript
interface PostListProps {
    eventId: string;
    highlightPostId?: string; // NEW
}

useEffect(() => {
    if (highlightPostId) {
        const element = document.getElementById(`post-${highlightPostId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight class temporarily
            element.classList.add('highlight-post');
            setTimeout(() => {
                element.classList.remove('highlight-post');
            }, 3000);
        }
    }
}, [highlightPostId]);
```

### Fix 3: Update EventDetailPage to Pass highlight Props

**File**: `frontend/src/pages/events/EventDetailPage.tsx`

```typescript
import { useSearchParams } from 'react-router-dom';

export default function EventDetailPage() {
    const [searchParams] = useSearchParams();
    const highlightPostId = searchParams.get('postId');
    
    // ...
    
    return (
        // ...
        {event.status === 'APPROVED' && (
            <div className="mt-8">
                <PostList 
                    eventId={event.id} 
                    highlightPostId={highlightPostId || undefined}
                />
            </div>
        )}
    );
}
```

### Fix 4: Add Pending Registrations Count (Backend)

**File**: `backend/src/controllers/event.controller.ts`

Update event queries để include pending count:

```typescript
include: {
    _count: {
        select: {
            registrations: {
                where: { status: { in: ['APPROVED', 'COMPLETED'] } }
            },
            posts: true
        }
    },
    // NEW: Add separate count for pending
    pendingRegistrations: {
        where: { status: 'PENDING' },
        select: { id: true }
    }
}

// Then transform:
const eventsWithPendingCount = events.map(event => ({
    ...event,
    _count: {
        ...event._count,
        pendingRegistrations: event.pendingRegistrations?.length || 0
    },
    pendingRegistrations: undefined // Remove array
}));
```

### Fix 5: Update Event Interface (Frontend)

**File**: `frontend/src/services/eventService.ts`

```typescript
export interface Event {
    // ...existing fields
    _count?: {
        registrations: number;
        posts: number;
        pendingRegistrations: number; // NEW
    };
}
```

### Fix 6: Add Pending Badge to ManageEventsPage

**File**: `frontend/src/pages/manager/ManageEventsPage.tsx`

```tsx
{event._count?.pendingRegistrations > 0 && (
    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
        {event._count.pendingRegistrations} chờ duyệt
    </span>
)}
```

---

## Checklist Triển Khai

### Phase 1: Navigation Fixes
- [ ] Update NotificationDropdown to pass postId in URL
- [ ] Add useSearchParams to EventDetailPage
- [ ] Pass highlightPostId to PostList

### Phase 2: PostList Enhancements  
- [ ] Add highlightPostId prop to PostList
- [ ] Implement scroll-to-post logic
- [ ] Add highlight styling (border/background)
- [ ] Auto-remove highlight after 3s

### Phase 3: Backend Pending Count
- [ ] Update event.controller.ts queries
- [ ] Add pendingRegistrations count
- [ ] Test API responses

### Phase 4: Frontend Pending Badge
- [ ] Update Event interface
- [ ] Add badge to ManageEventsPage event cards
- [ ] Style badge prominently

### Phase 5: Testing
- [ ] Test NEW_POST notification → scrolls to post
- [ ] Test NEW_COMMENT notification → scrolls to post with comment
- [ ] Test NEW_LIKE notification → scrolls to post
- [ ] Test pending registration badge visibility 
- [ ] Test badge updates in real-time

---

## Ưu Tiên

1. **HIGH**: Pending registration badge (helps managers see work needed)
2. **MEDIUM**: Post scroll/highlight (improves UX but not critical)
3. **LOW**: Comment-specific highlight (nice to have)
