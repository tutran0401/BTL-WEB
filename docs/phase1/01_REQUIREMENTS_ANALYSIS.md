# PHÂN TÍCH YÊU CẦU CHI TIẾT - DASHBOARD MODULE

## 1. TỔNG QUAN

### 1.1 Mục tiêu
Xây dựng tính năng Dashboard tổng quan cho VolunteerHub với 3 loại người dùng khác nhau:
- **Volunteer (Tình nguyện viên)**: Xem sự kiện mới, sự kiện đã đăng ký, thống kê cá nhân
- **Event Manager (Quản lý sự kiện)**: Xem sự kiện đang quản lý, thống kê người tham gia
- **Admin**: Xem tổng quan hệ thống, quản lý người dùng và sự kiện

### 1.2 Scope
- Dashboard hiển thị dữ liệu real-time
- Hỗ trợ responsive design (mobile, tablet, desktop)
- Tối ưu performance với caching và lazy loading

---

## 2. METRICS CẦN TÍNH TOÁN

### 2.1 Sự kiện mới công bố (New Events)
- **Định nghĩa**: Events có status = 'APPROVED' và được tạo trong vòng 7 ngày gần nhất
- **Tiêu chí lọc**:
  ```
  status = 'APPROVED'
  createdAt >= NOW() - 7 days
  ```
- **Sắp xếp**: Theo `createdAt DESC`
- **Giới hạn hiển thị**: 10 events gần nhất

### 2.2 Sự kiện có hoạt động mới (Active Events)
- **Định nghĩa**: Events có bài viết (Posts) hoặc bình luận (Comments) mới trong 24 giờ
- **Tiêu chí lọc**:
  ```
  status = 'APPROVED'
  posts.createdAt >= NOW() - 24h OR comments.createdAt >= NOW() - 24h
  ```
- **Metrics hiển thị**:
  - Số posts mới trong 24h
  - Số comments mới trong 24h
- **Sắp xếp**: Theo thời gian hoạt động gần nhất

### 2.3 Sự kiện thu hút (Trending Events)
- **Định nghĩa**: Events có nhiều hoạt động và tương tác trong 7 ngày gần đây
- **Công thức tính Trending Score**:
  ```
  trending_score = (new_registrations * 40%) + (new_posts * 30%) + (new_likes * 30%)

  Trong đó:
  - new_registrations: Số đăng ký mới trong 24h
  - new_posts: Số posts mới trong 24h
  - new_likes: Số likes mới trong 24h
  ```

- **Weight breakdown**:
  | Metric | Weight | Lý do |
  |--------|--------|-------|
  | New Registrations | 40% | Đánh giá mức độ quan tâm thực sự |
  | New Posts | 30% | Đánh giá mức độ tương tác của community |
  | New Likes | 30% | Đánh giá mức độ engagement |

- **Công thức normalized**:
  ```javascript
  trending_score = 
    (registrations_24h / max_registrations) * 0.4 +
    (posts_24h / max_posts) * 0.3 +
    (likes_24h / max_likes) * 0.3
  ```

- **Cache**: Kết quả được cache 15 phút

### 2.4 Khoảng thời gian "Gần đây"
| Context | Duration | Lý do |
|---------|----------|-------|
| New Events | 7 ngày | Cho phép users thấy events mới công bố trong tuần |
| Active Events | 24 giờ | Focus vào hoạt động thực sự đang diễn ra |
| Trending Calculation | 24 giờ | Đánh giá độ "hot" trong thời gian ngắn |
| Trending Display | 7 ngày | Hiển thị events trending trong tuần |

---

## 3. YÊU CẦU THEO ROLE

### 3.1 Volunteer Dashboard

#### Stats Cards
| Metric | Mô tả |
|--------|-------|
| Tổng số đăng ký | Số events đã đăng ký |
| Đã hoàn thành | Số events completed |
| Sắp tới | Số events sắp diễn ra (đã approved) |

#### Sections
1. **Sự kiện mới** - Events mới công bố
2. **Sự kiện của tôi** - Events đã đăng ký
3. **Sự kiện trending** - Events đang hot

#### Quick Actions
- Khám phá sự kiện
- Xem sự kiện đã đăng ký
- Hồ sơ cá nhân

