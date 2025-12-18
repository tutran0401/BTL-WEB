# KẾ HOẠCH TRIỂN KHAI DASHBOARD - CHIA THEO PHASES

## TỔNG QUAN DỰ ÁN
**Mục tiêu:** Xây dựng tính năng Dashboard tổng quan cho VolunteerHub với 3 loại người dùng (Tình nguyện viên, Quản lý sự kiện, Admin)

**Thời gian dự kiến:** 3-4 tuần

---

# PHASE 1: PHÂN TÍCH VÀ THIẾT KẾ 

## Mục tiêu Phase 1
Hoàn thành phân tích yêu cầu, thiết kế database schema và API specification

## Công việc chi tiết

### 1.1 Phân tích yêu cầu 
- [x] Review tài liệu PRD đã có
- [x] Xác định rõ các metrics cần tính toán:
  - Sự kiện mới công bố
  - Sự kiện có tin bài/trao đổi mới
  - Sự kiện thu hút (trending)
- [x] Định nghĩa công thức tính "trending score"
  - `trending_score = (registrations_24h × 0.4) + (posts_24h × 0.3) + (likes_24h × 0.3)`
- [x] Xác định khoảng thời gian cho "gần đây"
  - New Events: 7 ngày
  - Active Events: 24 giờ
  - Trending Calculation: 24 giờ

### 1.2 Thiết kế Database 
- [x] Xem xét schema hiện tại của Events, Posts, Comments, Registrations
- [x] Thiết kế bảng/view để lưu trữ metrics:
  ```sql
  - EventStats (event_id, views_count, participants_count, posts_count, comments_count, likes_count, trending_score)
  - EventActivity (event_id, activity_type, count, period)
  - DashboardCache (key, data, expires_at)
  ```
- [x] Thiết kế indexes để tối ưu query performance
- [x] Tạo migration scripts

### 1.3 Thiết kế API (1-2 ngày)
- [x] Định nghĩa API endpoints:
  ```
  GET /api/dashboard/summary              # Tổng quan chung
  GET /api/dashboard/new-events           # Sự kiện mới
  GET /api/dashboard/active-events        # Sự kiện có hoạt động mới
  GET /api/dashboard/trending-events      # Sự kiện thu hút
  GET /api/dashboard/stats                # Thống kê theo role
  GET /api/dashboard/export/events        # Export events
  GET /api/dashboard/export/users         # Export users
  ```

### 1.4 Thiết kế UI/UX (1 ngày)
- [x] Vẽ wireframe cho 3 loại dashboard (Volunteer, Manager, Admin)
- [x] Xác định các component cần thiết:
  - StatsCard component
  - EventCard component
  - TrendingBadge component
  - ActivityItem component
  - DashboardLayout component
- [x] Xác định color scheme và styling guide

## Deliverables Phase 1
- ✅ Document phân tích yêu cầu chi tiết
- ✅ Database schema design + migration scripts
- ✅ API specification document
- ✅ UI wireframes/mockups

---

# PHASE 2: BACKEND DEVELOPMENT (7-10 ngày)

## Mục tiêu Phase 2
Xây dựng backend APIs và business logic cho Dashboard

## Công việc chi tiết

### 2.1 Database Implementation (2 ngày)
- [ ] Chạy migration scripts để tạo tables/views mới
- [ ] Tạo indexes cho performance
- [ ] Seed dữ liệu test
- [ ] Viết scripts để populate historical data

### 2.2 Backend Services (3-4 ngày)

#### Service: DashboardService
- [ ] Implement `getNewEvents()` - lấy sự kiện mới công bố
  - Filter: events với status = 'published'
  - Sort: created_at DESC
  - Limit: 10 events gần nhất
  
- [ ] Implement `getActiveEvents()` - sự kiện có hoạt động mới
  - Join với Posts, Comments
  - Filter: có post/comment trong 7 ngày gần đây
  - Sort: theo thời gian activity gần nhất
  
- [ ] Implement `getTrendingEvents()` - sự kiện thu hút
  - Tính trending_score dựa trên:
    - Số participants tăng trong 24h (weight: 40%)
    - Số posts/comments mới (weight: 30%)
    - Số likes mới (weight: 30%)
  - Sort: trending_score DESC
  - Cache kết quả 15 phút

