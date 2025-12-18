# API SPECIFICATION - DASHBOARD MODULE

## 1. BASE CONFIGURATION

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.volunteerhub.com/api
```

### Authentication
```
Authorization: Bearer <access_token>
```

---

## 2. API ENDPOINTS

### 2.1 GET /api/dashboard/summary
**Lấy tổng quan Dashboard cho user đang đăng nhập**

| Field | Volunteer | Manager | Admin |
|-------|-----------|---------|-------|
| totalRegistrations | ✓ | - | - |
| completedEvents | ✓ | ✓ | ✓ |
| upcomingEvents | ✓ | - | - |
| totalEvents | - | ✓ | ✓ |
| pendingEvents | - | ✓ | ✓ |
| totalUsers | - | - | ✓ |

---

### 2.2 GET /api/dashboard/new-events
**Lấy danh sách sự kiện mới công bố**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Số lượng events (max: 20) |
| days | number | 7 | Số ngày gần đây |

**Response:**
```json
{
  "events": [{
    "id": "uuid",
    "title": "...",
    "category": "TREE_PLANTING",
    "_count": { "registrations": 25 },
    "isNew": true
  }]
}
```

---

### 2.3 GET /api/dashboard/active-events
**Lấy sự kiện có hoạt động mới (24h)**

**Response:**
```json
{
  "events": [{
    "id": "uuid",
    "title": "...",
    "recentActivity": {
      "newPosts": 3,
      "newComments": 15,
      "lastActivityAt": "2024-01-20T14:30:00Z"
    }
  }]
}
```

---

### 2.4 GET /api/dashboard/trending-events
**Lấy sự kiện trending**

**Trending Score Formula:**
```
score = (registrations_24h * 0.4) + (posts_24h * 0.3) + (likes_24h * 0.3)
```

**Response:**
```json
{
  "events": [{
    "id": "uuid",
    "title": "...",
    "trending": {
      "score": 85.5,
      "rank": 1,
      "registrations24h": 25,
      "trend": "up"
    }
  }],
  "calculatedAt": "2024-01-20T15:00:00Z"
}
```

---

### 2.5 GET /api/dashboard/stats
**Thống kê chi tiết (Admin only)**

**Response:**
```json
{
  "usersByRole": [
    { "role": "VOLUNTEER", "_count": 450 },
    { "role": "EVENT_MANAGER", "_count": 45 }
  ],
  "eventsByCategory": [
    { "category": "TREE_PLANTING", "_count": 25 }
  ]
}
```

---

### 2.6 GET /api/dashboard/export/events
### 2.7 GET /api/dashboard/export/users
**Export data (Admin only)**

| Parameter | Type | Options |
|-----------|------|---------|
| format | string | "json", "csv" |

---

## 3. ERROR CODES

| Code | Status | Description |
|------|--------|-------------|
| AUTH_REQUIRED | 401 | Token không hợp lệ |
| ACCESS_DENIED | 403 | Không có quyền |
| RATE_LIMIT | 429 | Quá nhiều requests |

---

## 4. RATE LIMITING

| Endpoint | Limit |
|----------|-------|
| /dashboard/* | 60 req/min |
| /dashboard/export/* | 5 req/hour |

---

## 5. TYPESCRIPT INTERFACES

```typescript
interface DashboardSummary {
  user: { id: string; fullName: string; role: string };
  stats: VolunteerStats | ManagerStats | AdminStats;
}

interface TrendingEvent {
  id: string;
  title: string;
  trending: {
    score: number;
    rank: number;
    registrations24h: number;
    trend: 'up' | 'down' | 'stable';
  };
}
```
