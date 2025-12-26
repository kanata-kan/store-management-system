# Environment Variables Reference

**Document Type:** Technical Reference  
**Date:** 2025-01-02  
**Version:** 1.0  
**Status:** Official  
**Related:** [Deployment Strategy](./DEPLOYMENT_STRATEGY.md)

---

## Overview

This document provides a complete reference for all environment variables used in the Store Management System.

**Validation:** All environment variables are validated at application startup. Missing required variables or invalid production flags will cause the application to fail fast.

---

## Required Environment Variables

### Core Configuration

#### `MONGODB_URI`
- **Type:** String (URI)
- **Required:** Yes (all environments)
- **Description:** MongoDB Atlas connection string
- **Format:** `mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database-name]?retryWrites=true&w=majority`
- **Example:**
  ```bash
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/store?retryWrites=true&w=majority
  ```
- **Validation:** Must be present and non-empty

#### `NODE_ENV`
- **Type:** String (enum)
- **Required:** Yes (all environments)
- **Description:** Node.js environment identifier
- **Allowed Values:** `development` | `production` | `test`
- **Usage:**
  - `development`: Local development
  - `production`: Staging and Production (both use `production`)
  - `test`: Testing environment
- **Example:**
  ```bash
  NODE_ENV=production
  ```
- **Validation:** Must be one of the allowed values

#### `APP_ENV`
- **Type:** String (enum)
- **Required:** Yes (Staging and Production only)
- **Description:** Business-level environment identifier for environment-specific logic
- **Allowed Values:** `staging` | `production`
- **Usage:**
  - `staging`: Pre-production testing environment
  - `production`: Live production environment
- **Note:** Only required when `NODE_ENV=production`. Not required for local development.
- **Example:**
  ```bash
  APP_ENV=staging
  ```
- **Validation:** 
  - Required when `NODE_ENV=production`
  - Must be `staging` or `production`

#### `JWT_SECRET`
- **Type:** String
- **Required:** Yes (all environments)
- **Description:** Secret key for JWT token signing and verification
- **Minimum Length:** 32 characters
- **Security:** Must be a strong random string. Never use default value in production.
- **Generation:**
  ```bash
  openssl rand -base64 32
  ```
- **Example:**
  ```bash
  JWT_SECRET=your-strong-random-secret-key-minimum-32-characters-long
  ```
- **Validation:**
  - Must be present and non-empty
  - Must be at least 32 characters long
  - Must not be the default value (`your-secret-key-change-in-production`) when `NODE_ENV=production`

---

## Optional Environment Variables

### Authentication & Security

#### `SKIP_AUTH`
- **Type:** Boolean (string: `"true"` or `"false"`)
- **Required:** No
- **Default:** `false`
- **Description:** Skip authentication for development purposes only
- **Allowed Values:** `"true"` | `"false"` (as string)
- **Usage:** Development only. **NEVER enable in production.**
- **Example:**
  ```bash
  SKIP_AUTH=true
  ```
- **Validation:**
  - If `NODE_ENV=production` AND `SKIP_AUTH=true`, application will **fail fast**
  - Only allowed when `NODE_ENV=development`

#### `JWT_EXPIRES_IN`
- **Type:** String (time duration)
- **Required:** No
- **Default:** `"1d"` (1 day)
- **Description:** JWT token expiration time
- **Format:** Time duration string (e.g., `"1d"`, `"7d"`, `"24h"`, `"3600s"`)
- **Example:**
  ```bash
  JWT_EXPIRES_IN=1d
  ```
- **Validation:** None (uses default if not provided)

### Application URLs

#### `NEXT_PUBLIC_API_URL`
- **Type:** String (URL)
- **Required:** No
- **Description:** Public API base URL for client-side requests
- **Usage:** Used when API URL cannot be auto-detected from request headers
- **Example:**
  ```bash
  NEXT_PUBLIC_API_URL=https://api.example.com
  ```
- **Note:** Auto-detected from request headers if not provided
- **Validation:** None (optional)

#### `NEXT_PUBLIC_APP_URL`
- **Type:** String (URL)
- **Required:** No
- **Description:** Public application URL
- **Usage:** Used for generating absolute URLs (e.g., in emails, PDFs)
- **Example:**
  ```bash
  NEXT_PUBLIC_APP_URL=https://app.example.com
  ```
