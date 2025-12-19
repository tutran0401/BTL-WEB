# Smooth UX Tips - Apply Everywhere

## 🎨 Patterns You Can Reuse

### 1. Silent Background Refresh Pattern

**Use case:** Any list or data that updates frequently

```typescript
const [data, setData] = useState<T[]>([]);
const [isRefreshing, setIsRefreshing] = useState(false);

const fetchData = async (silent = false) => {
  if (silent) setIsRefreshing(true);
  else setLoading(true);
  
  const result = await api.getData();
  setData(result);
  
  if (silent) setIsRefreshing(false);
  else setLoading(false);
};

// Real-time update
socket.on('data:updated', () => fetchData(true));
```

✅ **Apply to:**
- Event lists
- Registration lists
- Notification feed
- Comment sections

---

### 2. Smooth Opacity Transition

**Use case:** Any content that refreshes

```tsx
<div 
  className="transition-opacity duration-300"
  style={{ opacity: isRefreshing ? 0.7 : 1 }}
>
  {content}
</div>
```

✅ **Apply to:**
- Cards
- Tables
- Lists
- Sections

---

### 3. Subtle Progress Indicator

**Use case:** Show activity without blocking

```tsx
{isRefreshing && (
  <div className="fixed top-0 left-0 right-0 z-50 h-1 
       bg-gradient-to-r from-blue-500 to-purple-500 
       animate-pulse" />
)}
```

**Variations:**
- Top bar (global updates)
- Bottom of section (section updates)
- Circular spinner in corner (background tasks)

✅ **Apply to:**
- Page-level updates
- Section refreshes
- Background saves

---

### 4. Debounced Updates

**Use case:** Prevent update spam

```typescript
import { debounce } from '../utils/debounce';

const debouncedUpdate = useMemo(
  () => debounce(() => {
    updateData();
  }, 3000),
  [updateData]
);
```

**Best durations:**
- Search input: 500ms
- Auto-save: 2000ms
- Real-time updates: 3000ms
- Analytics: 5000ms

✅ **Apply to:**
- Search bars
- Filter controls
- Auto-save forms
- Real-time feeds

---

### 5. Optimistic UI Updates

**Use case:** Instant feedback

```typescript
const handleLike = async (postId: string) => {
  // 1. Instant UI update
  setLikes(prev => prev + 1);
  
  try {
    // 2. Backend call
    await api.likePost(postId);
  } catch (error) {
    // 3. Rollback on error
    setLikes(prev => prev - 1);
    toast.error('Failed to like');
  }
};
```

✅ **Apply to:**
- Like/Unlike buttons
- Follow/Unfollow
- Add to favorites
- Simple toggles

---

### 6. Skeleton Loading

**Use case:** Better than spinner

```tsx
{loading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
) : (
  <Content data={data} />
)}
```

✅ **Apply to:**
- Initial page loads
- Card placeholders
- Table rows
- Image loading

---

### 7. Stale-While-Revalidate

**Use case:** Show cached data while fetching

```typescript
const [data, setData] = useState(() => {
  // Load from cache immediately
  return localStorage.getItem('dashboard') 
    ? JSON.parse(localStorage.getItem('dashboard')!)
    : null;
});

useEffect(() => {
  // Fetch fresh data in background
  fetchDashboard().then(fresh => {
    setData(fresh);
    localStorage.setItem('dashboard', JSON.stringify(fresh));
  });
}, []);
```

✅ **Apply to:**
- Dashboard
- User profile
- Static content
- Config data

---

### 8. Error Boundaries with Retry

**Use case:** Graceful error handling

```tsx
{error ? (
  <div className="text-center py-8">
    <p className="text-red-600 mb-4">{error.message}</p>
    <button 
      onClick={() => retry()}
      className="btn-primary"
    >
      Thử lại
    </button>
  </div>
) : (
  <Content />
)}
```

✅ **Apply to:**
- API failures
- Network errors
- Component crashes

---

### 9. Progressive Loading

**Use case:** Load important content first

```typescript
useEffect(() => {
  // Load critical data first
  loadCriticalData().then(() => {
    setShowCritical(true);
    
    // Then load secondary data
    loadSecondaryData().then(() => {
      setShowAll(true);
    });
  });
}, []);
```

✅ **Apply to:**
- Event detail page (details first, then comments)
- Profile page (user info first, then stats)
- Dashboard (stats first, then lists)

---

### 10. Blur Content During Update

**Use case:** Visual feedback without hiding

```tsx
<div 
  className="transition-all duration-300"
  style={{ 
    filter: isUpdating ? 'blur(2px)' : 'none',
    pointerEvents: isUpdating ? 'none' : 'auto'
  }}
>
  {content}
</div>
```

✅ **Apply to:**
- Form submissions
- Complex updates
- Critical operations

---

## 🎯 When to Use What

| Scenario | Best Pattern | Why |
|----------|--------------|-----|
| Frequent updates | Silent refresh + Opacity | Least disruptive |
| User action | Optimistic UI | Feels instant |
| Initial load | Skeleton loading | Better than spinner |
| Search/Filter | Debouncing | Reduce API calls |
| Background task | Top progress bar | Shows activity |
| Critical data | Blur + Disable | Prevent conflicts |
| Cached data | Stale-while-revalidate | Instant + Fresh |

---

## ⚡ Performance Tips

### 1. Use CSS transitions over JS animations
```tsx
// ✅ Good
className="transition-opacity duration-300"

// ❌ Bad
setInterval(() => setOpacity(...), 16)
```

### 2. Debounce aggressively
```typescript
// Too fast = too many updates
debounce(fn, 500)  // ❌ For real-time

// Just right
debounce(fn, 3000) // ✅ For real-time
```

### 3. Cancel in-flight requests
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetch(url, { signal: controller.signal });
  
  return () => controller.abort();
}, []);
```

---

## 🚫 Anti-patterns to Avoid

### ❌ Don't: Multiple loading states
```typescript
const [loading1, setLoading1] = useState(false);
const [loading2, setLoading2] = useState(false);
const [loading3, setLoading3] = useState(false);
```

### ✅ Do: Single loading enum
```typescript
const [loadingState, setLoadingState] = useState<
  'idle' | 'loading' | 'refreshing' | 'error'
>('idle');
```

---

### ❌ Don't: Immediate updates without debouncing
```typescript
socket.on('update', () => {
  fetchData(); // Called 100 times/second!
});
```

### ✅ Do: Debounced updates
```typescript
socket.on('update', debouncedFetch);
```

---

### ❌ Don't: Hidden content during refresh
```typescript
{loading && <Spinner />}
{!loading && <Content />}
```

### ✅ Do: Overlay or fade
```typescript
<div style={{ opacity: loading ? 0.5 : 1 }}>
  <Content />
  {loading && <TopBar />}
</div>
```

---

## 🎉 Summary

**Key principles:**
1. ✅ Keep content visible
2. ✅ Use subtle indicators
3. ✅ Smooth transitions (300ms)
4. ✅ Debounce updates (3s)
5. ✅ Optimistic when possible
6. ✅ Cache and revalidate

**Result:** Professional, smooth, responsive UX! 🚀
