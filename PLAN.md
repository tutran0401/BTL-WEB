# Kế hoạch Tối ưu Dashboard - Dashboard Optimization Plan

> **Ngày tạo:** 2025-12-18  
> **Phiên bản:** 2.0  
> **Trạng thái:** Đề xuất tối ưu hóa

---

## 📋 Tổng quan

Dashboard hiện tại đã được triển khai theo Phase 1 với đầy đủ 3 phần chính:
1. **Sự kiện mới công bố** (New Events)
2. **Sự kiện có trao đổi mới** (Active Events with Discussions)
3. **Sự kiện thu hút** (Trending Events)

Tài liệu này đánh giá lại logic hiện tại và đề xuất các tối ưu hóa về hiệu năng, cấu trúc dữ liệu, và trải nghiệm người dùng.

---

## 🔍 Phân tích Logic hiện tại

### ✅ Điểm Mạnh

1. **Query song song tốt**: Sử dụng `Promise.all()` để chạy các query độc lập song song
2. **Helper functions rõ ràng**: Logic tách biệt tốt trong `dashboardHelpers.ts`
3. **Role-based filtering**: Đúng theo yêu cầu PRD, mỗi role thấy dữ liệu phù hợp
4. **Database indexes**: Đã có indexes cơ bản trên các bảng quan trọng
5. **Trending algorithm**: Formula hợp lý với weighting rõ ràng

### ⚠️ Vấn đề cần Tối ưu

#### 1. **N+1 Query Problem trong Trending Events** 🔴 NGHIÊM TRỌNG

**Vấn đề:**
```typescript
// Line 142-154 trong dashboard.controller.ts
const trendingWithScores = await Promise.all(
  allTrendingCandidates.map(async (event) => {
    const metrics = await getRecentActivityMetrics(event.id, 7);
    // ...
  })
);
```

- Lấy 50 events, sau đó loop qua từng event để tính metrics
- Mỗi event cần **4 queries riêng** (registrations, posts, comments, likes)
- **Tổng: 50 events × 4 queries = 200 queries bổ sung!**
- Thời gian ước tính: **500-1000ms chỉ cho phần trending**

**Hậu quả:**
- Dashboard load chậm (2-3 giây thay vì < 500ms)
- Database overload khi có nhiều users đồng thời
- Không scale được khi có 100+ events

#### 2. **Duplicate Query cho Active Events** 🟡 TRUNG BÌNH

**Vấn đề:**
```typescript
// Line 167-175: Loop thêm lần nữa qua activeEvents
const activeEventsWithStats = await Promise.all(
  activeEvents.map(async (event) => {
    const discussionStats = await getRecentDiscussionStats(event.id);
    // ...
  })
);
```

- Sau khi lấy 20 active events, lại loop để lấy discussion stats
- Mỗi event cần **3 queries riêng**
- **Tổng: 20 events × 3 queries = 60 queries bổ sung**

#### 3. **Dữ liệu dư thừa trong Response** 🟡 TRUNG BÌNH

**Vấn đề:**
- Trending events trả về quá nhiều thông tin (`recentMetrics` có 5 fields)
- Active events duplicates một số field không cần thiết
- Frontend có thể không dùng hết các fields này

**Hậu quả:**
- Response size lớn (20-50KB thay vì 10-20KB)
- Tốn bandwidth, đặc biệt trên mobile
- Frontend parse chậm hơn

#### 4. **Thiếu Caching** 🟠 CAO

**Vấn đề:**
- Mỗi request đều query lại database từ đầu
- Trending calculation chạy lại hoàn toàn mỗi lần
- Không có cache cho user stats

**Hậu quả:**
- Database load cao khi nhiều users
- Tính toán lặp lại không cần thiết
- Chi phí server cao hơn

#### 5. **Thiếu Pagination** 🟡 TRUNG BÌNH

**Vấn đề:**
- Hard-coded `take: 5` cho new events, active events, trending
- Không có option lấy thêm data
- Không có "Load More" functionality

**Hậu quả:**
- UI bị giới hạn cứng
- Khó mở rộng tính năng
- UX không linh hoạt

#### 6. **Trending Time Window cố định** 🟢 THẤP

**Vấn đề:**
- Trending luôn tính theo 7 ngày (hard-coded)
- Active discussions luôn tính theo 24h (hard-coded)
- Không linh hoạt theo nhu cầu

