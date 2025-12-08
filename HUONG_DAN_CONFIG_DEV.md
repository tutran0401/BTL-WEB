# 🛠️ HƯỚNG DẪN CẤU HÌNH DỰ ÁN CHO DEVELOPMENT

> Hướng dẫn chi tiết cấu hình môi trường development cho dự án VolunteerHub

---

## 📑 MỤC LỤC
1. [Cấu hình IDE/Editor](#-cấu-hình-ideeditor)
2. [Cấu hình TypeScript](#-cấu-hình-typescript)
3. [Cấu hình ESLint & Prettier](#-cấu-hình-eslint--prettier)
4. [Cấu hình Database Tools](#-cấu-hình-database-tools)
5. [Debug Configuration](#-debug-configuration)
6. [API Testing Tools](#-api-testing-tools)
7. [Git Workflow](#-git-workflow)
8. [Coding Conventions](#-coding-conventions)
9. [Useful Commands](#-useful-commands)
10. [Troubleshooting](#-troubleshooting)

---

## 🎨 Cấu hình IDE/Editor

### Visual Studio Code (Recommended)

#### Extensions cần thiết:

**Backend Development:**
```
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Prisma (Prisma.prisma)
- REST Client (humao.rest-client)
- TypeScript Hero (rbbit.typescript-hero)
- Error Lens (usernamehw.errorlens)
```

**Frontend Development:**
```
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Auto Rename Tag (formulahendry.auto-rename-tag)
- Console Ninja (wallabyjs.console-ninja)
- PostCSS Language Support (csstools.postcss)
```

**General:**
```
- GitLens (eamodio.gitlens)
- Path Intellisense (christian-kohler.path-intellisense)
- Better Comments (aaron-bond.better-comments)
- Material Icon Theme (pkief.material-icon-theme)
- Thunder Client (rangav.vscode-thunder-client) - Alternative to Postman
```

#### VSCode Settings (`.vscode/settings.json`)

Tạo thư mục `.vscode` trong root project và thêm file `settings.json`:

```json
{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,

  // Files
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },

  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true,

  // Prisma
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },

  // JSON
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // JavaScript/TypeScript
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // Tailwind CSS
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],

  // Terminal
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.fontSize": 14
}
```

#### Launch Configuration (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Debug",
      "configurations": ["Debug Backend", "Debug Frontend"],
      "presentation": {
        "hidden": false,
        "group": "",
        "order": 1
      }
    }
  ]
}
```

#### Tasks Configuration (`.vscode/tasks.json`)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "severity": 4,
          "message": 5
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "Starting.*",
          "endsPattern": "Server.*running"
        }
      }
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "isBackground": true
    },
    {
      "label": "Start Full Stack",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "problemMatcher": []
    }
  ]
}
```

---

## 📘 Cấu hình TypeScript

### Backend (`backend/tsconfig.json`)

File này đã được cấu hình tốt. Các điểm quan trọng:

```json
{
  "compilerOptions": {
    "target": "ES2020",           // Target ES2020 cho Node.js modern
    "module": "commonjs",         // CommonJS cho Node.js
    "lib": ["ES2020"],
    "outDir": "./dist",           // Output compiled JS
    "rootDir": "./src",           // Source root
    "strict": true,               // Strict mode ON
    "esModuleInterop": true,      // Cho phép import default từ CommonJS
    "skipLibCheck": true,         // Skip type checking của node_modules
    "sourceMap": true             // Generate source maps cho debugging
  }
}
```

### Frontend (`frontend/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases (optional) */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@services/*": ["src/services/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Lưu ý**: Nếu thêm path aliases, cần cập nhật `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

---

## 🎯 Cấu hình ESLint & Prettier

### Backend ESLint (`.eslintrc.json`)

Tạo file `.eslintrc.json` trong thư mục `backend/`:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "env": {
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }],
    "no-console": "off"
  }
}
```

### Frontend đã có ESLint configured

Check file `frontend/.eslintrc.cjs` hoặc trong `package.json`

### Prettier Configuration (`.prettierrc`)

Tạo file `.prettierrc` trong root project:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Prettier Ignore (`.prettierignore`)

```
node_modules
dist
build
coverage
.next
*.min.js
*.min.css
package-lock.json
```

### Scripts để chạy Linting

Thêm vào `backend/package.json`:

```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.{ts,js,json}\""
  }
}
```

---

## 🗄️ Cấu hình Database Tools

### PostgreSQL Management Tools

**1. Prisma Studio (Built-in)**
```bash
cd backend
npm run prisma:studio
```
- Chạy tại: `http://localhost:5555`
- GUI đơn giản để xem và edit data

**2. pgAdmin (Desktop App)**
- Download: https://www.pgadmin.org/
- Powerful GUI cho PostgreSQL
- Connection:
  ```
  Host: localhost
  Port: 5432
  Database: volunteerhub
  Username: [your_postgres_username]
  Password: [your_postgres_password]
  ```

**3. DBeaver (Universal DB Tool)**
- Download: https://dbeaver.io/
- Support multiple databases
- Connection string: `postgresql://localhost:5432/volunteerhub`

**4. VSCode Extension: PostgreSQL (ckolkman.vscode-postgres)**
- Connect directly trong VSCode
- Run SQL queries trực tiếp

### Prisma Commands Cheat Sheet

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npx prisma migrate dev --name description_of_changes

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ Xóa hết data)
npx prisma migrate reset

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema to database (without migration)
npx prisma db push
```

---

## 🐛 Debug Configuration

### Backend Debugging

**Method 1: VSCode Debug (Recommended)**

1. Set breakpoints trong code
2. Press `F5` hoặc chọn "Debug Backend"
3. Attach debugger tự động

**Method 2: Node Inspector**

```bash
cd backend
node --inspect-brk -r ts-node/register src/server.ts
```

Mở Chrome: `chrome://inspect`

**Method 3: Console Debugging**

```typescript
// Thêm vào code
console.log('Debug:', variable);
console.table(array);
console.dir(object, { depth: null });
```

### Frontend Debugging

**Method 1: React DevTools**

Install extension: React Developer Tools
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org

**Method 2: Redux/Zustand DevTools**

```bash
# Install Redux DevTools Extension
# https://github.com/reduxjs/redux-devtools
```

Zustand already supports Redux DevTools:
```typescript
// src/store/authStore.ts
import { devtools } from 'zustand/middleware';

const useAuthStore = create(
  devtools((set) => ({
    // ... state
  }))
);
```

**Method 3: Console Debugging**

```typescript
// Trong component
console.log('Props:', props);
console.log('State:', state);

// Debug API calls
console.log('API Request:', config);
console.log('API Response:', response.data);
```

**Method 4: VSCode Debug for React**

1. Install Debugger for Chrome extension
2. Press `F5`, chọn "Debug Frontend"
3. Set breakpoints trong TSX files

---

## 🧪 API Testing Tools

### Thunder Client (VSCode Extension)

**Setup:**
1. Install Thunder Client extension
2. Create Collection: "VolunteerHub API"
3. Set Environment Variables:

```json
{
  "name": "Development",
  "values": [
    {"name": "baseUrl", "value": "http://localhost:3000/api"},
    {"name": "token", "value": ""}
  ]
}
```

**Test Auth:**
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@volunteerhub.com",
  "password": "123456"
}
```

Copy token từ response và set vào environment variable `token`.

**Test Protected Endpoints:**
```
GET {{baseUrl}}/users/profile
Authorization: Bearer {{token}}
```

### Postman Alternative: REST Client Extension

Tạo file `api-tests.http` trong root:

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = your-jwt-token-here

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@volunteerhub.com",
  "password": "123456"
}

### Get Profile
GET {{baseUrl}}/users/profile
Authorization: Bearer {{token}}

### Create Event
POST {{baseUrl}}/events
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Test Event",
  "description": "Description",
  "location": "Location",
  "maxVolunteers": 10,
  "startDate": "2024-12-31T10:00:00Z",
  "endDate": "2024-12-31T18:00:00Z"
}

### Get All Events
GET {{baseUrl}}/events

### Get Event by ID
GET {{baseUrl}}/events/1

### Register for Event
POST {{baseUrl}}/registrations/1/register
Authorization: Bearer {{token}}
```

