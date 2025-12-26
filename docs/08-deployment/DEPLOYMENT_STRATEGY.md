# Deployment Strategy Document

**Document Type:** Technical Deployment Guide  
**Date:** 2025-01-02  
**Version:** 1.1  
**Status:** Official & Locked  
**Based On:** Staging-first deployment, Vercel + MongoDB Atlas, Environment-based configuration

---

## 1. Deployment Architecture Overview

### Infrastructure Stack

**Hosting Platform:** Vercel  
**Database:** MongoDB Atlas  
**Configuration:** Environment variables only  
**Deployment Method:** Manual deployment via Vercel dashboard or CLI

### Deployment Flow

```
Local Development → Staging Environment → Production Environment
```

**Principle:** All changes must be deployed to Staging first, tested, then promoted to Production.

---

## 2. Environment Structure

### Environment Types

The system uses three distinct environments:

1. **Development** (Local)
   - Purpose: Local development and testing
   - Database: Local MongoDB or MongoDB Atlas development cluster
   - Access: Developer machines only

2. **Staging**
   - Purpose: Pre-production testing and validation
   - Database: MongoDB Atlas staging cluster
   - Access: Internal team and stakeholders
   - URL: `https://[project-name]-staging.vercel.app`

3. **Production**
   - Purpose: Live system for end users
   - Database: MongoDB Atlas production cluster
   - Access: Public (with authentication)
   - URL: `https://[project-name].vercel.app`

---

## 3. Vercel Configuration

### Project Setup

1. **Create Vercel Account**
   - Sign up at https://vercel.com
   - Use GitHub account for integration

2. **Import Project**
   - Connect GitHub repository
   - Vercel auto-detects Next.js project
   - Framework preset: Next.js

3. **Project Settings**
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)
   - **Node.js Version:** 18.x or higher

### Staging Project Setup

1. **Create Staging Project**
   - In Vercel dashboard, create new project
   - Name: `[project-name]-staging`
   - Connect to same GitHub repository
   - Use different branch (optional) or same branch with different environment variables

2. **Production Project Setup**
   - Create separate project: `[project-name]`
   - Or use Vercel's environment promotion feature
   - Connect to same GitHub repository

---

## 4. MongoDB Atlas Configuration

### Database Clusters

**Required Clusters:**
- Staging cluster (MongoDB Atlas)
- Production cluster (MongoDB Atlas)

### Cluster Setup Steps

1. **Create Staging Cluster**
   - Log in to MongoDB Atlas
   - Create new cluster (name: `store-management-staging`)
   - Choose region closest to Vercel deployment region
   - Select cluster tier (M0 free tier for staging is acceptable)

2. **Create Production Cluster**
   - Create new cluster (name: `store-management-production`)
   - Choose region closest to Vercel deployment region
   - Select appropriate cluster tier (M10 or higher recommended for production)

3. **Network Access**
   - Add Vercel IP ranges to MongoDB Atlas Network Access
   - **IMPORTANT:** Allowing access from anywhere (0.0.0.0/0) is allowed TEMPORARILY for initial setup or staging only
   - **REQUIRED:** Must be restricted to specific IP ranges before production validation
   - Configure IP whitelist per environment

4. **Database Users**
   - Create separate database user for staging
   - Create separate database user for production
   - Use strong passwords
   - Grant appropriate permissions (readWrite)

5. **Connection Strings**
   - Generate connection string for staging cluster
   - Generate connection string for production cluster
   - Format: `mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database-name]?retryWrites=true&w=majority`

---

## 5. Environment Variables Configuration

### Required Environment Variables

The following environment variables must be configured in each Vercel environment:

#### Core Configuration