---

## 🎯 Kế hoạch Tối ưu hóa

### Phase A: Tối ưu Database Queries (QUAN TRỌNG NHẤT)

#### A1. Giải quyết N+1 Query cho Trending Events

**Giải pháp:** Sử dụng aggregation queries thay vì loop

**Thay đổi trong `dashboardHelpers.ts`:**

Tạo function mới `getActivityMetricsForMultipleEvents()`:
```typescript
export async function getActivityMetricsForMultipleEvents(
  eventIds: string[],
  days: number = 7
): Promise<Map<string, ActivityMetrics>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Single query với groupBy
  const [regCounts, postCounts, commentCounts, likeCounts] = await Promise.all([
    prisma.registration.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        status: 'APPROVED',
        createdAt: { gte: startDate }
      },
      _count: { _all: true }
    }),
    prisma.post.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        createdAt: { gte: startDate }
      },
      _count: { _all: true }
    }),
    // Similar for comments and likes...
  ]);

  // Build Map để lookup nhanh
  // Return Map<eventId, metrics>
}
```

**Lợi ích:**
- Giảm từ 200 queries → **4 queries**
- Thời gian: từ 500-1000ms → **< 100ms**
- Hiệu suất tăng **10-20x**

#### A2. Tối ưu Discussion Stats

**Giải pháp:** Tương tự, dùng groupBy cho multiple events

**Thay đổi:** Tạo `getDiscussionStatsForMultipleEvents()`
- Giảm từ 60 queries → **3 queries**

#### A3. Thêm Database Indexes mới

**Vấn đề:** Một số indexes còn thiếu cho queries phức tạp

**Thêm vào `schema.prisma`:**
```prisma
model Registration {
  // Existing indexes...
  
  // New: For groupBy eventId with date filter
  @@index([eventId, createdAt(sort: Desc), status])
}

model Post {
  // Existing indexes...
  
  // New: For active events query with join
  @@index([createdAt(sort: Desc), eventId])
}

model Comment {
  // New: For groupBy with post.eventId relation
  @@index([createdAt(sort: Desc)])
}

model Like {
  // New: For trending calculation
  @@index([createdAt(sort: Desc)])
}
```

**Lợi ích:**
- GroupBy queries nhanh hơn 3-5x
- Covering index giảm disk I/O

### Phase B: Implement Caching Strategy

#### B1. Cache User Stats

**Giải pháp:** Cache user stats trong Redis hoặc memory với TTL ngắn

```typescript
// Pseudo-code
const userStatsKey = `user:${userId}:stats`;
let userStats = await cache.get(userStatsKey);

if (!userStats) {
  userStats = await getUserStats(userId, userRole);
  await cache.set(userStatsKey, userStats, 300); // 5 minutes
}
```

**Lợi ích:**
- Giảm load cho user stats queries
- Thời gian response: -50ms average

#### B2. Cache Dashboard Data với Stale-While-Revalidate

**Giải pháp:**
- Cache dashboard data per role (VOLUNTEER, EVENT_MANAGER, ADMIN)
- TTL: 60 seconds
- Background refresh khi stale

**Lợi ích:**
- Dashboard load: < 100ms với cache hit
- Fresh data mỗi 60 giây
- Giảm database load 80-90%

### Phase C: Cải thiện API Response

#### C1. Thêm Pagination Support

**Thay đổi API:**
```typescript
GET /api/dashboard?limit=5&offset=0

// Response includes metadata
{
  newEvents: [...],
  activeEvents: [...],
  trendingEvents: [...],
  pagination: {
    total: 50,
    limit: 5,
    offset: 0,
    hasMore: true
  }
}
```

#### C2. Selective Fields (Optional)

**Cho phép client chọn fields cần thiết:**
```typescript
GET /api/dashboard?fields=newEvents,trendingEvents
// Chỉ trả về 2 sections được yêu cầu
```

**Lợi ích:**
- Response size nhỏ hơn 30-50%
- Bandwidth tiết kiệm
- Mobile-friendly

### Phase D: Code Refactoring

#### D1. Extract Query Logic vào Service Layer

**Tạo:** `backend/src/services/dashboard.service.ts`

