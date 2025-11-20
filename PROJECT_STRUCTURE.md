# 📂 PROJECT STRUCTURE

## 🌳 Cấu trúc thư mục chi tiết

```
btlweb/
│
├── 📄 README.md                    # Hướng dẫn chính của dự án
├── 📄 PLAN.md                      # Kế hoạch 3 tuần chi tiết
├── 📄 QUICK_START.md               # Hướng dẫn setup nhanh
├── 📄 CONTRIBUTING.md              # Quy tắc đóng góp code
├── 📄 PROJECT_STRUCTURE.md         # File này - Cấu trúc dự án
├── 📄 Requirement.txt              # Yêu cầu bài tập
├── 🖼️ VolunteerHub (1) (1).png    # Sequence diagram
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 backend/                     # Backend Node.js/Express
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma       # Database schema (Models, Relations)
│   │   ├── 📄 seed.ts             # Seed data script
│   │   └── 📁 migrations/         # Database migrations (auto-generated)
│   │
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── 📄 database.ts     # Prisma client singleton
│   │   │
│   │   ├── 📁 controllers/        # Business logic handlers
│   │   │   ├── 📄 auth.controller.ts
│   │   │   ├── 📄 user.controller.ts
│   │   │   ├── 📄 event.controller.ts
│   │   │   ├── 📄 registration.controller.ts
│   │   │   ├── 📄 post.controller.ts
│   │   │   ├── 📄 comment.controller.ts
│   │   │   ├── 📄 notification.controller.ts
│   │   │   └── 📄 dashboard.controller.ts
│   │   │
│   │   ├── 📁 middleware/         # Express middleware
│   │   │   ├── 📄 auth.middleware.ts        # JWT auth & authorization
│   │   │   ├── 📄 error.middleware.ts       # Error handling
│   │   │   └── 📄 validation.middleware.ts  # Request validation
│   │   │
│   │   ├── 📁 routes/             # API route definitions
│   │   │   ├── 📄 auth.routes.ts
│   │   │   ├── 📄 user.routes.ts
│   │   │   ├── 📄 event.routes.ts
│   │   │   ├── 📄 registration.routes.ts
│   │   │   ├── 📄 post.routes.ts
│   │   │   ├── 📄 comment.routes.ts
│   │   │   ├── 📄 notification.routes.ts
│   │   │   └── 📄 dashboard.routes.ts
│   │   │
│   │   ├── 📁 utils/              # Utility functions
│   │   │   ├── 📄 password.util.ts  # Password hashing/comparing
│   │   │   └── 📄 jwt.util.ts       # JWT generation/verification
│   │   │
│   │   ├── 📁 validators/         # Joi validation schemas
│   │   │   ├── 📄 auth.validator.ts
│   │   │   ├── 📄 event.validator.ts
│   │   │   ├── 📄 post.validator.ts
│   │   │   └── 📄 comment.validator.ts
│   │   │
│   │   └── 📄 server.ts           # Main entry point - Express app setup
│   │
│   ├── 📄 package.json            # Backend dependencies
│   ├── 📄 tsconfig.json           # TypeScript configuration
│   ├── 📄 nodemon.json            # Nodemon configuration
│   ├── 📄 .env                    # Environment variables (not in git)
│   ├── 📄 .env.example            # Environment template
│   └── 📄 .gitignore              # Backend git ignore
│
└── 📁 frontend/                   # Frontend React/Vite
    ├── 📁 src/
    │   ├── 📁 components/         # Reusable UI components
    │   │   ├── 📁 layout/
    │   │   │   ├── 📄 Navbar.tsx
    │   │   │   └── 📄 Footer.tsx
    │   │   └── 📁 common/         # (TODO: Add more components)
    │   │       ├── Button.tsx
    │   │       ├── Card.tsx
    │   │       ├── Modal.tsx
    │   │       └── Loading.tsx
    │   │
    │   ├── 📁 layouts/            # Page layouts
    │   │   ├── 📄 MainLayout.tsx    # Main app layout
    │   │   └── 📄 AuthLayout.tsx    # Auth pages layout
    │   │
    │   ├── 📁 pages/              # Page components (Route components)
    │   │   ├── 📄 HomePage.tsx
    │   │   ├── 📄 NotFoundPage.tsx
    │   │   │
    │   │   ├── 📁 auth/
    │   │   │   ├── 📄 LoginPage.tsx
    │   │   │   └── 📄 RegisterPage.tsx
    │   │   │
    │   │   ├── 📁 events/
    │   │   │   ├── 📄 EventsPage.tsx        # List events
    │   │   │   └── 📄 EventDetailPage.tsx   # Event detail
    │   │   │
    │   │   ├── 📁 dashboard/
    │   │   │   └── 📄 DashboardPage.tsx     # User dashboard
    │   │   │
    │   │   ├── 📁 profile/
    │   │   │   └── 📄 ProfilePage.tsx       # User profile
    │   │   │
    │   │   ├── 📁 volunteer/
    │   │   │   └── 📄 MyEventsPage.tsx      # Volunteer's events
    │   │   │
    │   │   ├── 📁 manager/
    │   │   │   └── 📄 ManageEventsPage.tsx  # Manager's events
    │   │   │
    │   │   └── 📁 admin/
    │   │       └── 📄 AdminDashboardPage.tsx # Admin panel
    │   │
    │   ├── 📁 services/           # API service functions
    │   │   ├── 📄 authService.ts
    │   │   └── 📄 eventService.ts
    │   │   # TODO: Add more services
    │   │
    │   ├── 📁 store/              # Zustand state management
    │   │   └── 📄 authStore.ts    # Authentication state
    │   │   # TODO: Add more stores if needed
    │   │
    │   ├── 📁 lib/                # Libraries and utilities
    │   │   └── 📄 api.ts          # Axios instance with interceptors
    │   │
    │   ├── 📁 hooks/              # Custom React hooks (TODO)
    │   │   └── 📄 useAuth.ts
    │   │
    │   ├── 📁 types/              # TypeScript type definitions (TODO)
    │   │   └── 📄 index.ts
    │   │
    │   ├── 📄 App.tsx             # Main app component with routes
    │   ├── 📄 main.tsx            # React entry point
    │   ├── 📄 index.css           # Global styles + Tailwind
    │   └── 📄 vite-env.d.ts       # Vite environment types
    │
    ├── 📄 index.html              # HTML template
    ├── 📄 package.json            # Frontend dependencies
    ├── 📄 tsconfig.json           # TypeScript config
    ├── 📄 tsconfig.node.json      # TypeScript config for Vite
    ├── 📄 vite.config.ts          # Vite configuration
    ├── 📄 tailwind.config.js      # TailwindCSS configuration
    ├── 📄 postcss.config.js       # PostCSS configuration
    ├── 📄 .env                    # Environment variables (not in git)
    ├── 📄 .env.example            # Environment template
    └── 📄 .gitignore              # Frontend git ignore
```

