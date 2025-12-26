# Environment Variables Reference

**Document Type:** Technical Reference  
**Version:** 1.0  
**Status:** Official  
**Date:** 2025-01-02

---

## Overview

This document provides a complete reference for all environment variables used in the Store Management System.

**Validation:** All environment variables are validated at application startup. Missing required variables or invalid production flags will cause the application to fail fast with clear error messages.

**Fail-Fast Behavior:** The application will exit immediately (process.exit(1)) if validation fails, preventing the application from starting with invalid configuration.

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
- **Validation:**
  - Must be present and non-empty
  - Cannot be whitespace-only
- **Fail-Fast:** Application exits if missing or empty

#### `NODE_ENV`

- **Type:** String (enum)
- **Required:** Yes (all environments)
- **Description:** Node.js environment identifier
- **Allowed Values:** `development` | `production` | `test`
- **Usage:**
  - `development`: Local development environment
  - `production`: Staging and Production environments (both use `production`)
  - `test`: Testing environment
- **Example:**
  ```bash
  NODE_ENV=production
  ```
- **Validation:**
  - Must be present and non-empty
  - Must be one of: `development`, `production`, `test`
- **Fail-Fast:** Application exits if missing, empty, or invalid value

#### `APP_ENV`

- **Type:** String (enum)
- **Required:** Yes (Staging and Production only, runtime only)
- **Description:** Business-level environment identifier for environment-specific logic
- **Allowed Values:** `staging` | `production`
- **Usage:**
  - `staging`: Pre-production testing environment
  - `production`: Live production environment
- **Note:** 
  - Only required when `NODE_ENV=production` at runtime
  - Not required during build time (Next.js sets `NODE_ENV=production` during build)
  - Not required for local development (`NODE_ENV=development`)
- **Example:**
  ```bash
  APP_ENV=staging
  ```
- **Validation:**
  - Required when `NODE_ENV=production` at runtime (not build time)
  - Must be `staging` or `production`
  - Cannot be empty or whitespace-only
- **Fail-Fast:** Application exits if missing when required or invalid value

#### `JWT_SECRET`

- **Type:** String
- **Required:** Yes (all environments)
- **Description:** Secret key for JWT token signing and verification
- **Minimum Length:** 32 characters
- **Security:** Must be a strong random string. Never use default value in production.
- **Default Value:** `your-secret-key-change-in-production` (development only)
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
- **Fail-Fast:** Application exits if:
  - Missing or empty
  - Length < 32 characters
  - Using default value in production

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
- **Fail-Fast:** Application exits if `NODE_ENV=production` and `SKIP_AUTH=true`

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
- **Fail-Fast:** No (optional variable)

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
- **Fail-Fast:** No (optional variable)

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
- **Fail-Fast:** No (optional variable)

---

## Script-Only Environment Variables

These variables are only used by deployment and seeding scripts, not by the application runtime. They are not validated by the application startup validation.

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
- **Validation:** Must be valid email format (validated by script, not application)
- **Example:**
  ```bash
  FIRST_MANAGER_EMAIL=admin@example.com
  ```

#### `FIRST_MANAGER_PASSWORD`

- **Type:** String
- **Required:** Yes (for `scripts/create-first-manager.js` only)
- **Description:** Password for the first manager account
- **Minimum Length:** 6 characters (validated by script, not application)
- **Example:**
  ```bash
  FIRST_MANAGER_PASSWORD=secure-password-123
  ```

---

## Environment-Specific Examples

### Development (Local)

```bash
NODE_ENV=development
MONGODB_URI=mongodb+srv://dev-user:password@dev-cluster.mongodb.net/store-dev?retryWrites=true&w=majority
JWT_SECRET=dev-secret-key-change-in-production-minimum-32-chars
SKIP_AUTH=true
JWT_EXPIRES_IN=1d
```

**Notes:**
- `APP_ENV` not required (NODE_ENV=development)
- `SKIP_AUTH=true` allowed in development
- Default JWT_SECRET value allowed in development

### Staging

```bash
NODE_ENV=production
APP_ENV=staging
MONGODB_URI=mongodb+srv://staging-user:password@staging-cluster.mongodb.net/store-staging?retryWrites=true&w=majority
JWT_SECRET=staging-secret-key-strong-random-32-chars-minimum
SKIP_AUTH=false
JWT_EXPIRES_IN=1d
```

**Notes:**
- `APP_ENV=staging` required (NODE_ENV=production)
- `SKIP_AUTH=false` required (NODE_ENV=production)
- `JWT_SECRET` must be strong and at least 32 characters

### Production

```bash
NODE_ENV=production
APP_ENV=production
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/store-production?retryWrites=true&w=majority
JWT_SECRET=production-secret-key-strong-random-32-chars-minimum-rotate-regularly
SKIP_AUTH=false
JWT_EXPIRES_IN=1d
```

**Notes:**
- `APP_ENV=production` required (NODE_ENV=production)
- `SKIP_AUTH=false` required (NODE_ENV=production)
- `JWT_SECRET` must be strong and at least 32 characters
- `JWT_SECRET` must not be default value

