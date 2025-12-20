# Navigation & Badge Fixes - Implementation Status

## ✅ Đã Hoàn Thành

### Phase 1: Navigation Fix (90% Complete)

#### ✅ Backend - Notification Data
Tất cả notifications đã có `postId` trong data:
- `NEW_POST`: có `eventId` và `postId`
- `NEW_COMMENT`: có `eventId`, `postId`, và `commentId`
- `NEW_LIKE`: có `eventId` và `postId`

#### ✅ Frontend - NotificationDropdown
**File**: `frontend/src/components/layout/NotificationDropdown.tsx`

Updated navigation logic to pass postId via URL:
```typescript
case 'NEW_POST':
case 'NEW_COMMENT':
case 'NEW_LIKE':
    if (notification.data?.eventId) {
        const postId = notification.data?.postId;
        if (postId) {
            navigate(`/events/${eventId}?postId=${postId}`); // ✅ DONE
        } else {
            navigate(`/events/${eventId}`);
        }
    }
    break;
```

#### ✅ Frontend - EventDetailPage  
**File**: `frontend/src/pages/events/EventDetailPage.tsx`

Added:
- ✅ Import `useSearchParams` from react-router-dom
- ✅ Extract `postId` from URL query params
- ✅ Store in `highlightPostId` variable
- ⏳ **TODO**: Pass `highlightPostId` to `PostList` component (line 484)

**Current code (line 484)**:
```tsx
<PostList eventId={event.id} />
```

**Need to change to**:
```tsx
<PostList eventId={event.id} highlightPostId={highlightPostId || undefined} />
```

---

### Phase 2: PostList Component Update (Not Started)

#### ⏳ TODO: Update PostList Component

**File**: `frontend/src/components/social/PostList.tsx`

**Changes needed**:

1. **Add highlightPostId prop**:
```typescript
interface PostListProps {
    eventId: string;
    highlightPostId?: string; // ADD THIS
}

export function PostList({ eventId, highlightPostId }: PostListProps) {
    // ... existing code
}
```

2. **Add scroll-to-post effect**:
```typescript
useEffect(() => {
    if (highlightPostId) {
        // Small delay to ensure posts are rendered
        const timer = setTimeout(() => {
            const element = document.getElementById(`post-${highlightPostId}`);
            if (element) {
                // Scroll to post
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add highlight animation
                element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
                }, 3000);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }
}, [highlightPostId]);
```

3. **Add id to post elements** (if not already there):
```tsx
<div id={`post-${post.id}`} className="...">
    {/* Post content */}
</div>
```

---

### Phase 3: Pending Registration Badge (Not Started)

#### ⏳ TODO: Add Badge to ManageEventsPage

**File**: `frontend/src/pages/manager/ManageEventsPage.tsx`

**Approach**: Frontend tự tính pending count từ registrations data

**Changes needed**:

1. **Track pending count for each event**:
```typescript
const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

// When loading registrations for an event:
const loadPendingCount = async (eventId: string) => {
    try {
        const { registrations } = await registrationService.getEventRegistrations(eventId);
        const pendingCount = registrations.filter(r => r.status === 'PENDING').length;
        setPendingCounts(prev => ({ ...prev, [eventId]: pendingCount }));
    } catch (error) {
        console.error('Error loading pending count:', error);
    }
};
```

2. **Load pending counts when events are fetched**:
```typescript
const fetchMyEvents = async () => {
    // ... existing code to fetch events
    
    // Load pending counts for each event
    for (const event of events) {
        loadPendingCount(event.id);
    }
};
```

3. **Display badge next to event title**:
```tsx
<h3 className="text-xl font-bold text-gray-900">
    {event.title}
    {pendingCounts[event.id] > 0 && (
        <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
            {pendingCounts[event.id]} chờ duyệt
        </span>
    )}
</h3>
```

4. **Update pending count in real-time**:
```typescript
onRegistrationUpdated: (data) => {
    const { registration, action } = data;
    
    // Update pending count
    if (action === 'approved' || action === 'rejected') {
        // Reload pending count for this event
        loadPendingCount(registration.eventId);
    }
    
    // ... existing code
}
```

---

## Quick Implementation Guide

### Step 1: Fix PostList Component Call (1 min)

Open `frontend/src/pages/events/EventDetailPage.tsx`, find line 484:

```tsx
<PostList eventId={event.id} />
```

Change to:

```tsx
<PostList eventId={event.id} highlightPostId={highlightPostId || undefined} />
```

### Step 2: Update PostList Component (5-10 min)

Open `frontend/src/components/social/PostList.tsx`:

1. Add `highlightPostId?: string` to props interface
2. Add useEffect for scroll-to-post (code above)
3. Ensure post div has `id={`post-${post.id}`}`

### Step 3: Add Pending Badge (10-15 min)

Open `frontend/src/pages/manager/ManageEventsPage.tsx`:

1. Add `pendingCounts` state
2. Create `loadPendingCount` function
3. Call it when fetching events
4. Display badge in event card
5. Update count on registration changes

---

## Testing Checklist

### Navigation Testing

- [ ] Click NEW_POST notification → scrolls to post
- [ ] Click NEW_COMMENT notification → scrolls to post  
- [ ] Click NEW_LIKE notification → scrolls to post
- [ ] Post highlights with blue ring
- [ ] Highlight disappears after 3 seconds

### Badge Testing

- [ ] Badge shows correct pending count
- [ ] Badge visible when > 0 pending registrations
- [ ] Badge hidden when 0 pending
- [ ] Badge updates in real-time when approving/rejecting
- [ ] Badge has pulse animation for attention

---

## Status Summary

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Navigation with postId | ✅ Done | ⏳ 90% | Need PostList update |
| Scroll to post | N/A | ⏳ Pending | Need PostList useEffect |
| Pending badge data | ✅ Has API | ⏳ Pending | Need state management |
| Pending badge UI | N/A | ⏳ Pending | Need JSX |

**Overall Progress**: 60% Complete

**Estimated Time to Finish**: 20-30 minutes