#### Service: EventStatsService
- [ ] Implement `calculateEventStats()` - tính toán metrics
- [ ] Implement `updateTrendingScores()` - cập nhật trending score
- [ ] Tạo cron job chạy mỗi 30 phút để update stats

### 2.3 Controllers (1-2 ngày)
- [ ] DashboardController với các endpoints:
  - `GET /dashboard/summary`
  - `GET /dashboard/new-events`
  - `GET /dashboard/active-events`
  - `GET /dashboard/trending-events`
- [ ] Implement role-based filtering:
  - Volunteer: chỉ public events + events đã join
  - Manager: public events + own events
  - Admin: all events
- [ ] Implement pagination
- [ ] Add authentication & authorization guards

### 2.4 Testing Backend (2 ngày)
- [ ] Unit tests cho Services (coverage > 80%)
- [ ] Integration tests cho APIs
- [ ] Test performance với large dataset
- [ ] Test role-based access control

## Deliverables Phase 2
- ✅ Backend APIs hoàn chỉnh và tested
- ✅ Database với sample data
- ✅ API documentation cập nhật
- ✅ Cron jobs cho stats calculation

---

# PHASE 3: FRONTEND DEVELOPMENT (7-10 ngày)

## Mục tiêu Phase 3
Xây dựng giao diện Dashboard với Reac

## Công việc chi tiết

### 3.1 Setup & Infrastructure (1 ngày)
- [ ] Tạo folder structure cho Dashboard feature
  ```
  /components/Dashboard/
    - DashboardLayout.tsx
    - EventCard.tsx
    - StatsWidget.tsx
    - TrendingBadge.tsx
    - NewEventsList.tsx
    - ActiveEventsList.tsx
    - TrendingEventsList.tsx
  ```
- [ ] Setup API client với axios/fetch
- [ ] Setup state management (Redux/Zustand/Context)
- [ ] Setup routing

### 3.2 Shared Components (2 ngày)
- [ ] **EventCard Component**
  - Props: event data, variant (new/active/trending)
  - Hiển thị: tên, tổ chức, thời gian, badge
  - Click handler để navigate đến event detail
  
- [ ] **StatsWidget Component**
  - Hiển thị số liệu với icon
  - Animation khi load
  - Variants: số người tham gia, số posts, số likes
  
- [ ] **TrendingBadge Component**
  - Hiển thị trending indicator (🔥 +20 người/24h)
  - Animation effect

### 3.3 Dashboard Sections (3 ngày)

- [ ] **NewEventsList Component**
  - Fetch data từ API `/dashboard/new-events`
  - Hiển thị danh sách sự kiện mới
  - Sort theo ngày công bố
  - Show skeleton loading state
  
- [ ] **ActiveEventsList Component**
  - Fetch data từ API `/dashboard/active-events`
  - Hiển thị số posts/comments mới
  - Badge màu xanh cho "new activity"
  
- [ ] **TrendingEventsList Component**
  - Fetch data từ API `/dashboard/trending-events`
  - Hiển thị trending score & metrics
  - Animation cho top 3 events

### 3.4 Dashboard Layout (2 ngày)
- [ ] **DashboardLayout Component**
  - Grid layout responsive (desktop: 3 columns, mobile: 1 column)
  - Header với greeting message
  - Quick stats summary bar
  - 3 sections: New Events, Active Events, Trending Events
  
- [ ] **Role-based Customization**
  - Volunteer dashboard: Focus on discover & join
  - Manager dashboard: Highlight own events
  - Admin dashboard: System-wide overview

### 3.5 Data Fetching & State (1 ngày)
- [ ] Implement custom hooks:
  - `useDashboardData()` - fetch all dashboard data
  - `useNewEvents()` - fetch new events
  - `useActiveEvents()` - fetch active events
  - `useTrendingEvents()` - fetch trending events
- [ ] Implement auto-refresh every 5 minutes
- [ ] Handle loading, error states
- [ ] Implement caching với SWR hoặc React Query

### 3.6 Styling & Polish (1 ngày)
- [ ] Apply design system
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Animations và transitions
- [ ] Dark mode support (optional)
- [ ] Accessibility (ARIA labels, keyboard navigation)

## Deliverables Phase 3
- ✅ Dashboard UI hoàn chỉnh cho 3 roles
- ✅ Responsive và accessible
- ✅ Smooth animations & transitions
- ✅ Error handling & loading states

---