Di chuyển logic queries từ controller vào service:
- `DashboardService.getNewEvents()`
- `DashboardService.getActiveEvents()`
- `DashboardService.getTrendingEvents()`
- `DashboardService.getUserStats()`

**Lợi ích:**
- Separation of concerns
- Dễ test hơn
- Dễ maintain hơn

#### D2. Thêm Error Handling chi tiết

**Vấn đề hiện tại:**
```typescript
catch (error) {
  console.error('Get dashboard error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

**Cải thiện:**
- Log structured errors với context
- Trả về error codes cụ thể
- Monitoring và alerting

---

## 📊 So sánh Performance

| Metric | Hiện tại | Sau Tối ưu | Cải thiện |
|--------|----------|------------|-----------|
| **Total Queries** | ~270 queries | ~15 queries | **18x** |
| **Dashboard Load Time** | 2-3s | < 200ms | **10-15x** |
| **Trending Calculation** | 500-1000ms | < 100ms | **10x** |
| **Cache Hit Rate** | 0% | 80-90% | ∞ |
| **Response Size** | 30-50KB | 15-25KB | **2x** |
| **Concurrent Users** | 10-20 | 100-200 | **10x** |

---

## 🗓️ Implementation Roadmap

### Mức độ Ưu tiên

#### 🔴 **Priority 1: Database Query Optimization** (1-2 ngày)
- [ ] Implement `getActivityMetricsForMultipleEvents()`
- [ ] Implement `getDiscussionStatsForMultipleEvents()`
- [ ] Update dashboard controller để dùng batch functions
- [ ] Thêm database indexes mới
- [ ] Test performance improvements

**Lý do:** Giải quyết vấn đề nghiêm trọng nhất (N+1 queries)

#### 🟡 **Priority 2: Caching Layer** (1 ngày)
- [ ] Setup Redis hoặc in-memory cache
- [ ] Implement cache cho user stats
- [ ] Implement cache cho dashboard data
- [ ] Add cache invalidation logic

**Lý do:** Tăng performance và giảm database load đáng kể

#### 🟢 **Priority 3: API Improvements** (0.5 ngày)
- [ ] Add pagination support
- [ ] Add selective fields support
- [ ] Update API documentation

**Lý do:** Cải thiện UX và mở rộng tương lai

#### ⚪ **Priority 4: Code Refactoring** (1 ngày)
- [ ] Extract service layer
- [ ] Improve error handling
- [ ] Add comprehensive logging

**Lý do:** Code quality và maintainability

---

## 🧪 Verification Plan

### 1. Unit Tests

**File:** `backend/tests/dashboard.service.test.ts` (NEW)

```bash
# Test batch metrics functions
npm test -- dashboard.service.test.ts
```

**Test cases:**
- `getActivityMetricsForMultipleEvents()` returns correct data
- `getDiscussionStatsForMultipleEvents()` handles empty events
- Trending score calculation với batch data
- Cache hit/miss scenarios

### 2. Integration Tests

**File:** `backend/tests/dashboard.integration.test.ts` (NEW)

```bash
# Test actual API endpoints
npm test -- dashboard.integration.test.ts
```

**Test cases:**
- GET `/api/dashboard` for each role (VOLUNTEER, EVENT_MANAGER, ADMIN)
- Verify response structure matches expected format
- Verify prioritization logic works correctly
- Test pagination parameters

### 3. Performance Tests

**File:** `backend/tests/dashboard.performance.test.ts` (NEW)

```bash
# Benchmark dashboard queries
npm run test:performance
```

**Metrics to measure:**
- Total query count
- Response time (p50, p95, p99)
- Database connection pool usage
- Memory usage

### 4. Load Testing

**Tool:** k6 hoặc Artillery

```bash
# Install k6
npm install -g k6