| Variable | Description | Example | Required In |
|----------|-------------|---------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` | All environments |
| `NODE_ENV` | Node.js environment identifier | `production` (staging & production) or `development` (local) | All environments |
| `APP_ENV` | Business-level environment identifier | `staging` or `production` | Staging and Production only |
| `JWT_SECRET` | Secret key for JWT token signing | Strong random string (32+ chars) | All environments |

**Note:** `NODE_ENV` is set to `production` for both Staging and Production environments. `APP_ENV` is used for business-level environment logic (e.g., feature flags, environment-specific behavior).

#### Optional Configuration

| Variable | Description | Default | Required In |
|----------|-------------|---------|-------------|
| `SKIP_AUTH` | Skip authentication (development only) | `false` | Development only |
| `NEXT_PUBLIC_APP_URL` | Public application URL | Auto-detected by Vercel | Production (optional) |

### Environment-Specific Values

#### Development (Local `.env` file)

```bash
NODE_ENV=development
MONGODB_URI=mongodb+srv://dev-user:password@dev-cluster.mongodb.net/store-dev?retryWrites=true&w=majority
JWT_SECRET=dev-secret-key-change-in-production
SKIP_AUTH=true
```

#### Staging (Vercel Environment Variables)

```bash
NODE_ENV=production
APP_ENV=staging
MONGODB_URI=mongodb+srv://staging-user:password@staging-cluster.mongodb.net/store-staging?retryWrites=true&w=majority
JWT_SECRET=staging-secret-key-strong-random-32-chars-minimum
SKIP_AUTH=false
```

#### Production (Vercel Environment Variables)

```bash
NODE_ENV=production
APP_ENV=production
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/store-production?retryWrites=true&w=majority
JWT_SECRET=production-secret-key-strong-random-32-chars-minimum-rotate-regularly
SKIP_AUTH=false
```

### Setting Environment Variables in Vercel

1. **Via Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add each variable
   - Select environment(s): Development, Preview, Production
   - Click "Save"

2. **Via Vercel CLI**
   ```bash
   vercel env add MONGODB_URI production
   vercel env add JWT_SECRET production
   vercel env add NODE_ENV production
   vercel env add APP_ENV production
   ```

---

## 6. Deployment Process

### Initial Deployment (Staging)

1. **Prepare Staging Environment**
   - Ensure staging MongoDB Atlas cluster is created and accessible
   - Create staging database user
   - Generate staging connection string

2. **Configure Vercel Staging Project**
   - Create new Vercel project: `[project-name]-staging`
   - Connect to GitHub repository
   - Set environment variables for staging

3. **Deploy to Staging**
   - Push code to GitHub (main branch or staging branch)
   - Vercel automatically deploys on push
   - Or manually trigger deployment via Vercel dashboard

4. **Verify Staging Deployment**
   - Access staging URL: `https://[project-name]-staging.vercel.app`
   - Test authentication flow
   - Test database connection
   - Test critical user flows

### Staging Validation Checklist

- [ ] Application loads without errors
- [ ] Database connection successful
- [ ] Authentication works (login/logout)
- [ ] Manager role access works
- [ ] Cashier role access works
- [ ] Product creation works
- [ ] Sale registration works
- [ ] Finance dashboard loads
- [ ] PDF export works
- [ ] Excel export works
- [ ] No console errors
- [ ] All environment variables are set correctly

### Production Deployment

1. **Prepare Production Environment**
   - Ensure production MongoDB Atlas cluster is created
   - Create production database user
   - Generate production connection string
   - Ensure production cluster has appropriate resources

2. **Configure Vercel Production Project**
   - Create new Vercel project: `[project-name]`
   - Or use Vercel's production environment
   - Set environment variables for production

3. **Deploy to Production**
   - After staging validation passes
   - Deploy same code to production project
   - Or promote staging deployment to production (if using Vercel environments)

4. **Verify Production Deployment**
   - Access production URL
   - Run same validation checklist as staging
   - Monitor for errors

---

## 7. Database Setup

### Initial Database Setup

After deployment, the database must be initialized:

1. **Seed Initial Data (Staging)**
   - Run seed script locally pointing to staging database:
     ```bash
     MONGODB_URI=[staging-uri] npm run seed
     ```
   - Or create first manager user:
     ```bash
     MONGODB_URI=[staging-uri] node scripts/create-first-manager.js
     ```

2. **Seed Initial Data (Production)**
   - **WARNING:** Production seeding is limited to one-time initial setup only (e.g., first manager creation)
   - **CRITICAL:** Never re-run seed scripts in production after initial setup
   - For initial setup, create first manager user:
     ```bash
     MONGODB_URI=[production-uri] node scripts/create-first-manager.js
     ```
   - **DO NOT** run `npm run seed` in production after initial setup

### Database Migrations

If database migrations are needed:

1. **Run Migrations on Staging First**
   ```bash
   MONGODB_URI=[staging-uri] npm run migrate-sales
   ```

2. **Verify Migration Success**
   - Check staging database
   - Test affected features

3. **Run Migrations on Production**
   ```bash
   MONGODB_URI=[production-uri] npm run migrate-sales
   ```

---

## 8. Build Configuration

### Next.js Build Settings

