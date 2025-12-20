# CI/CD — Continuous Integration & Deployment Plan

## Inventory Management System

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Document Introduction

This document specifies the steps for Continuous Integration (CI) and Continuous Deployment (CD) to ensure:

- Code quality
- Version stability
- Early bug detection
- Smooth deployment execution
- Clear workflow creation
- Prevention of customer-facing failures

**Note:** All technical documentation must be in **English**. All user-facing messages in the application must be in **French**.

---

## 2. Environment Structure

### 2.1 Three Environments

#### ✔ **Local Environment (Developer)**

- Where code is written
- Local testing
- Development server (`npm run dev`)

#### ✔ **Development Preview (Vercel Preview)**

- Every branch except "main"
- Automatic preview URL
- Used for client or store owner testing
- Helps discover UI bugs early

#### ✔ **Production (Vercel Production)**

- Final version
- "main" branch only
- Connected to MongoDB Atlas production database

---

## 3. Environment Variables

### 3.1 Required Variables

```
MONGODB_URI          → MongoDB Atlas connection string
JWT_SECRET           → Secret for JWT token signing (min 32 characters)
SESSION_KEY          → Session encryption key (min 32 characters)
NODE_ENV             → Environment (development, preview, production)
```

### 3.2 Storage Locations

**Local:**

- File: `.env.local` (not committed to git)
- Add to `.gitignore`

**Vercel:**

- Dashboard → Project → Settings → Environment Variables
- Set for each environment (Development, Preview, Production)

**Each environment uses a different database:**

- Local: Development database
- Preview: Preview database (or development)
- Production: Production database

---

## 4. Continuous Integration (CI)

### 4.1 GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

      - name: Run tests
        run: npm test
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
          SESSION_KEY: ${{ secrets.SESSION_KEY_TEST }}

      - name: Build project
        run: npm run build
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
          SESSION_KEY: ${{ secrets.SESSION_KEY_TEST }}
```

### 4.2 CI Checks

**1. Linting (ESLint)**

```yaml
- name: Run ESLint
  run: npm run lint
```

- Checks code style
- Finds syntax errors
- Enforces coding standards

**2. Formatting (Prettier)**

```yaml
- name: Check Prettier formatting
  run: npm run format:check
```

- Ensures consistent code formatting
- Prevents formatting conflicts

**3. Testing**

```yaml
- name: Run tests
  run: npm test
```

- Runs unit tests
- Runs integration tests
- Ensures code quality

**4. Build Test**

```yaml
- name: Build project
  run: npm run build
```

- Verifies project builds successfully
- Catches build-time errors
- Ensures Next.js compilation works

### 4.3 Prevent Broken Build

**GitHub Actions:**

- If any CI check fails, PR cannot be merged
- Requires all checks to pass before merge

**Vercel:**

- Automatically runs build on every push
- Prevents deployment if build fails

---

## 5. Continuous Deployment (CD)

### 5.1 Vercel Automatic Deployment

**On merge to main:**

1. Vercel detects changes
2. Runs build process
3. If build succeeds → deploys to production
4. API routes become live
5. Connects to MongoDB Atlas production database
6. New version is live

**On push to any branch:**

1. Vercel creates preview deployment
2. Generates preview URL
3. Can be shared for testing

### 5.2 Deployment Process

```
Developer pushes code
    │
    ▼
GitHub receives push
    │
    ▼
Vercel detects changes
    │
    ▼
Vercel runs build
    │
    ├─► Build succeeds
    │   └─► Deploy to production/preview
    │
    └─► Build fails
        └─► Send notification
            └─► Developer fixes issues