---

## Validation Rules

### Startup-Time Validation

The application validates all environment variables at startup (when `lib/config/env.js` is imported). Validation happens before any other application code executes.

**Validation Order:**
1. Required variables check
2. NODE_ENV value validation
3. APP_ENV validation (if required)
4. JWT_SECRET validation
5. Production safety rules validation

### Required Variables Check

The following variables must be present and non-empty:

- `MONGODB_URI`: Must be present and non-empty
- `NODE_ENV`: Must be present and one of: `development`, `production`, `test`
- `JWT_SECRET`: Must be present and non-empty
- `APP_ENV`: Must be present when `NODE_ENV=production` at runtime (not build time)

### Value Validation

#### NODE_ENV
- Must be one of: `development`, `production`, `test`
- Case-sensitive

#### APP_ENV
- Required when `NODE_ENV=production` at runtime
- Must be one of: `staging`, `production`
- Case-sensitive
- Not validated during build time (Next.js sets NODE_ENV=production during build)

#### JWT_SECRET
- Must be at least 32 characters long
- Cannot be the default value (`your-secret-key-change-in-production`) when `NODE_ENV=production`

### Production Safety Checks

The following combinations will cause the application to fail fast:

1. **Critical Security Violation:**
   - `NODE_ENV=production` AND `SKIP_AUTH=true`
   - Error: "SKIP_AUTH cannot be enabled when NODE_ENV=production. This is a critical security violation."

2. **Insecure JWT_SECRET:**
   - `NODE_ENV=production` AND `JWT_SECRET` is default value
   - Error: "JWT_SECRET is using default value in production. This is a severe security vulnerability."

3. **Weak JWT_SECRET:**
   - `JWT_SECRET` length < 32 characters
   - Error: "JWT_SECRET must be at least 32 characters long."

---

## Fail-Fast Behavior

### How It Works

When validation fails, the application:

1. **Logs Error:** Outputs clear error message to console
2. **Exits Immediately:** Calls `process.exit(1)` to stop the application
3. **Prevents Startup:** Application will not start with invalid configuration

### Error Messages

The application provides clear, actionable error messages:

#### Missing Required Variable

```
❌ ENV Validation Error: Missing required environment variable: MONGODB_URI
```

Or for multiple missing variables:

```
❌ ENV Validation Error: Missing required environment variables: MONGODB_URI, JWT_SECRET
```

#### Invalid NODE_ENV

```
❌ ENV Validation Error: NODE_ENV must be one of: development, production, test
Current value: (not set)
```

#### Missing APP_ENV

```
❌ ENV Validation Error: APP_ENV is required when NODE_ENV=production.
Please set APP_ENV to either "staging" or "production".
```

#### Invalid APP_ENV

```
❌ ENV Validation Error: APP_ENV must be one of: staging, production
Current value: invalid-value
```

#### Weak JWT_SECRET

```
❌ ENV Validation Error: JWT_SECRET must be at least 32 characters long.
Current length: 20.
Generate a strong secret with: openssl rand -base64 32
```

#### Default JWT_SECRET in Production

```
❌ ENV Validation Error: JWT_SECRET is using default value in production.
This is a severe security vulnerability.
Set JWT_SECRET environment variable with a strong random secret (min 32 characters).
Generate with: openssl rand -base64 32
```

#### Critical Security Violation (SKIP_AUTH in Production)

```
❌ ENV Validation Error: SKIP_AUTH cannot be enabled when NODE_ENV=production.
This is a critical security violation.
SKIP_AUTH is only allowed in development environment.
Set SKIP_AUTH=false or remove it from your environment configuration.
```

### When Validation Runs

- **Server-Side Only:** Validation runs only on server-side (Node.js), not in browser
- **Early Execution:** Validation happens when `lib/config/env.js` is imported
- **Once Per Process:** Global flag prevents multiple validations
- **Build Time:** APP_ENV validation is skipped during Next.js build phase

---

## Security Considerations

### JWT_SECRET

- **Never commit to Git:** Store in environment variables only
- **Use strong secrets:** Minimum 32 characters, random
- **Different per environment:** Use different secrets for staging and production
- **Rotate regularly:** Change production secret periodically
- **Never use default:** Default value is only for development

### SKIP_AUTH

- **Development only:** Never enable in staging or production
- **Fail-fast protection:** Application will not start if enabled in production
- **Security risk:** Disabling authentication is a critical security violation

### Environment Separation

- **Different credentials:** Use different MongoDB URIs and JWT secrets per environment
- **No sharing:** Never share production credentials with staging or development
- **Secure storage:** Store credentials in Vercel environment variables (encrypted)

---

## Related Documentation

- [Deployment Strategy](./DEPLOYMENT_STRATEGY.md) - Complete deployment guide
- [Architecture Documentation](./ARCHITECTURE.md) - Architectural principles
- [Detailed Deployment Guide](./docs/08-deployment/DEPLOYMENT_STRATEGY.md) - Full deployment documentation

---

**Document Version:** 1.0  
**Status:** Official  
**Last Updated:** 2025-01-02