Vercel automatically detects Next.js and uses default build settings:

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Build Verification

After deployment, verify:

- [ ] Build completes without errors
- [ ] No TypeScript errors (if applicable)
- [ ] No ESLint errors blocking build
- [ ] All dependencies installed correctly
- [ ] Build output size is reasonable

---

## 9. Security Configuration

### Environment Variable Security

- ✅ **Never commit `.env` files to Git**
- ✅ **Use Vercel's environment variable encryption**
- ✅ **Use different JWT_SECRET for each environment**
- ✅ **Rotate JWT_SECRET regularly in production**
- ✅ **Use strong passwords for MongoDB Atlas users**

### MongoDB Atlas Security

- ✅ **Enable MongoDB Atlas authentication**
- ✅ **Use strong database user passwords**
- ✅ **Configure IP whitelist (restrict to Vercel IPs if possible)**
- ✅ **Enable MongoDB Atlas encryption at rest**
- ✅ **Enable MongoDB Atlas audit logging (production)**

### Application Security

- ✅ **SKIP_AUTH must be `false` in staging and production**
- ✅ **NODE_ENV must be `production` in staging and production**
- ✅ **Use HTTPS only (Vercel provides this automatically)**

### Authentication Safety Rule

**CRITICAL SECURITY RULE:**
- If `NODE_ENV=production` AND `SKIP_AUTH=true`, the application MUST fail fast
- This combination is a critical security violation
- The application code enforces this rule and will throw an error if this condition is detected
- This rule applies to both Staging and Production environments

---

## 10. Deployment Workflow

### Standard Deployment Process

1. **Development**
   - Make changes locally
   - Test locally
   - Commit to Git

2. **Staging Deployment**
   - Push to GitHub (main branch or staging branch)
   - Vercel automatically deploys to staging
   - Verify staging deployment
   - Test all critical features

3. **Production Deployment**
   - After staging validation passes
   - Deploy to production (same code)
   - Verify production deployment
   - Monitor for issues

### Rollback Procedure

If production deployment fails:

1. **Identify the Issue**
   - Check Vercel deployment logs
   - Check application logs
   - Check database connection

2. **Revert to Previous Version**
   - In Vercel dashboard, go to Deployments
   - Find last successful deployment
   - Click "Promote to Production"

3. **Fix the Issue**
   - Fix the problem in code
   - Test in staging
   - Redeploy to production

---

## 11. Monitoring and Verification

### Post-Deployment Checks

After each deployment, verify:

#### Application Health
- [ ] Application URL is accessible
- [ ] No 500 errors in browser console
- [ ] No errors in Vercel deployment logs

#### Database Connection
- [ ] Database connection successful (check application logs)
- [ ] Can query database (test login)
- [ ] No connection errors

#### Critical Features
- [ ] User authentication works
- [ ] Manager can access dashboard
- [ ] Cashier can access cashier panel
- [ ] Product creation works
- [ ] Sale registration works
- [ ] Finance dashboard loads

### Vercel Monitoring

- **Deployment Logs:** Available in Vercel dashboard
- **Function Logs:** Available in Vercel dashboard
- **Analytics:** Available in Vercel dashboard (if enabled)

### MongoDB Atlas Monitoring

- **Cluster Status:** Check MongoDB Atlas dashboard
- **Connection Metrics:** Available in MongoDB Atlas dashboard
- **Performance Metrics:** Available in MongoDB Atlas dashboard

---

## 12. Troubleshooting

### Common Issues

#### Build Fails

**Symptoms:** Deployment fails during build step

**Possible Causes:**
- Missing environment variables
- Build errors in code
- Dependency installation issues

**Solutions:**
- Check Vercel build logs
- Verify all environment variables are set
- Test build locally: `npm run build`
- Check for ESLint errors: `npm run lint`

#### Database Connection Fails

**Symptoms:** Application starts but cannot connect to database

**Possible Causes:**
- Incorrect MONGODB_URI
- MongoDB Atlas network access restrictions
- Database user credentials incorrect

**Solutions:**
- Verify MONGODB_URI in Vercel environment variables
- Check MongoDB Atlas Network Access settings
- Verify database user credentials
- Test connection string locally

#### Authentication Not Working

**Symptoms:** Cannot login or authentication errors

**Possible Causes:**
- JWT_SECRET not set or incorrect
- SKIP_AUTH enabled in production (should fail fast)
- Cookie settings incorrect