```

---

## 6. Complete CI/CD Workflow

### 6.1 Step-by-Step Process

#### 🟦 **STEP 1 — Developer Creates Branch**

```bash
git checkout -b feature/product-form
```

#### 🟦 **STEP 2 — Developer Commits Code**

Following Coding Standards:

- Meaningful commit messages
- Small, focused commits
- Code follows standards

```bash
git add .
git commit -m "feat: add product creation form"
```

#### 🟦 **STEP 3 — Push Branch to GitHub**

```bash
git push origin feature/product-form
```

**Vercel automatically creates preview deployment.**

#### 🟦 **STEP 4 — Automatic CI Checks**

GitHub Actions runs:

- ✅ Lint
- ✅ Format check
- ✅ Tests
- ✅ Build test

**If any check fails:**

- Developer receives notification
- Must fix issues before merging

#### 🟦 **STEP 5 — Create Pull Request**

Developer creates PR to `main` branch:

- Review changes
- CI checks must pass
- Code review (if required)

#### 🟦 **STEP 6 — Merge to Main**

**If CI passes:**

- Merge allowed
- Code merged to `main` branch

**If CI fails:**

- Merge blocked
- Must fix issues first

#### 🟦 **STEP 7 — Automatic Deployment**

**Vercel automatically:**

1. Detects merge to `main`
2. Runs production build
3. Deploys to production
4. New version is live

#### 🟦 **STEP 8 — Manual Sanity Test**

**Quick 5-minute test:**

- ✅ Product list loads
- ✅ Sale operation works
- ✅ Inventory-in works
- ✅ Dashboard loads
- ✅ Authentication works

---

## 7. Package.json Scripts

### 7.1 Required Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .js,.jsx",
    "lint:fix": "eslint . --ext .js,.jsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 7.2 Script Descriptions

- `dev`: Run development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Check code with ESLint
- `lint:fix`: Fix ESLint errors automatically
- `format`: Format code with Prettier
- `format:check`: Check if code is formatted
- `test`: Run tests
- `test:watch`: Run tests in watch mode
- `test:coverage`: Run tests with coverage report

---

## 8. GitHub Actions Setup

### 8.1 Create Workflow File

**Path:** `.github/workflows/ci.yml`

**Content:** (See section 4.1)

### 8.2 GitHub Secrets

**Required secrets (for testing):**

- `MONGODB_URI_TEST`: Test database connection string
- `JWT_SECRET_TEST`: Test JWT secret
- `SESSION_KEY_TEST`: Test session key

**Setup:**

1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new secrets

---

## 9. Vercel Configuration

### 9.1 Vercel.json (Optional)

**File:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 9.2 Vercel Environment Variables

**Setup in Vercel Dashboard:**

1. Go to project settings
2. Environment Variables
3. Add variables for each environment:
   - Development
   - Preview
   - Production

**Variables:**

- `MONGODB_URI`
- `JWT_SECRET`
- `SESSION_KEY`
- `NODE_ENV`

---

## 10. Rollback Plan

### 10.1 Vercel Rollback

**If deployment fails or causes issues:**

1. Go to Vercel Dashboard
2. Project → Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"
5. Instant rollback

**No downtime during rollback.**

### 10.2 Database Rollback

**If database changes cause issues:**

1. MongoDB Atlas → Backups
2. Restore from previous backup
3. Or manually revert data changes

---

## 11. Monitoring

### 11.1 Vercel Logs

**Monitor:**

- API route logs
- Build logs
- Error logs
- Performance metrics

**Access:**

- Vercel Dashboard → Project → Logs

### 11.2 MongoDB Atlas Metrics

**Monitor:**

- Database connection count
- Query performance
- Storage usage
- Error rates

**Access:**

- MongoDB Atlas Dashboard → Metrics

### 11.3 API Performance

**Monitor:**

- Response times
- Error rates
- Request volume
- Slow queries

**Tools:**

- Vercel Analytics (if enabled)
- Custom logging

---

## 12. Zero-Downtime Deployment

### 12.1 How It Works

**Thanks to Next.js + Vercel:**

- ✅ No service interruption during deployment
- ✅ Build happens on Vercel servers
- ✅ New version is built before switching
- ✅ Instant switch to new version
- ✅ Old version remains available during build

### 12.2 Deployment Flow

```
Old Version (Live)
    │
    ▼