Click "Send Request" phía trên mỗi endpoint để test.

---

## 🔄 Git Workflow

### Branch Naming Convention

```
main              - Production code
develop           - Development branch
feature/*         - New features
bugfix/*          - Bug fixes
hotfix/*          - Urgent fixes for production
refactor/*        - Code refactoring
docs/*            - Documentation updates
```

**Examples:**
```bash
feature/user-profile
feature/event-registration
bugfix/login-error
hotfix/security-patch
refactor/api-structure
docs/setup-guide
```

### Commit Message Convention

**Format:**
```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(events): resolve date filtering bug"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(api): simplify error handling"
```

### Git Commands Cheat Sheet

```bash
# Tạo branch mới
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/my-feature

# Update branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/my-feature
git merge develop

# Squash commits trước khi merge
git rebase -i HEAD~3  # Squash last 3 commits

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# View logs
git log --oneline --graph --decorate --all
```

### .gitignore

Đảm bảo file `.gitignore` có:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite

# Logs
logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Uploads (nếu cần)
uploads/
*.jpg
*.png
!default-avatar.png

# Testing
coverage/

# Misc
.cache/
temp/
```

---

## 📝 Coding Conventions

### Naming Conventions

**Files:**
```
components/UserProfile.tsx    - PascalCase cho React components
services/authService.ts       - camelCase cho services
utils/formatDate.ts          - camelCase cho utilities
types/user.types.ts          - camelCase.types.ts
constants/API_ROUTES.ts      - UPPER_CASE cho constants
```

**Variables:**
```typescript
// Constants
const MAX_USERS = 100;
const API_BASE_URL = 'http://localhost:3000';