**Solutions:**
- Verify JWT_SECRET is set in Vercel
- Ensure SKIP_AUTH is `false` in production
- Check Vercel deployment logs for errors

---

## 13. Environment Promotion

### Staging to Production

**Method 1: Separate Projects**
- Staging and Production are separate Vercel projects
- Deploy same code to both projects
- Use different environment variables

**Method 2: Vercel Environments**
- Use single Vercel project with multiple environments
- Promote staging deployment to production
- Environment variables are environment-specific

### Recommended Approach

**Use Separate Projects:**
- Clear separation between staging and production
- Independent deployment cycles
- Easier to manage different configurations

---

## 14. Maintenance Tasks

### Regular Maintenance

1. **Environment Variable Review**
   - Review environment variables quarterly
   - Rotate JWT_SECRET annually (or as needed)
   - Verify MongoDB Atlas credentials are current

2. **Database Maintenance**
   - Monitor MongoDB Atlas cluster performance
   - Review database size and growth
   - Optimize indexes as needed

3. **Deployment Verification**
   - After each deployment, run verification checklist
   - Monitor application logs for errors
   - Check MongoDB Atlas metrics

---

## 15. Documentation Requirements

### Required Documentation

- [ ] Environment variables list (this document)
- [ ] MongoDB Atlas connection strings (stored securely)
- [ ] Vercel project URLs (staging and production)
- [ ] Deployment verification checklist (this document)

### Access Control

- **Vercel Access:** Only authorized team members
- **MongoDB Atlas Access:** Only authorized team members
- **Environment Variables:** Stored in Vercel (encrypted)

---

## 16. Limitations and Constraints

### Current Limitations

- **No CI/CD Pipeline:** Deployments are manual
- **No Automated Testing:** Manual testing required
- **No Docker:** Vercel handles containerization
- **No VPS:** Cloud-managed infrastructure only
- **No Custom Build Scripts:** Standard Next.js build only

### Accepted Constraints

These limitations are accepted as part of the deployment strategy:
- Manual deployment process
- Manual testing and validation
- No automated rollback (manual rollback via Vercel dashboard)
- No custom infrastructure configuration

---

## 17. Deployment Checklist

### Pre-Deployment Checklist

- [ ] Code is committed to Git
- [ ] All tests pass locally (if applicable)
- [ ] Build succeeds locally: `npm run build`
- [ ] Environment variables are prepared
- [ ] MongoDB Atlas clusters are ready
- [ ] Database users are created

### Staging Deployment Checklist

- [ ] Staging Vercel project is created
- [ ] Staging environment variables are set
- [ ] Staging MongoDB Atlas cluster is accessible
- [ ] Code is pushed to GitHub
- [ ] Staging deployment succeeds
- [ ] Staging validation checklist passes

### Production Deployment Checklist

- [ ] Staging validation passed
- [ ] Production Vercel project is created
- [ ] Production environment variables are set
- [ ] Production MongoDB Atlas cluster is accessible
- [ ] Code is deployed to production
- [ ] Production deployment succeeds
- [ ] Production validation checklist passes

---

## 18. Support and Resources

### Vercel Resources

- **Documentation:** https://vercel.com/docs
- **Support:** https://vercel.com/support
- **Status Page:** https://vercel-status.com

### MongoDB Atlas Resources

- **Documentation:** https://docs.atlas.mongodb.com
- **Support:** Available in MongoDB Atlas dashboard
- **Status Page:** https://status.mongodb.com

### Project Resources

- **Architecture Documentation:** `ARCHITECTURE.md`
- **Development Guide:** `docs/03-development/`
- **API Documentation:** `docs/04-api/`

---

## 19. Document Lock & Change Policy

### Document Status

**Version:** 1.1  
**Last Updated:** 2025-01-02  
**Status:** Official & Locked

### Change Policy

**This document is LOCKED.**

- **No ad-hoc modifications are allowed**
- **Any future change requires explicit architectural review**
- **Changes must be approved before implementation**
- **Version history must be maintained**

### Modification Process

If changes are required:

1. **Request Architectural Review**
   - Submit change request with justification
   - Review must be conducted by system architect
   - Changes must align with existing architecture principles

2. **Document Version Update**
   - Increment version number
   - Document change reason
   - Update "Last Updated" date
   - Maintain change log

3. **Implementation**
   - Changes implemented only after approval
   - All stakeholders notified of changes

---

**This document is the official deployment strategy. All deployments must follow this process.**

