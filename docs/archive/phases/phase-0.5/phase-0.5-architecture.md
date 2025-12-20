# Phase 0.5 — User & Access Management
## Architecture Documentation

**Version:** 1.0  
**Date:** 2025-01-15  
**Status:** Production Ready

---

## Overview

Phase 0.5 implements the complete User & Access Management infrastructure layer for the Store Management System. This phase addresses the critical gap in user lifecycle management, authorization, and authentication that was required before the system could be deployed to production.

### Problems Solved

1. **Production Deployment Block:** Enables production deployment by providing a secure mechanism for creating the first manager account and managing user accounts.

2. **Authorization Infrastructure:** Implements role-based access control (RBAC) with manager and cashier roles, enforcing permissions at the API layer.

3. **User Lifecycle Management:** Provides complete CRUD operations for user accounts, allowing managers to create and manage cashier accounts.

4. **Security Foundation:** Establishes secure authentication flow with JWT tokens, password hashing, and HTTP-only cookies.

---

## Scope

### In Scope

- ✅ User CRUD operations (Create, Read, Update, Delete)
- ✅ User validation schemas (Zod)
- ✅ User management API endpoints (Manager-only)
- ✅ User management Dashboard UI (list, create, edit)
- ✅ First manager setup script (production-safe)
- ✅ Authorization middleware (requireManager, requireCashier)
- ✅ Login page UI (production-ready)
- ✅ Error handling architecture

### Out of Scope

- ❌ Password reset/forgot password functionality
- ❌ User profile management (users editing their own profiles)
- ❌ Role hierarchy beyond manager/cashier
- ❌ Permission granularity (fine-grained permissions)
- ❌ Audit logging for user operations
- ❌ Two-factor authentication (2FA)
- ❌ Session management UI (view active sessions, revoke sessions)

---

## Authentication & Authorization Flow

### Authentication

**Method:** JWT tokens stored in HTTP-only cookies

**Login Flow:**
1. User submits email and password via login form
2. `POST /api/auth/login` validates credentials
3. `AuthService.login()` verifies password using bcrypt
4. JWT token created with `userId` and `role` payload
5. Token stored in HTTP-only cookie (`session_token`)
6. User redirected based on role (manager → `/dashboard`, cashier → `/cashier`)

**Session Management:**
- **Token Storage:** HTTP-only cookie (`session_token`)
- **Token Expiration:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Cookie Settings:**
  - `httpOnly: true` (prevents XSS)
  - `secure: true` in production (HTTPS only)
  - `sameSite: "strict"` (CSRF protection)
  - `maxAge: 60 * 60 * 24 * 7` (7 days)

**AuthService Methods:**
- `AuthService.login(email, password)` — Login and create session
- `AuthService.getUserFromSession(token)` — Verify token and return user data
- `AuthService.logout()` — Placeholder (stateless JWT, handled client-side)

### Authorization

**Roles:**
- `"manager"` — Full system access, can manage users
- `"cashier"` — Limited access, cannot manage users

**Authorization Middleware:**
- `requireUser(request)` — Verifies authentication, returns user data or throws 401
- `requireManager(request)` — Verifies manager role, throws 403 if not manager
- `requireCashier(request)` — Verifies cashier or manager role, throws 403 if neither

**Enforcement:**
- All user management endpoints use `requireManager()`
- Role is stored in JWT token payload
- Role is verified on every authenticated request

---

## User Lifecycle Management

### User Model

**Schema Fields:**
- `name` — String (2-100 characters, required)
- `email` — String (unique, lowercase, required)
- `passwordHash` — String (hashed with bcrypt, required, never returned)
- `role` — Enum ["manager", "cashier"] (required)
- `createdAt` — Date (auto-generated)
- `updatedAt` — Date (auto-generated)

**Password Handling:**
- Passwords hashed with bcrypt (10 salt rounds)
- Hashing occurs in Mongoose `pre('save')` hook
- Password never returned in API responses

**Constraints:**
- Email must be unique (MongoDB unique index)
- Role must be "manager" or "cashier" (enum validation)
- Name must be 2-100 characters (schema validation)

### UserService

**Methods:**

1. **`createUser(data)`**
   - Creates new user (manager or cashier)
   - Validates email uniqueness
   - Returns user object (without passwordHash)

2. **`updateUser(id, data)`**
   - Updates existing user (partial updates supported)
   - Validates email uniqueness if email is changed
   - Password optional (only updated if provided)
   - Returns updated user object (without passwordHash)

3. **`deleteUser(id, currentUserId)`**
   - Deletes user
   - Prevents self-deletion
   - Prevents deletion if user has related sales
   - Returns success message

4. **`getUsers(options)`**
   - Gets users with pagination, sorting, search, and role filter
   - Returns paginated results with metadata

5. **`getUserById(id)`**
   - Gets single user by ID
   - Returns user object (without passwordHash)

### Validation Layer

**Zod Schemas:**
- `CreateUserSchema` — Validates user creation (all fields required)
- `UpdateUserSchema` — Validates user updates (all fields optional, password optional)

**Validation Functions:**
- `validateCreateUser(input)` — Validates and returns validated data
- `validateUpdateUser(input)` — Validates and returns validated data (preprocesses empty password)

### API Endpoints

**GET /api/users**
- Lists users with pagination, sorting, search, and role filter
- Authorization: Manager only
- Returns: Paginated user list

**POST /api/users**
- Creates new user
- Authorization: Manager only
- Input: `{ name, email, password, role }`
- Returns: Created user (201 Created)

**GET /api/users/[id]**
- Gets user by ID
- Authorization: Manager only
- Returns: User object

