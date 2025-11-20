# 🤝 Contributing Guidelines

## Git Workflow

### Branch Naming Convention

```
feature/feature-name    # New feature
bugfix/bug-name        # Bug fix
hotfix/critical-bug    # Critical bug fix
refactor/what-changed  # Code refactoring
```

### Commit Message Convention

```
feat: Add user authentication
fix: Fix event registration bug
docs: Update README
style: Format code with prettier
refactor: Refactor event service
test: Add tests for auth service
chore: Update dependencies
```

### Pull Request Process

1. Create a new branch from `main`
```bash
git checkout -b feature/your-feature
```

2. Make your changes and commit
```bash
git add .
git commit -m "feat: your feature description"
```

3. Push to GitHub
```bash
git push origin feature/your-feature
```

4. Create Pull Request on GitHub
5. Request review from team members
6. Merge after approval

## Code Style

### TypeScript
- Use TypeScript strict mode
- Define types for all functions
- Use interfaces for objects
- Avoid `any` type

### React
- Use functional components
- Use hooks (useState, useEffect, etc.)
- Extract reusable components
- Keep components small and focused

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: camelCase or kebab-case (e.g., `authService.ts`, `auth-service.ts`)
- **Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`)

## File Structure

### Backend
```
backend/src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic (optional)
├── utils/           # Utility functions
├── validators/      # Joi schemas
└── types/           # TypeScript types
```

### Frontend
```
frontend/src/
├── components/      # Reusable components
├── layouts/         # Layout components
├── pages/           # Page components
├── services/        # API services
├── store/           # State management
├── lib/             # Libraries & utilities
├── hooks/           # Custom hooks
├── types/           # TypeScript types
└── assets/          # Static assets
```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Comments added for complex logic
- [ ] No hardcoded values
- [ ] Environment variables used correctly
- [ ] TypeScript types defined
- [ ] No unused imports/variables
- [ ] Responsive design (for UI)
- [ ] Tested manually

## Questions?

Ask in team chat or create an issue on GitHub.