New Code Pushed
    │
    ▼
Vercel Builds New Version (in background)
    │
    ├─► Old version still serving requests
    │
    ▼
New Version Ready
    │
    ▼
Switch to New Version (instant)
    │
    ▼
Old Version Retired
```

---

## 13. Security in CI/CD

### 13.1 Secrets Management

**❌ Never:**

- Commit secrets to git
- Store secrets in code
- Share secrets in chat/email

**✅ Always:**

- Store secrets in GitHub Secrets
- Store secrets in Vercel Environment Variables
- Use different secrets for each environment
- Rotate secrets regularly

### 13.2 Branch Protection

**Protect main branch:**

1. Go to GitHub repository
2. Settings → Branches
3. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### 13.3 API Route Testing

**Test all API routes before merge:**

- Unit tests for services
- Integration tests for API routes
- Authorization tests
- Error handling tests

---

## 14. Testing in CI/CD

### 14.1 Test Structure

```
__tests__/
  unit/
    services/
      ProductService.test.js
      SaleService.test.js
    models/
      Product.test.js
  integration/
    api/
      products.test.js
      sales.test.js
      auth.test.js
```

### 14.2 Test Coverage Requirements

**Minimum coverage:**

- Services: 80%+
- API Routes: 70%+
- Critical paths: 100%

**Run coverage:**

```bash
npm run test:coverage
```

### 14.3 Test Database

**Use separate test database:**

- MongoDB Atlas test cluster
- Or local MongoDB for tests
- Clean database before each test run

---

## 15. Acceptance Criteria

The system is considered "ready for deployment" when:

✅ All API endpoints work  
✅ No build errors  
✅ All tests pass  
✅ Test for sale + inventory operations successful  
✅ Dashboard works  
✅ Cashier Panel works  
✅ Rollback can be managed when needed  
✅ Environment variables configured  
✅ Database connected  
✅ Authentication works  
✅ Authorization works correctly

---

## 16. Deployment Checklist

### Before First Deployment:

- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas production database created
- [ ] Database connection tested
- [ ] GitHub Actions workflow configured
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Code reviewed
- [ ] Documentation updated

### Before Each Deployment:

- [ ] All tests pass
- [ ] Build succeeds
- [ ] Code reviewed (if required)
- [ ] Environment variables updated (if needed)
- [ ] Database migrations applied (if any)

### After Deployment:

- [ ] Verify production URL works
- [ ] Test authentication
- [ ] Test critical operations (sale, inventory)
- [ ] Check error logs
- [ ] Monitor performance

---

## 17. Troubleshooting

### 17.1 Build Fails

**Check:**

- Environment variables set correctly
- Dependencies installed (`npm ci`)
- No syntax errors
- Next.js configuration correct

**Fix:**

- Check build logs in Vercel
- Test build locally: `npm run build`
- Fix errors and push again

### 17.2 Tests Fail

**Check:**

- Test database connection
- Test environment variables
- Test data setup

**Fix:**

- Fix failing tests
- Ensure test database is accessible
- Check test environment variables

### 17.3 Deployment Fails

**Check:**

- Build logs
- Environment variables
- Database connection

**Fix:**

- Fix build errors
- Verify environment variables
- Test database connection

---

## 18. Document Summary

**Platforms:**

- **Vercel** = Primary platform (Frontend + API)
- **GitHub** = Code management
- **MongoDB Atlas** = Database

**CI Process:**

- Lint + Format + Tests + Build

**CD Process:**

- Automatic deployment on merge to main

**Rollback:**

- One-click rollback in Vercel

**Environments:**

- Local (development)
- Preview (branch deployments)
- Production (main branch)

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

With this document, the project now has a professional deployment pipeline, sufficient to keep it stable and easy to update.