### 3.2 Event Manager Dashboard

#### Stats Cards
| Metric | Mô tả |
|--------|-------|
| Tổng sự kiện | Số events đang quản lý |
| Đã duyệt | Số events được approved |
| Chờ duyệt | Số events pending |
| Người tham gia | Tổng registrations approved |

#### Sections
1. **Sự kiện của tôi** - Events đang quản lý
2. **Pending registrations** - Đăng ký chờ duyệt
3. **Hoạt động gần đây** - Posts/comments mới

#### Quick Actions
- Tạo sự kiện mới
- Quản lý đăng ký
- Xem báo cáo

### 3.3 Admin Dashboard

#### Stats Cards
| Metric | Mô tả |
|--------|-------|
| Tổng users | Số người dùng |
| Tổng events | Số sự kiện |
| Tổng registrations | Số đăng ký |
| Pending events | Events chờ duyệt |

#### Sections
1. **Users by Role** - Chart phân bổ users
2. **Events by Category** - Chart phân bổ events
3. **Recent Users** - Users mới đăng ký
4. **Recent Events** - Events mới tạo

#### Quick Actions
- Quản lý users
- Duyệt sự kiện
- Xem báo cáo hệ thống
- Export data

---

## 4. BUSINESS RULES

### 4.1 Access Control
| Role | Xem | Tạo/Sửa | Xóa |
|------|-----|---------|-----|
| Volunteer | Public events + Joined events | - | - |
| Manager | All events + Own events (full) | Own events | Own events |
| Admin | All data | All | All |

### 4.2 Data Privacy
- Volunteer không xem được danh sách người tham gia sự kiện khác
- Chỉ Admin và Manager (owner) xem được thông tin chi tiết registrations
- Email/phone users bị ẩn với Volunteer

### 4.3 Rate Limiting
- Dashboard refresh: Max 1 request/30 seconds
- Export: Max 5 requests/hour
- Trending recalculation: Auto every 15 minutes

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance
- Dashboard load time: < 2 seconds
- API response time: < 500ms
- Charts render: < 1 second

### 5.2 Availability
- Uptime target: 99.5%
- Graceful degradation khi có lỗi

### 5.3 Scalability
- Hỗ trợ tối đa 10,000 concurrent users
- Data pagination cho large datasets

### 5.4 Caching Strategy
| Data | Cache Duration | Invalidation |
|------|----------------|--------------|
| Stats counts | 5 minutes | On data change |
| Trending events | 15 minutes | Scheduled recalc |
| User-specific data | No cache | Real-time |

---

## 6. ACCEPTANCE CRITERIA

### 6.1 Volunteer Dashboard
- [ ] Hiển thị correct stats cho logged-in user
- [ ] Events list sorted đúng thứ tự
- [ ] Quick actions navigate đúng pages
- [ ] Responsive trên mobile

### 6.2 Manager Dashboard
- [ ] Chỉ hiển thị events của manager
- [ ] Registrations count chính xác
- [ ] Pending items highlight rõ ràng

### 6.3 Admin Dashboard
- [ ] Hiển thị all system stats
- [ ] Charts render đúng data
- [ ] Export function hoạt động
- [ ] Recent activities real-time

---

## 7. DEPENDENCIES

### 7.1 Backend
- Prisma ORM với PostgreSQL
- Express.js APIs
- JWT Authentication

### 7.2 Frontend
- React 18+ với TypeScript
- TailwindCSS
- React Router
- Chart.js hoặc Recharts

### 7.3 Infrastructure
- Redis (optional - for caching)
- Cron job scheduler (node-cron)

---

## 8. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow trending calculation | Medium | Medium | Add caching, background jobs |
| Large data pagination issues | High | Low | Implement cursor-based pagination |
| Concurrent update conflicts | Low | Low | Use optimistic locking |

---

## 9. TIMELINE ESTIMATE

| Task | Duration |
|------|----------|
| Requirements finalization | ✅ Complete |
| Database design | 1 day |
| API design | 1 day |
| Backend implementation | 5-7 days |
| Frontend implementation | 5-7 days |
| Testing | 2-3 days |
| **Total** | **14-18 days** |