- **Note:** Auto-detected by Vercel in production
- **Validation:** None (optional)

---

## Script-Only Environment Variables

These variables are only used by deployment and seeding scripts, not by the application runtime.

### First Manager Creation

#### `FIRST_MANAGER_NAME`
- **Type:** String
- **Required:** Yes (for `scripts/create-first-manager.js` only)
- **Description:** Name of the first manager account
- **Example:**
  ```bash
  FIRST_MANAGER_NAME=Admin User
  ```

#### `FIRST_MANAGER_EMAIL`
- **Type:** String (email)
- **Required:** Yes (for `scripts/create-first-manager.js` only)
- **Description:** Email address of the first manager account
- **Validation:** Must be valid email format
- **Example:**
  ```bash
  FIRST_MANAGER_EMAIL=admin@example.com
  ```

#### `FIRST_MANAGER_PASSWORD`
- **Type:** String
- **Required:** Yes (for `scripts/create-first-manager.js` only)
- **Description:** Password for the first manager account
- **Minimum Length:** 6 characters
- **Example:**
  ```bash
  FIRST_MANAGER_PASSWORD=secure-password-123
  ```

---

## Environment-Specific Configurations

### Development (Local)

```bash
NODE_ENV=development
MONGODB_URI=mongodb+srv://dev-user:password@dev-cluster.mongodb.net/store-dev?retryWrites=true&w=majority
JWT_SECRET=dev-secret-key-change-in-production-minimum-32-chars
SKIP_AUTH=true
JWT_EXPIRES_IN=1d
```

### Staging

```bash
NODE_ENV=production
APP_ENV=staging
MONGODB_URI=mongodb+srv://staging-user:password@staging-cluster.mongodb.net/store-staging?retryWrites=true&w=majority
JWT_SECRET=staging-secret-key-strong-random-32-chars-minimum
SKIP_AUTH=false
JWT_EXPIRES_IN=1d
```

### Production

```bash
NODE_ENV=production
APP_ENV=production
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/store-production?retryWrites=true&w=majority
JWT_SECRET=production-secret-key-strong-random-32-chars-minimum-rotate-regularly
SKIP_AUTH=false
JWT_EXPIRES_IN=1d
```

---

## Validation Rules

### Startup-Time Validation

The application validates all environment variables at startup. If validation fails, the application will **fail fast** with a clear error message.

#### Required Variables Check
- `MONGODB_URI`: Must be present and non-empty
- `NODE_ENV`: Must be present and one of: `development`, `production`, `test`
- `JWT_SECRET`: Must be present and non-empty
- `APP_ENV`: Must be present when `NODE_ENV=production`

#### Production Safety Checks
- If `NODE_ENV=production` AND `SKIP_AUTH=true`: **FAIL FAST**
- If `NODE_ENV=production` AND `JWT_SECRET` is default value: **FAIL FAST**
- If `JWT_SECRET` length < 32: **FAIL FAST**

#### Value Validation
- `NODE_ENV`: Must be `development`, `production`, or `test`
- `APP_ENV`: Must be `staging` or `production` (when required)
- `JWT_SECRET`: Must be at least 32 characters

---

## Error Messages

When validation fails, the application will output clear error messages:

- **Missing Required Variable:**
  ```
  ❌ ENV Validation Error: Missing required environment variable: MONGODB_URI
  ```

- **Invalid Production Flag:**
  ```
  ❌ ENV Validation Error: SKIP_AUTH cannot be enabled when NODE_ENV=production. This is a critical security violation.
  ```

- **Invalid JWT_SECRET:**
  ```
  ❌ ENV Validation Error: JWT_SECRET must be at least 32 characters long. Current length: 20.
  ```

- **Default JWT_SECRET in Production:**
  ```
  ❌ ENV Validation Error: JWT_SECRET is using default value in production. This is a severe security vulnerability.
  ```

---

## Related Documentation

- [Deployment Strategy](./DEPLOYMENT_STRATEGY.md) - Complete deployment guide
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Architectural principles

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-02

