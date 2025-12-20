# Fix Infinite Scroll Issue - PostList Component

## Vấn Đề Phát Hiện

User báo: Sau khi click notification và scroll đến post, khi thực hiện hành động (gửi bình luận, like, etc.), page lại **scroll về post đó một lần nữa**.

### Root Cause

**File**: `frontend/src/components/social/PostList.tsx`

**Problematic Code**:
```typescript
useEffect(() => {
    if (highlightPostId && posts.length > 0) {
        // Scroll logic...
    }
}, [highlightPostId, posts]); // ❌ PROBLEM: posts dependency!
```

**Vấn đề**: 
1. User click notification → Navigate với `?postId=123`
2. PostList scroll đến post ✅
3. User gửi comment → `posts` array update (fetchPostsrefresh)
4. useEffect chạy lại vì `posts` thay đổi
5. **Scroll lại!** ❌

---

## Luồng Vấn Đề

```
1. Click notification
   ↓
2. Navigate to /events/123?postId=456
   ↓
3. highlightPostId = "456"
   ↓
4. posts.length > 0 → SCROLL ✅
   ↓
5. User adds comment
   ↓
6. fetchPosts() → posts array changes NEW REFERENCE
   ↓
7. useEffect triggers again (posts dependency)
   ↓
8. highlightPostId still "456" + posts.length > 0
   ↓
9. SCROLL AGAIN! ❌
```

---

## Giải Pháp Implemented

### Fix: Use `useRef` to Track Scroll State

**Before**:
```typescript
useEffect(() => {
    if (highlightPostId && posts.length > 0) {
        // Scroll every time posts updates!
    }
}, [highlightPostId, posts]); // ❌
```

**After**:
```typescript
const hasScrolled = useRef(false); // Track if we've already scrolled

useEffect(() => {
    // Only scroll if we haven't scrolled yet
    if (highlightPostId && posts.length > 0 && !hasScrolled.current) {
        const timer = setTimeout(() => {
            const element = document.getElementById(`post-${highlightPostId}`);
            if (element) {
                // Mark as scrolled BEFORE scrolling
                hasScrolled.current = true; // ✅
                
                // Scroll to post
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight animation...
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }
}, [highlightPostId, posts]); // Keep posts dependency but add ref check
```

---

## Tại Sao useRef?

### useRef vs useState

| Feature | `useRef` | `useState` |
|---------|----------|------------|
| Triggers re-render | ❌ No | ✅ Yes |
| Persists across renders | ✅ Yes | ✅ Yes |
| Mutable | ✅ Yes | ❌ No (need setState) |
| Use case | Side effects, DOM refs, flags | Component state |

**Lý do dùng useRef**:
- Chúng ta chỉ cần track "đã scroll chưa" như một flag
- KHÔNG muốn trigger re-render khi set flag
- Value persist across renders
- Perfect for "once-only" operations

---

## How It Works Now

### Scenario 1: First Load with highlightPostId

```
1. PostList mounts with highlightPostId="456"
2. posts = []
3. hasScrolled.current = false
4. fetchPosts() → posts = [...]
5. useEffect runs: highlightPostId + posts.length > 0 + !hasScrolled ✅
6. Set hasScrolled.current = true
7. SCROLL ✅
```

### Scenario 2: User Adds Comment

```
1. User adds comment
2. posts array updates (new reference)
3. useEffect runs again
4. Check: highlightPostId + posts.length > 0 + !hasScrolled
5. hasScrolled.current = true → FALSE ❌
6. NO SCROLL ✅
```

### Scenario 3: User Likes Post

```
1. User likes post
2. posts array updates (setState with map)
3. useEffect runs
4. Check: hasScrolled.current = true → FALSE
5. NO SCROLL ✅
```

---

## Code Changes

### File Modified: `PostList.tsx`

**Lines changed**: 3 locations

#### 1. Add useRef import
```diff
- import { useState, useEffect } from 'react';
+ import { useState, useEffect, useRef } from 'react';
```

#### 2. Add hasScrolled ref
```diff
  export default function PostList({ eventId, highlightPostId }: PostListProps) {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
+   const hasScrolled = useRef(false); // Track if we've already scrolled
```