// Variables & Functions
let userName = 'John';
function getUserById(id: number) {}

// Classes & Interfaces
class UserService {}
interface UserData {}
type UserRole = 'admin' | 'manager' | 'volunteer';

// Components
const UserProfile: React.FC = () => {};

// Enums
enum UserRole {
  Admin = 'ADMIN',
  Manager = 'MANAGER',
  Volunteer = 'VOLUNTEER'
}
```

### Code Structure Best Practices

**Backend Controller:**
```typescript
// ✅ Good
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// ❌ Bad - No error handling
export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};
```

**Frontend Component:**
```typescript
// ✅ Good - Separated concerns
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/services/userService';
import { Button } from '@/components/common/Button';

interface UserProfileProps {
  userId: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(userId);
      setUser(data);
    } catch (err) {
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!user) return <NotFound />;

  return (
    <div>
      <h1>{user.name}</h1>
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
};

// ❌ Bad - Everything in one block, no error handling
export const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  return <div>{user?.name}</div>;
};
```

### TypeScript Best Practices

```typescript
// ✅ Use interfaces for objects
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ Use types for unions/primitives
type UserRole = 'admin' | 'manager' | 'volunteer';
type UserId = string | number;

// ✅ Avoid 'any', use 'unknown' if needed
const parseJSON = (json: string): unknown => {
  return JSON.parse(json);
};

// ✅ Use optional chaining
const userName = user?.profile?.name ?? 'Anonymous';

// ✅ Use type guards
function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

// ❌ Avoid
const data: any = {};  // Don't use 'any'
```

---

## 🚀 Useful Commands

### Backend Commands

```bash
# Development
cd backend
npm run dev                    # Start dev server with nodemon
npm run build                  # Build TypeScript to JavaScript
npm start                      # Run production build

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio GUI
npm run prisma:seed            # Seed database with test data

# Linting & Formatting
npm run lint                   # Check for errors
npm run lint:fix              # Fix errors automatically
npm run format                # Format code with Prettier

# Testing (if configured)
npm test                      # Run tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Generate coverage report
```

### Frontend Commands

```bash
# Development
cd frontend
npm run dev                   # Start Vite dev server (port 5173)
npm run build                 # Build for production
npm run preview              # Preview production build