**PATCH /api/users/[id]**
- Updates user
- Authorization: Manager only
- Input: Partial user object (all fields optional)
- Returns: Updated user

**DELETE /api/users/[id]**
- Deletes user
- Authorization: Manager only
- Prevents self-deletion and deletion of users with sales
- Returns: Success message

### Dashboard UI

**Pages:**
- `/dashboard/users` — Users list (table, pagination, search, sorting)
- `/dashboard/users/new` — Create user form
- `/dashboard/users/[id]/edit` — Edit user form

**Components:**
- `UserTable` — Displays users in table format
- `UserForm` — Reusable form for create/edit
- `UserCreatePage` — Handles user creation API calls
- `UserEditPage` — Handles user update API calls

**Features:**
- Server-side pagination, sorting, and search
- Field-level and global error display
- Loading states and success messages
- Delete confirmation modal

---

## Error Handling Architecture

### Error Flow

**Standard Flow:**
1. Service/Validation throws Error instance
2. API route catches error
3. `error()` helper formats error response
4. JSON response returned to client

**Error Structure:**
```json
{
  "status": "error",
  "error": {
    "message": "French error message",
    "code": "ERROR_CODE",
    "details": [
      { "field": "email", "message": "L'email est requis." }
    ]
  }
}
```

### Error Factory

**`createError(message, code, status)`**
- Creates standardized Error instance
- Adds `code` and `status` properties
- Used by all services for consistent error format

### Error Formatter

**`formatValidationError(error)`**
- Formats Zod validation errors
- Converts to structured error with French messages
- Returns Error instance with `code`, `status`, and `details`

### Response Helper

**`error(err)`**
- Formats error for API response
- Assumes `err` is Error instance with string message
- Returns JSON Response with standardized error format

---

## First Manager Setup

### Script

**Location:** `scripts/create-first-manager.js`

**Usage:**
```bash
node scripts/create-first-manager.js
```

**Required Environment Variables:**
- `MONGODB_URI` — MongoDB connection string
- `FIRST_MANAGER_NAME` — Name of first manager
- `FIRST_MANAGER_EMAIL` — Email of first manager
- `FIRST_MANAGER_PASSWORD` — Password for first manager (min 6 characters)

**Process:**
1. Validates environment variables
2. Validates password length and email format
3. Connects to MongoDB
4. Checks if any manager already exists (prevents re-running)
5. Checks if email already exists
6. Creates manager account (password hashed by pre-save hook)
7. Closes database connection

**Safety Features:**
- Prevents re-running if manager already exists
- Validates all inputs before execution
- Uses secure password hashing

---

## Architectural Rules

### Separation of Concerns

**Service Layer:**
- Contains all business logic
- No knowledge of HTTP requests/responses
- No knowledge of UI
- Returns plain objects

**API Layer:**
- Handles authentication/authorization
- Validates input (Zod)
- Delegates to services
- Formats responses

**UI Layer:**
- Handles user interactions
- Makes API calls
- Displays data and errors
- No business logic

### Error Handling

**Rules:**
- Only Error instances are thrown
- All errors use `createError()` factory
- Errors have `code`, `status`, and optional `details`
- Error messages in French for UI

### Validation

**Rules:**
- All API inputs validated with Zod
- Validation schemas mirror User model
- French error messages for UI
- Validation occurs before service layer

### Authorization

**Rules:**
- All user management endpoints require manager role
- Authorization checked at API layer (middleware)
- Services assume authorization already checked
- Role stored in JWT token

---

## Known Limitations

### Password Requirements

- **Current:** Minimum 6 characters
- **Limitation:** No complexity requirements (uppercase, lowercase, numbers, symbols)
- **Future:** Can be strengthened in production

### Rate Limiting

- **Current:** No rate limiting on user creation or login
- **Limitation:** Could be abused for brute force attacks
- **Future:** Should add rate limiting middleware

### Audit Logging

- **Current:** No logging of user management operations
- **Limitation:** No audit trail for security incidents
- **Future:** Should add audit logging service

### Session Management

- **Current:** No UI for viewing/revoking active sessions
- **Limitation:** Cannot manage user sessions
- **Future:** Should add session management UI

### Password Reset

- **Current:** No forgot password functionality
- **Limitation:** Users cannot recover accounts
- **Future:** Should add password reset flow

---

## Technical Stack

**Backend:**
- Next.js 14.2.0 App Router
- MongoDB with Mongoose 9.0.1
- JWT (jsonwebtoken)
- bcrypt for password hashing
- Zod for validation

**Frontend:**
- React 18.3.0
- Next.js Server/Client Components
- styled-components
- French UI text

**Architecture:**
- Service-oriented architecture
- Layered architecture (API → Service → Model)
- Stateless JWT authentication
- HTTP-only cookies for session management

---

## Security Considerations

### Password Security

- Passwords hashed with bcrypt (10 salt rounds)
- Passwords never returned in API responses
- Password hashing occurs in Mongoose pre-save hook

### Session Security

- JWT tokens stored in HTTP-only cookies
- Cookies use `secure: true` in production
- Cookies use `sameSite: "strict"` for CSRF protection
- Token expiration: 7 days

### Authorization

- Role-based access control (RBAC)
- Manager-only endpoints protected by middleware
- Role verified on every authenticated request

### Input Validation

- All inputs validated with Zod schemas
- Email format validation
- Password length validation
- Role enum validation

---

## Conclusion

Phase 0.5 provides a complete, production-ready User & Access Management infrastructure. The implementation follows architectural best practices with clear separation of concerns, consistent error handling, and secure authentication/authorization.

The system is ready for production deployment with the first manager setup script, and managers can create and manage user accounts through the Dashboard UI.

---

**End of Documentation**

