# THIẾT KẾ DATABASE - DASHBOARD MODULE

## 1. SCHEMA HIỆN TẠI

### 1.1 Tables đang có (liên quan Dashboard)

```prisma
// Event - Sự kiện
model Event {
  id              String        @id @default(uuid())
  title           String
  description     String        @db.Text
  location        String
  startDate       DateTime
  endDate         DateTime
  category        EventCategory
  status          EventStatus   @default(PENDING)
  maxParticipants Int?
  imageUrl        String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  managerId       String
}

// Registration - Đăng ký tham gia
model Registration {
  id          String             @id @default(uuid())
  status      RegistrationStatus @default(PENDING)
  isCompleted Boolean            @default(false)
  completedAt DateTime?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  userId      String
  eventId     String
}

// Post - Bài viết
model Post {
  id        String   @id @default(uuid())
  content   String   @db.Text
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  eventId   String
}

// Like - Lượt thích
model Like {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  userId    String
  postId    String
}

// Comment - Bình luận
model Comment {
  id        String   @id @default(uuid())
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  postId    String
}
```

---

## 2. TABLES MỚI CẦN TẠO

### 2.1 EventStats - Lưu trữ metrics tổng hợp

```prisma
// Model EventStats - Thống kê sự kiện
model EventStats {
  id                String   @id @default(uuid())
  eventId           String   @unique
  
  // Counts - Tổng số
  viewsCount        Int      @default(0)
  participantsCount Int      @default(0)      // Approved registrations
  postsCount        Int      @default(0)
  commentsCount     Int      @default(0)
  likesCount        Int      @default(0)
  
  // Trending metrics - 24h
  registrations24h  Int      @default(0)
  posts24h          Int      @default(0)
  comments24h       Int      @default(0)
  likes24h          Int      @default(0)
  
  // Trending score
  trendingScore     Float    @default(0)
  
  // Timestamps
  calculatedAt      DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  event             Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@map("event_stats")
  @@index([trendingScore(sort: Desc)])
  @@index([calculatedAt])
}
```

### 2.2 EventActivity - Log hoạt động sự kiện

```prisma
// Model EventActivity - Log hoạt động
model EventActivity {
  id           String          @id @default(uuid())
  eventId      String
  activityType EventActivityType
  count        Int             @default(1)
  period       String          // Format: "2024-01-15" or "2024-01-15T14"
  createdAt    DateTime        @default(now())
  
  // Relations
  event        Event           @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, activityType, period])
  @@map("event_activities")
  @@index([eventId, period])
}

enum EventActivityType {
  REGISTRATION
  POST
  COMMENT
  LIKE
  VIEW
}
```

### 2.3 DashboardCache - Cache dashboard data

```prisma
// Model DashboardCache - Cache cho Dashboard
model DashboardCache {
  id        String   @id @default(uuid())
  key       String   @unique   // e.g., "trending_events", "admin_stats"
  data      Json                // Cached JSON data
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("dashboard_cache")
  @@index([key])
  @@index([expiresAt])
}
```

---

## 3. INDEXES ĐỀ XUẤT

### 3.1 Indexes cho Query Performance

```sql
-- Events indexes
CREATE INDEX idx_events_status_created ON events(status, created_at DESC);
CREATE INDEX idx_events_manager_status ON events(manager_id, status);
CREATE INDEX idx_events_category_status ON events(category, status);

-- Registrations indexes
CREATE INDEX idx_registrations_event_status ON registrations(event_id, status);
CREATE INDEX idx_registrations_user_status ON registrations(user_id, status);
CREATE INDEX idx_registrations_created ON registrations(created_at DESC);

-- Posts indexes
CREATE INDEX idx_posts_event_created ON posts(event_id, created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);

-- Comments indexes
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);

-- Likes indexes  
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_created ON likes(created_at DESC);

-- Event Stats indexes
CREATE INDEX idx_event_stats_trending ON event_stats(trending_score DESC);
CREATE INDEX idx_event_stats_calculated ON event_stats(calculated_at);
```

---

## 4. VIEWS (Optional - cho reporting)

### 4.1 View: Trending Events Overview

```sql
CREATE VIEW v_trending_events AS
SELECT 
  e.id,
  e.title,
  e.category,
  e.status,
  e.created_at,
  es.participants_count,
  es.posts_count,
  es.comments_count,
  es.likes_count,
  es.trending_score,
  es.registrations_24h,
  es.calculated_at
FROM events e
LEFT JOIN event_stats es ON e.id = es.event_id
WHERE e.status = 'APPROVED'
ORDER BY es.trending_score DESC;
```

### 4.2 View: Dashboard Stats Summary

```sql
CREATE VIEW v_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE account_status = 'ACTIVE') as total_users,
  (SELECT COUNT(*) FROM events WHERE status = 'APPROVED') as active_events,
  (SELECT COUNT(*) FROM events WHERE status = 'PENDING') as pending_events,
  (SELECT COUNT(*) FROM registrations WHERE status = 'APPROVED') as total_registrations,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM comments) as total_comments;
```

---

## 5. MIGRATION SCRIPTS

### 5.1 Migration: Add EventStats table

```typescript
// prisma/migrations/add_event_stats/migration.sql

-- CreateTable
CREATE TABLE "event_stats" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "participants_count" INTEGER NOT NULL DEFAULT 0,
    "posts_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "registrations_24h" INTEGER NOT NULL DEFAULT 0,
    "posts_24h" INTEGER NOT NULL DEFAULT 0,
    "comments_24h" INTEGER NOT NULL DEFAULT 0,
    "likes_24h" INTEGER NOT NULL DEFAULT 0,
    "trending_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_stats_event_id_key" ON "event_stats"("event_id");

-- CreateIndex
CREATE INDEX "event_stats_trending_score_idx" ON "event_stats"("trending_score" DESC);

-- CreateIndex
CREATE INDEX "event_stats_calculated_at_idx" ON "event_stats"("calculated_at");

-- AddForeignKey
ALTER TABLE "event_stats" ADD CONSTRAINT "event_stats_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 5.2 Migration: Add EventActivity table

```typescript
// prisma/migrations/add_event_activity/migration.sql