## 📝 File Descriptions

### Backend Core Files

#### `server.ts`
- Entry point của backend
- Setup Express app
- Configure middleware (CORS, body-parser)
- Setup routes
- Setup Socket.io
- Error handling
- Start server

#### Controllers
- **auth.controller.ts**: Register, Login, Logout
- **user.controller.ts**: Get/Update profile, List users (admin)
- **event.controller.ts**: CRUD events, Approve/Reject (admin)
- **registration.controller.ts**: Register/Cancel, Approve/Reject, Mark completed
- **post.controller.ts**: CRUD posts, Like/Unlike
- **comment.controller.ts**: CRUD comments
- **notification.controller.ts**: Get notifications, Web Push subscription
- **dashboard.controller.ts**: Statistics, Export data

#### Middleware
- **auth.middleware.ts**: 
  - `authenticate`: Verify JWT token
  - `authorize`: Check user role
- **error.middleware.ts**: Centralized error handling
- **validation.middleware.ts**: Request body validation using Joi

#### Validators
- Joi schemas để validate input data
- Prevent invalid data from entering database
- Consistent error messages

### Frontend Core Files

#### `App.tsx`
- Main routing logic
- Protected routes
- Role-based routing
- Layout structure

#### `main.tsx`
- React entry point
- ReactDOM.render
- BrowserRouter setup