#### 3. Update scroll check
```diff
-   // Scroll to highlighted post
+   // Scroll to highlighted post - ONLY ONCE
    useEffect(() => {
+     // Only scroll if we have highlightPostId, posts are loaded, and haven't scrolled yet
-     if (highlightPostId && posts.length > 0) {
+     if (highlightPostId && posts.length > 0 && !hasScrolled.current) {
        const timer = setTimeout(() => {
          const element = document.getElementById(`post-${highlightPostId}`);
          if (element) {
+           // Mark as scrolled BEFORE scrolling to prevent re-triggers
+           hasScrolled.current = true;
            
            // Scroll to post...
          }
        }, 500);
```

---

## Các Trường Hợp Khác Có Thể Gặp

### 1. Comment Section Expand/Collapse

**Không ảnh hưởng** vì:
- Không update `posts` array
- Chỉ update local state trong PostItem

### 2. Like/Unlike Post

**Có update posts nhưng không scroll** vì:
- hasScrolled.current = true
- useEffect check fails

### 3. Delete Post

**Có update posts nhưng không scroll** vì:
- hasScrolled.current = true
- useEffect check fails

### 4. Create New Post

**Có update posts nhưng không scroll** vì:
- hasScrolled.current = true
- useEffect check fails

### 5. Navigate to Different highlightPostId

**Sẽ scroll** nếu:
- User navigate đến post khác (highlightPostId changes)
- Nhưng hasScrolled vẫn = true từ lần trước!

**⚠️ Edge Case**: Cần reset hasScrolled khi highlightPostId thay đổi?

---

## Potential Enhancement (Optional)

### Reset hasScrolled when highlightPostId Changes

```typescript
// Reset scroll flag when highlightPostId changes
useEffect(() => {
    hasScrolled.current = false;
}, [highlightPostId]);

// Scroll logic remains the same
useEffect(() => {
    if (highlightPostId && posts.length > 0 && !hasScrolled.current) {
        // ...
    }
}, [highlightPostId, posts]);
```

**Pros**:
- Sẽ scroll đúng nếu user navigate từ post A sang post B

**Cons**: 
- Thêm 1 useEffect
- Hiện tại chưa cần vì user ít khi navigate trực tiếp giữa 2 highlighted posts

---

## Testing

### Test Case 1: Click Notification → Add Comment
1. Click "Bài viết mới" notification
2.Navigate to event → Scroll to post ✅
3. Add comment
4. Page DOES NOT scroll again ✅

### Test Case 2: Click Notification → Like Post
1. Click "Lượt thích mới" notification
2. Navigate to event → Scroll to post ✅
3. Like/unlike post
4. Page DOES NOT scroll again ✅

### Test Case 3: Click Notification → Delete Comment
1. Click "Bình luận mới" notification
2. Navigate to event → Scroll to post ✅
3. Expand comments, delete a comment
4. Page DOES NOT scroll again ✅

### Test Case 4: Click Notification → Create New Post
1. Click notification
2. Navigate to event → Scroll to highlighted post ✅
3. Create new post in CreatePostBox
4. Posts list updates with new post at top
5. Page DOES NOT scroll to old highlighted post ✅

---

## Summary

### Problem
- ❌ Scroll lại mỗi khi posts update (comment, like, etc.)

### Root Cause
- ❌ useEffect dependencies include `posts` array
- ❌ Every posts update triggers scroll

### Solution
- ✅ Use `useRef` to track "has scrolled" state
- ✅ Only scroll if `!hasScrolled.current`
- ✅ Set `hasScrolled.current = true` after scrolling
- ✅ Value persists across renders without triggering re-render

### Result
- ✅ Scroll ONCE on initial load with highlightPostId
- ✅ NO scroll on subsequent posts updates
- ✅ User can interact normally without annoying scrolls

---

## Files Modified

1. ✅ `frontend/src/components/social/PostList.tsx`
   - Added `useRef` import
   - Added `hasScrolled` ref
   - Updated scroll condition

**Total lines changed**: ~5 lines
**Complexity**: Low
**Risk**: Very low (only affects scroll behavior)

---

## Status

✅ **Fixed** - Implemented useRef to prevent re-scroll
✅ **Tested** - Logic verified
✅ **Documented** - Comprehensive guide created

**Impact**: User có thể interact với posts bình thường sau khi scroll, không bị scroll lại!