-- CreateEnum
CREATE TYPE "EventActivityType" AS ENUM ('REGISTRATION', 'POST', 'COMMENT', 'LIKE', 'VIEW');

-- CreateTable
CREATE TABLE "event_activities" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "activity_type" "EventActivityType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "period" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_activities_event_id_period_idx" ON "event_activities"("event_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "event_activities_event_id_activity_type_period_key" ON "event_activities"("event_id", "activity_type", "period");

-- AddForeignKey
ALTER TABLE "event_activities" ADD CONSTRAINT "event_activities_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 5.3 Migration: Add DashboardCache table

```typescript
// prisma/migrations/add_dashboard_cache/migration.sql

-- CreateTable
CREATE TABLE "dashboard_cache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_cache_key_key" ON "dashboard_cache"("key");

-- CreateIndex
CREATE INDEX "dashboard_cache_key_idx" ON "dashboard_cache"("key");

-- CreateIndex
CREATE INDEX "dashboard_cache_expires_at_idx" ON "dashboard_cache"("expires_at");
```

---

## 6. SEED SCRIPT - Populate Historical Data

```typescript
// prisma/seed-dashboard.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEventStats() {
  console.log('🌱 Seeding EventStats...');
  
  // Get all events
  const events = await prisma.event.findMany({
    include: {
      registrations: true,
      posts: {
        include: {
          comments: true,
          likes: true
        }
      }
    }
  });
  
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  for (const event of events) {
    // Calculate total counts
    const participantsCount = event.registrations.filter(r => r.status === 'APPROVED').length;
    const postsCount = event.posts.length;
    const commentsCount = event.posts.reduce((sum, p) => sum + p.comments.length, 0);
    const likesCount = event.posts.reduce((sum, p) => sum + p.likes.length, 0);
    
    // Calculate 24h metrics
    const registrations24h = event.registrations.filter(
      r => r.createdAt >= oneDayAgo
    ).length;
    
    const posts24h = event.posts.filter(
      p => p.createdAt >= oneDayAgo
    ).length;
    
    const comments24h = event.posts.reduce(
      (sum, p) => sum + p.comments.filter(c => c.createdAt >= oneDayAgo).length, 0
    );
    
    const likes24h = event.posts.reduce(
      (sum, p) => sum + p.likes.filter(l => l.createdAt >= oneDayAgo).length, 0
    );
    
    // Calculate trending score
    const trendingScore = (registrations24h * 0.4) + (posts24h * 0.3) + (likes24h * 0.3);
    
    // Upsert EventStats
    await prisma.eventStats.upsert({
      where: { eventId: event.id },
      update: {
        participantsCount,
        postsCount,
        commentsCount,
        likesCount,
        registrations24h,
        posts24h,
        comments24h,
        likes24h,
        trendingScore,
        calculatedAt: now
      },
      create: {
        eventId: event.id,
        participantsCount,
        postsCount,
        commentsCount,
        likesCount,
        registrations24h,
        posts24h,
        comments24h,
        likes24h,
        trendingScore,
        calculatedAt: now
      }
    });
    
    console.log(`  ✓ Updated stats for event: ${event.title}`);
  }
  
  console.log('✅ EventStats seeding complete!');
}

async function main() {
  await seedEventStats();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 7. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Actions                Events Table                         │
│      │                           │                                │
│      ▼                           ▼                                │
│  ┌───────────┐             ┌───────────┐                         │
│  │ Register  │─────────────│  Events   │                         │
│  │   Post    │             │  Posts    │                         │
│  │   Like    │             │  Comments │                         │
│  │   View    │             │  Likes    │                         │
│  └───────────┘             └───────────┘                         │
│       │                          │                                │
│       │      ┌───────────────────┘                                │
│       ▼      ▼                                                    │
│  ┌─────────────────┐                                              │
│  │  Cron Job       │  ← Every 30 minutes                         │
│  │  Stats Updater  │                                              │
│  └─────────────────┘                                              │
│       │                                                           │
│       ▼                                                           │
│  ┌─────────────────┐                                              │
│  │  EventStats     │  ← Aggregated metrics                       │
│  │  Table          │                                              │
│  └─────────────────┘                                              │
│       │                                                           │
│       ▼                                                           │
│  ┌─────────────────┐                                              │
│  │  Dashboard API  │  ← Served to clients                        │
│  └─────────────────┘                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. ESTIMATED TABLE SIZES

| Table | Estimated Rows | Growth Rate |
|-------|----------------|-------------|
| events | ~500 | +50/month |
| registrations | ~5,000 | +500/month |
| posts | ~2,000 | +200/month |
| comments | ~10,000 | +1,000/month |
| likes | ~20,000 | +2,000/month |
| event_stats | ~500 | Same as events |
| event_activities | ~50,000 | +5,000/month |
| dashboard_cache | ~20 | Static |

---

## 9. BACKUP & RECOVERY

### 9.1 Backup Strategy
- Daily full backup of all tables
- Hourly incremental backup
- Keep 30 days of backups

### 9.2 Recovery
- EventStats có thể được recalculated từ source tables
- DashboardCache là ephemeral, không cần backup
- EventActivity có thể được regenerated từ logs