# Run load test
k6 run scripts/load-test-dashboard.js
```

**Scenarios:**
- 10 concurrent users → verify < 300ms response
- 50 concurrent users → verify < 500ms response  
- 100 concurrent users → verify < 1s response

### 5. Manual Testing Checklist

**Prerequisites:**
- Database có ít nhất 50 events
- Mỗi event có posts, comments, likes
- Có users với 3 roles khác nhau

**Steps:**

1. **Test VOLUNTEER role:**
   ```bash
   # Login as volunteer
   # GET /api/dashboard
   # Verify registered events appear first in all sections
   ```

2. **Test EVENT_MANAGER role:**
   ```bash
   # Login as event manager
   # GET /api/dashboard
   # Verify their managed events appear first
   ```

3. **Test ADMIN role:**
   ```bash
   # Login as admin
   # GET /api/dashboard
   # Verify all events visible without prioritization
   ```

4. **Test Performance:**
   ```bash
   # Open browser DevTools → Network tab
   # Load dashboard page
   # Verify API response time < 500ms
   # Verify total page load < 1.5s
   ```

5. **Test Caching:**
   ```bash
   # Load dashboard (cold cache) → note response time
   # Reload immediately (warm cache) → verify faster response
   # Wait 60 seconds → reload → verify fresh data
   ```

### 6. Database Testing

**Verify indexes created:**
```sql
-- Connect to PostgreSQL
psql $DATABASE_URL

-- Check indexes on events table
\d events

-- Check indexes on registrations table
\d registrations

-- Should see all indexes from schema.prisma
```

**Query performance testing:**
```sql
-- Test trending events query
EXPLAIN ANALYZE
SELECT * FROM events
WHERE status = 'APPROVED'
ORDER BY "createdAt" DESC
LIMIT 50;

-- Should use index scan, not seq scan
-- Execution time should be < 10ms
```

---

## 📝 Database Schema Changes

### Migration File: `add_dashboard_optimization_indexes`

```prisma
-- Migration: Thêm indexes tối ưu cho dashboard
-- CreateIndex
CREATE INDEX "registrations_eventId_createdAt_status_idx" ON "registrations"("eventId", "createdAt" DESC, "status");

-- CreateIndex  
CREATE INDEX "posts_createdAt_eventId_idx" ON "posts"("createdAt" DESC, "eventId");

-- Migration safe, không cần downtime
```

**Run migration:**
```bash
cd backend
npx prisma migrate dev --name add_dashboard_optimization_indexes
```

---

## ⚠️ Risks & Mitigations

### Risk 1: Cache Invalidation phức tạp

**Risk:** Cache có thể trả về stale data
**Mitigation:** 
- Sử dụng TTL ngắn (60s)
- Implement cache invalidation khi có events mới hoặc updates
- Monitoring cache hit rate

### Risk 2: Batch queries có thể fail với eventIds rất lớn

**Risk:** `eventIds: { in: [1000+ ids] }` có thể slow hoặc timeout
**Mitigation:**
- Giới hạn batch size (max 100 events)
- Chunk large arrays thành batches nhỏ hơn

### Risk 3: Breaking changes cho Frontend

**Risk:** Thay đổi response structure có thể break UI
**Mitigation:**
- Maintain backward compatibility với API version
- Coordinate với frontend team
- Deploy backend trước, test, rồi mới update frontend

---

## 🎓 Technical Learnings

### Why N+1 Queries are Bad

**Ví dụ:** Lấy 50 events, mỗi event cần 4 queries
- Total time = 50 × (query overhead + execution time)
- Query overhead: ~5-10ms mỗi query
- **Total overhead alone: 50 × 4 × 5ms = 1000ms = 1 giây!**

**Solution:** Batch queries với `groupBy`
- Total time = 1 × (query overhead + execution time)
- Chỉ 1 query overhead, data nhiều hơn nhưng DB handle tốt
- **< 100ms total**

### When to Use Caching

**Good candidates:**
- Data ít thay đổi (user stats)
- Expensive calculations (trending scores)
- Read-heavy operations

**Bad candidates:**
- Real-time data (chat messages)
- User-specific writes (registration)
- Data cần 100% accuracy

---

## 📚 References

- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
- [PostgreSQL Query Optimization](https://www.postgresql.org/docs/current/performance-tips.html)
- [API Caching Strategies](https://www.keycdn.com/support/api-caching)

---

## ✅ Acceptance Criteria

Tối ưu hóa được coi là **thành công** khi:

- [ ] Dashboard API response time < 300ms (p95)
- [ ] Total database queries < 20 per request
- [ ] Cache hit rate > 70% sau 1 giờ uptime
- [ ] Hỗ trợ 100+ concurrent users
- [ ] Tất cả tests pass
- [ ] Performance benchmarks achieved
- [ ] Documentation updated
- [ ] Frontend tương thích với changes

---

**End of Document**