# Linting
npm run lint                 # Run ESLint

# Type Checking
npx tsc --noEmit            # Check TypeScript errors
```

### Quick Scripts

**Start Everything:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Terminal 3 - Prisma Studio (optional)
cd backend && npm run prisma:studio
```

**Reset & Reseed Database:**
```bash
cd backend
npm run prisma:migrate reset
npm run prisma:seed
```

**Check for TypeScript Errors:**
```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npx tsc --noEmit
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution (Windows):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution (Mac/Linux):**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

#### 2. Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd backend
npm run prisma:generate
```

#### 3. Database Connection Failed

**Error:**
```
Can't reach database server at `localhost:5432`
```

**Solutions:**
```bash
# Check PostgreSQL is running (Windows)
Get-Service postgresql*

# Start PostgreSQL (Windows)
Start-Service postgresql-x64-14

# Check PostgreSQL is running (Mac)
brew services list

# Start PostgreSQL (Mac)
brew services start postgresql
```

#### 4. TypeScript Module Resolution Errors

**Error:**
```
Cannot find module '@/components/Button'
```

**Solution:**
- Check `tsconfig.json` has correct path aliases
- Restart TypeScript server in VSCode: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

#### 5. CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:3000' blocked by CORS policy
```

**Solution:**
- Check backend CORS configuration in `server.ts`
- Verify `FRONTEND_URL` in backend `.env` is correct
- Clear browser cache

#### 6. Environment Variables Not Loading

**Error:**
```
process.env.JWT_SECRET is undefined
```

**Solution:**
- Verify `.env` file exists
- Check dotenv is loaded: `import 'dotenv/config'` at top of `server.ts`
- Restart server after changing `.env`
- For frontend, ensure variables start with `VITE_`

#### 7. Nodemon Not Restarting

**Solution:**
```bash
# Clear node_modules cache
cd backend
rm -rf node_modules
npm install

# Or use --legacy-watch flag
npx nodemon --legacy-watch src/server.ts
```

---

## 📚 Additional Resources

### Documentation Links

**Backend:**
- Express.js: https://expressjs.com/
- Prisma: https://www.prisma.io/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Joi Validation: https://joi.dev/api/
- Socket.io: https://socket.io/docs/

**Frontend:**
- React: https://react.dev/
- Vite: https://vitejs.dev/
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- Zustand: https://github.com/pmndrs/zustand
- Axios: https://axios-http.com/docs/

**Tools:**
- Git: https://git-scm.com/doc
- PostgreSQL: https://www.postgresql.org/docs/
- VSCode: https://code.visualstudio.com/docs

### Learning Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/
- Prisma Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

---

## 📞 Getting Help

Nếu gặp vấn đề không có trong hướng dẫn này:

1. **Check existing documentation:**
   - README.md - Overview
   - SETUP_GUIDE.md - Basic setup
   - ISSUES_AND_BUGS.md - Known issues
   - PROJECT_STRUCTURE.md - Code structure

2. **Search in codebase:**
   - Look for similar implementations
   - Check how other features are built

3. **Debug systematically:**
   - Read error messages carefully
   - Use console.log / debugger
   - Check network tab for API errors
   - Verify environment variables

4. **Ask for help:**
   - Stack Overflow
   - GitHub Issues
   - Discord/Slack community

---

## ✅ Development Checklist

Trước khi bắt đầu code, đảm bảo:

- [ ] IDE/Editor đã cài đặt extensions cần thiết
- [ ] VSCode settings đã được cấu hình
- [ ] ESLint và Prettier hoạt động
- [ ] Database tools đã setup
- [ ] Debug configuration đã test
- [ ] API testing tool sẵn sàng (Thunder Client/Postman)
- [ ] Git đã cấu hình đúng
- [ ] Đã đọc coding conventions
- [ ] Environment variables đã setup đúng
- [ ] Backend và Frontend đều chạy được
- [ ] Prisma Studio có thể mở và xem data

---

**Happy Coding! 🎉**

*Last updated: December 2025*

