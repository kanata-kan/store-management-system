# Deployment Strategy

**Document Type:** Official Deployment Guide  
**Version:** 1.1  
**Status:** Approved & Locked  
**Date:** 2025-01-02

---

## Overview

This document defines the official deployment strategy for the Store Management System. All deployments must follow this process.

**Infrastructure Stack:**
- **Hosting:** Vercel
- **Database:** MongoDB Atlas
- **Deployment Method:** Manual deployment via Vercel dashboard or CLI
- **Configuration:** Environment variables only

**Deployment Flow:**
```
Local Development → Staging Environment → Production Environment
```

---

## 1. Environments Overview

The system uses three distinct environments:

### Development (Local)
- **Purpose:** Local development and testing
- **Database:** Local MongoDB or MongoDB Atlas development cluster
- **Access:** Developer machines only
- **Configuration:** Local `.env` file

### Staging
- **Purpose:** Pre-production testing and validation
- **Database:** MongoDB Atlas staging cluster
- **Access:** Internal team and stakeholders
- **URL:** `https://[project-name]-staging.vercel.app`
- **Configuration:** Vercel environment variables

### Production
- **Purpose:** Live system for end users
- **Database:** MongoDB Atlas production cluster
- **Access:** Public (with authentication)
- **URL:** `https://[project-name].vercel.app`
- **Configuration:** Vercel environment variables

---

## 2. Staging-First Policy

**Core Principle:** All changes must be deployed to Staging first, tested, then promoted to Production.

### Policy Rules

1. **Mandatory Staging Deployment**
   - Every change must be deployed to Staging before Production
   - No direct deployments to Production
   - Staging serves as the validation gate

2. **Staging Validation Required**
   - All critical features must be tested in Staging
   - Staging validation checklist must pass before Production deployment
   - Issues found in Staging must be resolved before Production deployment

3. **Production Deployment Only After Staging Success**
   - Production deployment is allowed only after Staging validation passes
   - Same code that passed Staging validation is deployed to Production
   - No code changes between Staging and Production deployments

### Staging Validation Checklist

Before deploying to Production, verify in Staging:

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

---

## 3. Deployment Steps Summary

### Initial Setup

1. **Create Vercel Projects**
   - Create staging project: `[project-name]-staging`
   - Create production project: `[project-name]`
   - Connect both to GitHub repository

2. **Configure MongoDB Atlas**
   - Create staging cluster
   - Create production cluster
   - Create database users for each environment
   - Configure network access (restrict IPs before production)

3. **Set Environment Variables**
   - Configure staging environment variables in Vercel
   - Configure production environment variables in Vercel
   - Verify all required variables are set

### Standard Deployment Process

#### Step 1: Staging Deployment

1. **Prepare Code**
   - Commit changes to Git
   - Push to GitHub (main branch or staging branch)
   - Ensure build succeeds locally: `npm run build`

2. **Deploy to Staging**
   - Vercel automatically deploys on push
   - Or manually trigger deployment via Vercel dashboard
   - Monitor deployment logs

3. **Verify Staging**
   - Access staging URL
   - Run staging validation checklist
   - Test all critical features
   - Fix any issues found

#### Step 2: Production Deployment

1. **Confirm Staging Success**
   - Staging validation checklist passed
   - All critical features working
   - No blocking issues

2. **Deploy to Production**
   - Deploy same code to production project
   - Or promote staging deployment to production (if using Vercel environments)
   - Monitor deployment logs

3. **Verify Production**
   - Access production URL
   - Run same validation checklist as staging
   - Monitor for errors
   - Verify database connection

### Database Setup

#### Initial Database Setup

**Staging:**
- Run seed script or create first manager user
- Initialize database with test data

**Production:**
- **WARNING:** Production seeding is limited to one-time initial setup only
- Create first manager user only
- **CRITICAL:** Never re-run seed scripts in production after initial setup

#### Database Migrations

If migrations are needed:

1. Run migrations on Staging first
2. Verify migration success in Staging
3. Test affected features in Staging
4. Run migrations on Production only after Staging validation

---

## 4. Safety Rules

### Environment Variable Safety

**Required Variables:**
- `MONGODB_URI`: MongoDB Atlas connection string (environment-specific)
- `NODE_ENV`: Set to `production` for both Staging and Production
- `APP_ENV`: Set to `staging` or `production` (required when `NODE_ENV=production`)
- `JWT_SECRET`: Strong random string (32+ characters, different per environment)

**Critical Safety Rules:**

1. **Authentication Safety Rule**
   - If `NODE_ENV=production` AND `SKIP_AUTH=true`, the application MUST fail fast
   - This combination is a critical security violation
   - Applies to both Staging and Production environments

2. **Environment Separation**
   - Use different `MONGODB_URI` for each environment
   - Use different `JWT_SECRET` for each environment
   - Never share credentials between environments

3. **Production Seeding Safety**
   - Production seeding is for one-time initial setup only
   - Never re-run seed scripts in production after initial setup
   - Only create first manager user in production

### MongoDB Network Access Safety

**Initial Setup (Temporary):**
- Allowing access from anywhere (`0.0.0.0/0`) is allowed temporarily for initial setup or staging only

**Before Production:**
- **REQUIRED:** Must restrict network access to specific IP ranges before production validation
- Configure IP whitelist per environment
- Restrict to Vercel IP ranges if possible

### Security Configuration

- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's environment variable encryption
- ✅ Use different `JWT_SECRET` for each environment
- ✅ Rotate `JWT_SECRET` regularly in production
- ✅ Use strong passwords for MongoDB Atlas users
- ✅ Enable MongoDB Atlas encryption at rest
- ✅ Enable MongoDB Atlas audit logging (production)
- ✅ `SKIP_AUTH` must be `false` in staging and production
- ✅ `NODE_ENV` must be `production` in staging and production

---

## 5. Rollback Policy

### Rollback Procedure

If production deployment fails or causes issues:

1. **Identify the Issue**
   - Check Vercel deployment logs
   - Check application logs
   - Check database connection
   - Identify root cause

2. **Revert to Previous Version**
   - In Vercel dashboard, go to Deployments
   - Find last successful deployment
   - Click "Promote to Production"
   - Verify rollback success

3. **Fix the Issue**
   - Fix the problem in code
   - Test fix in staging
   - Deploy to staging and validate
   - Redeploy to production after staging validation

### Rollback Limitations

- **Manual Process:** Rollback is manual via Vercel dashboard
- **No Automated Rollback:** No automated rollback mechanisms
- **Database Considerations:** Database migrations may require separate rollback procedures

### Prevention

To minimize need for rollback:

- Always deploy to Staging first
- Complete Staging validation before Production
- Test all critical features in Staging
- Monitor deployment logs during deployment
- Verify production immediately after deployment

---

## 6. Document Lock Notice

### Document Status

**Version:** 1.1  
**Status:** Approved & Locked  
**Last Updated:** 2025-01-02

### Lock Policy

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

### What This Means

- This deployment strategy is the official process
- All deployments must follow this process
- Deviations require explicit approval
- The strategy cannot be changed without review

---

## Summary

This deployment strategy ensures:

- **Safety:** Staging-first policy prevents production issues
- **Reliability:** Validation checklists ensure quality
- **Security:** Safety rules prevent security violations
- **Recovery:** Rollback policy provides recovery path
- **Stability:** Document lock ensures process consistency

**All deployments must follow this strategy.**

---

**Related Documentation:**
- [Environment Variables Reference](./docs/08-deployment/ENV_REFERENCE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Detailed Deployment Guide](./docs/08-deployment/DEPLOYMENT_STRATEGY.md)