#### Stores (Zustand)
- **authStore.ts**: 
  - User state
  - Token management
  - Login/Logout actions
  - Persist in localStorage

#### Services
- API service functions
- Axios calls
- Error handling
- Type safety

#### Pages Structure
```
Page Component
├── Fetch data (useEffect)
├── State management (useState)
├── Render UI
├── Handle user actions
└── Navigate to other pages
```

## 🎨 Design Patterns Used

### Backend
1. **MVC Pattern** (Model-View-Controller)
   - Models: Prisma schema
   - Controllers: Business logic
   - Routes: API endpoints

2. **Middleware Pattern**
   - Auth middleware
   - Validation middleware
   - Error handling middleware

3. **Repository Pattern** (via Prisma)
   - Database abstraction
   - Type-safe queries

### Frontend
1. **Component-Based Architecture**
   - Reusable components
   - Composition over inheritance

2. **Container/Presentational Pattern**
   - Pages (Containers): Handle logic
   - Components (Presentational): Pure UI

3. **Custom Hooks Pattern**
   - Extract reusable logic
   - Share stateful logic

## 🔄 Data Flow

### Authentication Flow
```
User → Login Form → authService.login()
  ↓
Backend validates credentials
  ↓
Generate JWT token
  ↓
Return token + user data
  ↓
Store in authStore (Zustand + localStorage)
  ↓
Redirect to Dashboard
```

### Protected Route Flow
```
User navigates to protected page
  ↓
Check isAuthenticated in authStore
  ↓
If NO → Redirect to /login
If YES → Check role requirement
  ↓
If role matches → Render page
If role doesn't match → Redirect to /
```

### API Request Flow
```
Component calls service function
  ↓
Service uses api (axios instance)
  ↓
Interceptor adds Authorization header
  ↓
Request sent to backend
  ↓
Backend middleware validates token
  ↓
Controller processes request
  ↓
Response sent back
  ↓
Interceptor handles errors
  ↓
Component receives data/error
```

## 🗄️ Database Schema Overview

### Main Models
- **User**: Authentication & Profile
- **Event**: Event information
- **Registration**: User ↔ Event relationship
- **Post**: Discussion posts
- **Comment**: Post comments
- **Like**: Post likes
- **Notification**: User notifications
- **PushSubscription**: Web Push subscriptions

### Key Relations
```
User (1) ----< (N) Event (as manager)
User (1) ----< (N) Registration
Event (1) ----< (N) Registration
User (1) ----< (N) Post
Event (1) ----< (N) Post
Post (1) ----< (N) Comment
Post (1) ----< (N) Like
User (1) ----< (N) Notification
```

## 🎯 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `EventCard.tsx`)
- **Pages**: PascalCase (e.g., `HomePage.tsx`)
- **Services**: camelCase (e.g., `authService.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Stores**: camelCase (e.g., `authStore.ts`)

### Code
- **Components**: PascalCase (e.g., `EventCard`)
- **Functions**: camelCase (e.g., `getUserProfile`)
- **Variables**: camelCase (e.g., `eventList`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `EventData`)

## 📦 Key Dependencies

### Backend
- **express**: Web framework
- **prisma**: ORM
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **joi**: Validation
- **socket.io**: Real-time communication
- **web-push**: Push notifications

### Frontend
- **react**: UI library
- **react-router-dom**: Routing
- **zustand**: State management
- **axios**: HTTP client
- **react-hook-form**: Form handling
- **react-hot-toast**: Notifications
- **tailwindcss**: Styling
- **lucide-react**: Icons

## 🚀 Getting Started

1. Read [QUICK_START.md](./QUICK_START.md) để setup dự án
2. Read [PLAN.md](./PLAN.md) để hiểu roadmap
3. Read [CONTRIBUTING.md](./CONTRIBUTING.md) để biết quy tắc code
4. Bắt đầu code theo plan!

---

**Last updated**: 2025-01-19

