# Phase 6 — Authentication & Authorization Implementation Report

**Date:** 2025-01-12  
**Phase:** Phase 6 - Authentication & Authorization  
**Status:** ✅ Completed  
**Middleware Functions:** 4/4

---

## 📋 Executive Summary

Phase 6 successfully implemented a complete authentication and authorization middleware layer for the Store Management System. All middleware functions were created to protect API routes with proper authentication and role-based access control (RBAC). The middleware integrates seamlessly with the API layer built in Phase 5 and the AuthService from Phase 3.

**Total Middleware Functions:** 4  
**Integration:** Works with all 20 API routes from Phase 5  
**Security:** HTTP-only cookies, JWT token verification, role-based authorization  
**Error Handling:** Standardized with French messages

---

## 🏗️ Middleware Implementation

### Authentication & Authorization Middleware (`lib/auth/middleware.js`)

**Purpose:** Protect API routes with authentication and authorization using JWT tokens from HTTP-only cookies.

**Location:** `lib/auth/middleware.js`

**Dependencies:**
- `AuthService` from Phase 3 (for token verification)
- `errorFactory` from utils (for error creation)
- `cookies()` from `next/headers` (Next.js App Router)

---

## 🔐 Middleware Functions

### 1. `getSession(request)`

**Purpose:** Non-throwing utility to extract and verify session token. Useful for optional authentication checks.

**Signature:**
```javascript
export async function getSession(request) → Promise<Object|null>
```

**Behavior:**
- Extracts JWT token from HTTP-only cookie
- Verifies token using `AuthService.getUserFromSession()`
- Returns user data if authenticated
- Returns `null` if not authenticated or token is invalid
- **Never throws** - safe for optional authentication checks

**Use Cases:**
- Routes that work with or without authentication
- Optional user context in responses
- Conditional UI rendering based on auth status

**Example Usage:**
```javascript
export async function GET(request) {
  const user = await getSession(request);
  
  if (user) {
    // User is authenticated
    return Response.json({ data: user, authenticated: true });
  }
  
  // User is not authenticated (but route still works)
  return Response.json({ data: null, authenticated: false });
}
```

**Return Value:**
```javascript
// If authenticated:
{
  id: "ObjectId",
  name: "User Name",
  email: "user@example.com",
  role: "manager" | "cashier",
  createdAt: Date,
  updatedAt: Date
}

// If not authenticated:
null
```

---

### 2. `requireUser(request)`

**Purpose:** Enforce authentication. Verifies JWT token and returns user data. Throws error if not authenticated.

**Signature:**
```javascript
export async function requireUser(request) → Promise<Object>
```

**Behavior:**
- Extracts JWT token from HTTP-only cookie
- Verifies token using `AuthService.getUserFromSession()`
- Returns user data if authenticated
- Throws `UNAUTHORIZED` error (401) if:
  - No token found
  - Token is invalid
  - Token is expired
  - Session expired

**Error Handling:**
- Handles `SESSION_EXPIRED`, `UNAUTHORIZED` errors
- Handles JWT errors (`JsonWebTokenError`, `TokenExpiredError`)
- Re-throws other errors (database errors, etc.)

**Use Cases:**
- All protected API routes
- Routes that require authentication but not specific role
- Base authentication check before role checks

**Example Usage:**
```javascript
export async function GET(request) {
  try {
    const user = await requireUser(request);
    // user is guaranteed to be authenticated
    return Response.json({ data: user });
  } catch (err) {
    return error(err); // Returns 401 if not authenticated
  }
}
```

**Throws:**
- `Error` with code `"UNAUTHORIZED"` and status `401`
- Message: `"Authentification requise"` (French)

---

### 3. `requireManager(request)`

**Purpose:** Enforce manager role. Verifies user is authenticated AND has manager role.

**Signature:**
```javascript
export async function requireManager(request) → Promise<Object>
```

**Behavior:**
- Calls `requireUser()` first (enforces authentication)
- Checks if `user.role === "manager"`
- Returns user data if manager
- Throws `FORBIDDEN` error (403) if not manager

**Authorization Logic:**
- Only users with `role: "manager"` can access
- Cashiers are denied access
- Unauthenticated users get `UNAUTHORIZED` (401) from `requireUser()`

**Use Cases:**
- Manager-only operations (create/update/delete products)
- Inventory management operations
- Category, brand, supplier management
- Viewing all sales records
- Dashboard analytics

**Example Usage:**
```javascript
export async function POST(request) {
  try {
    const manager = await requireManager(request);
    // manager.role is guaranteed to be "manager"
    const product = await ProductService.createProduct(data);
    return success(product, 201);
  } catch (err) {
    return error(err); // Returns 401 or 403
  }
}
```

**Throws:**
- `Error` with code `"UNAUTHORIZED"` and status `401` (if not authenticated)
- `Error` with code `"FORBIDDEN"` and status `403` (if not manager)
- Message: `"Accès refusé. Seuls les gestionnaires peuvent accéder à cette ressource."` (French)

---

### 4. `requireCashier(request)`

**Purpose:** Enforce cashier or manager role. Verifies user is authenticated AND has cashier or manager role.

**Signature:**
```javascript
export async function requireCashier(request) → Promise<Object>
```

**Behavior:**
- Calls `requireUser()` first (enforces authentication)
- Checks if `user.role === "cashier" || user.role === "manager"`
- Returns user data if cashier or manager
- Throws `FORBIDDEN` error (403) if neither cashier nor manager

**Authorization Logic:**
- **Hierarchical Permissions:** Managers can perform cashier operations
- Users with `role: "cashier"` can access
- Users with `role: "manager"` can access (has all permissions)
- Unauthenticated users get `UNAUTHORIZED` (401) from `requireUser()`

**Use Cases:**
- Sales operations (register sale)
- Product search and viewing
- Cashier's own sales history
- Any operation that both cashiers and managers can perform

**Example Usage:**
```javascript
export async function POST(request) {
  try {
    const user = await requireCashier(request);
    // user.role is guaranteed to be "cashier" or "manager"
    validated.cashierId = user.id; // Auto-inject user ID
    const sale = await SaleService.registerSale(validated);
    return success(sale, 201);
  } catch (err) {
    return error(err); // Returns 401 or 403
  }
}
```

**Throws:**
- `Error` with code `"UNAUTHORIZED"` and status `401` (if not authenticated)
- `Error` with code `"FORBIDDEN"` and status `403` (if not cashier/manager)
- Message: `"Accès refusé. Seuls les caissiers et les gestionnaires peuvent accéder à cette ressource."` (French)

---

## 🔧 Technical Implementation Details

### Token Extraction Strategy

**Primary Method:** Next.js `cookies()` API
```javascript
const cookieStore = cookies();
const tokenCookie = cookieStore.get("session_token");
```

**Fallback Method:** Header parsing
```javascript
const cookieHeader = request.headers.get("cookie");
// Parse cookie string manually
```

**Rationale:**
- `cookies()` is the preferred method in Next.js App Router
- Fallback ensures compatibility in all contexts
- Graceful degradation if `cookies()` fails

### Cookie Parsing Logic

**Implementation:**
- Splits cookie string by `;`
- Parses each key-value pair
- Handles URL decoding with error handling
- Returns `null` if `session_token` not found

**Error Handling:**
- Handles malformed cookies gracefully
- Handles URL decode errors
- Returns `null` instead of throwing

### Error Handling Strategy

**Authentication Errors:**
- `SESSION_EXPIRED` → `UNAUTHORIZED` (401)
- `UNAUTHORIZED` → `UNAUTHORIZED` (401)
- `JsonWebTokenError` → `UNAUTHORIZED` (401)
- `TokenExpiredError` → `UNAUTHORIZED` (401)

**Authorization Errors:**
- Not manager → `FORBIDDEN` (403)
- Not cashier/manager → `FORBIDDEN` (403)

**Other Errors:**
- Database errors → Re-thrown as-is
- Service errors → Re-thrown as-is

### Integration with AuthService

**Flow:**
1. Extract token from request
2. Call `AuthService.getUserFromSession(token)`
3. AuthService verifies JWT token
4. AuthService fetches user from database
5. Returns user data (without passwordHash)

**Error Propagation:**
- AuthService errors are caught and re-formatted
- Maintains consistent error format across layers
- French messages for UI display

---

## 🔗 Integration with API Layer (Phase 5)

### All API Routes Protected

**Products API:**
- `GET /api/products` → `requireCashier()`
- `POST /api/products` → `requireManager()`
- `GET /api/products/[id]` → `requireCashier()`
- `PATCH /api/products/[id]` → `requireManager()`
- `DELETE /api/products/[id]` → `requireManager()`
- `GET /api/products/search` → `requireCashier()`

**Sales API:**
- `POST /api/sales` → `requireCashier()`
- `GET /api/sales` → `requireManager()`
- `GET /api/sales/my-sales` → `requireCashier()`

**Inventory API:**
- `POST /api/inventory-in` → `requireManager()`
- `GET /api/inventory-in` → `requireManager()`

**Categories, SubCategories, Brands, Suppliers:**
- All GET routes → `requireManager()` (read access)
- All POST routes → `requireManager()`
- All PATCH routes → `requireManager()`
- All DELETE routes → `requireManager()`

**Auth API:**
- `POST /api/auth/login` → No authentication (public)
- `POST /api/auth/logout` → `requireUser()`
- `GET /api/auth/session` → `requireUser()`

### Seamless Integration

**No Breaking Changes:**
- All API routes from Phase 5 continue to work
- Same function signatures
- Same error handling
- Same response format

**Auto-Injection Pattern:**
- `requireCashier()` used in sales routes → auto-injects `cashierId`
- `requireManager()` used in inventory routes → auto-injects `managerId`
- User ID extracted from authenticated user (prevents impersonation)

---

## 🔒 Security Features

### 1. HTTP-Only Cookies

**Implementation:**
- Token stored in HTTP-only cookie (`session_token`)
- Cookie set in login route with secure settings
- Cookie deleted in logout route

**Security Benefits:**
- Prevents XSS attacks (JavaScript cannot access cookie)
- Token not exposed to client-side code
- Automatic cookie management by browser

### 2. JWT Token Verification

**Process:**
1. Extract token from cookie
2. Verify token signature using `JWT_SECRET`
3. Check token expiration
4. Extract `userId` from token payload
5. Fetch user from database
6. Return user data

**Security Benefits:**
- Token cannot be tampered with (signature verification)
- Expired tokens rejected automatically
- User must exist in database (token alone is not enough)

### 3. Role-Based Access Control (RBAC)

**Implementation:**
- Two roles: `manager` and `cashier`
- Hierarchical permissions (manager can do cashier operations)
- Role checked after authentication
- Clear error messages for unauthorized access

**Authorization Levels:**
- **Public:** `/api/auth/login` only
- **Authenticated:** Any logged-in user (`requireUser`)
- **Cashier:** Cashiers and managers (`requireCashier`)
- **Manager:** Managers only (`requireManager`)

### 4. Error Message Security

**French Messages:**
- All error messages in French for UI display
- No sensitive information leaked in errors
- Generic messages for security (don't reveal if user exists)

**Error Codes:**
- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - Insufficient permissions
- Consistent error format across all routes

---

## 📊 Function Comparison

| Function | Throws? | Returns | Use Case |
|----------|---------|---------|----------|
| `getSession()` | No | `Object\|null` | Optional authentication |
| `requireUser()` | Yes (401) | `Object` | Enforce authentication |
| `requireManager()` | Yes (401/403) | `Object` | Manager-only operations |
| `requireCashier()` | Yes (401/403) | `Object` | Cashier/Manager operations |

---

## 🎯 Design Decisions

### 1. Non-Throwing `getSession()`

**Decision:** `getSession()` returns `null` instead of throwing.

**Rationale:**
- Useful for optional authentication checks
- Allows routes to work with or without authentication
- Cleaner code (no try-catch needed)

**Alternative Considered:**
- Throwing version would require try-catch everywhere
- Less flexible for optional auth scenarios

### 2. Hierarchical Permissions

**Decision:** Managers can perform cashier operations.

**Rationale:**
- Manager has all permissions by design
- Simplifies authorization logic
- Matches business requirements

**Implementation:**
```javascript
if (user.role !== "cashier" && user.role !== "manager") {
  throw FORBIDDEN;
}
```

### 3. Cookie Extraction Strategy

**Decision:** Try `cookies()` first, fallback to header parsing.

**Rationale:**
- `cookies()` is preferred in Next.js App Router
- Fallback ensures compatibility
- Graceful degradation

**Implementation:**
- Primary: `cookies().get("session_token")`
- Fallback: Parse `request.headers.get("cookie")`

### 4. Error Message Language

**Decision:** All error messages in French.

**Rationale:**
- UI language is French (per requirements)
- Consistent user experience
- Better UX with native language

**Implementation:**
- `"Authentification requise"` for 401 errors
- `"Accès refusé..."` for 403 errors
- All messages match UI language requirements

### 5. Error Code Consistency

**Decision:** Use consistent error codes across all middleware.

**Rationale:**
- Easy error handling in API routes
- Consistent error format
- Frontend can handle errors uniformly

**Error Codes:**
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions

---

## 🔄 Request Flow with Middleware

### Example: Protected Route Flow

```
1. Request arrives at API route
   │
   ▼
2. Middleware called (e.g., requireManager)
   │
   ├─► Extract token from cookie
   │   │
   │   ├─► Try cookies() API
   │   └─► Fallback to header parsing
   │
   ▼
3. Verify token (AuthService.getUserFromSession)
   │
   ├─► Verify JWT signature
   ├─► Check expiration
   ├─► Fetch user from database
   └─► Return user data
   │
   ▼
4. Check role (if requireManager/requireCashier)
   │
   ├─► Compare user.role with required role
   └─► Throw FORBIDDEN if mismatch
   │
   ▼
5. Return user data to route handler
   │
   ▼
6. Route handler proceeds with business logic
```

### Error Flow

```
Authentication Error
   │
   ▼
requireUser() throws UNAUTHORIZED (401)
   │
   ▼
API route catches error
   │
   ▼
error() helper formats response
   │
   ▼
JSON response with French message
```

---

## ✅ Verification

### Linting

- ✅ Middleware file passes ESLint validation
- ✅ No syntax errors
- ✅ Code formatting consistent (Prettier)

### Integration Testing

- ✅ All API routes from Phase 5 work without modification
- ✅ Authentication works correctly
- ✅ Authorization works correctly
- ✅ Error handling works correctly

### Function Coverage

- ✅ `getSession()` - Implemented and tested
- ✅ `requireUser()` - Implemented and tested
- ✅ `requireManager()` - Implemented and tested
- ✅ `requireCashier()` - Implemented and tested

---

## 🚀 Next Steps

### Phase 7: Manager Dashboard

With authentication middleware complete, frontend can now:
1. Call protected API endpoints
2. Handle authentication errors
3. Display user-specific data
4. Implement role-based UI rendering

### Future Enhancements (Optional)

**Token Refresh:**
- Automatic token refresh before expiration
- Seamless session renewal
- Better user experience

**Session Management:**
- Active session tracking
- Multi-device login support
- Session invalidation

**Audit Logging:**
- Log authentication attempts
- Log authorization failures
- Track user activity

---

## 📚 Architecture Notes

### Design Principles Applied

1. **Separation of Concerns:** Middleware only handles auth/authz, not business logic
2. **Reusability:** All routes use same middleware functions
3. **Consistency:** Same error format across all middleware
4. **Security First:** HTTP-only cookies, JWT verification, role checks
5. **User Experience:** French error messages for UI

### Security Best Practices

1. **Token Storage:** HTTP-only cookies (XSS protection)
2. **Token Verification:** Server-side JWT verification
3. **Role Validation:** Server-side role checks
4. **Error Messages:** Generic messages (no information leakage)
5. **Cookie Settings:** Secure, sameSite: strict

### Integration Points

**With Phase 3 (AuthService):**
- Uses `AuthService.getUserFromSession()` for token verification
- Maintains separation: middleware handles HTTP, service handles business logic

**With Phase 5 (API Routes):**
- All routes import and use middleware functions
- Consistent error handling across all routes
- No breaking changes to existing routes

---

## 🎯 Completion Status

**Phase 6 Tasks:**

- ✅ Task 6.1: requireUser - Implemented with JWT verification
- ✅ Task 6.2: requireManager - Implemented with role check
- ✅ Task 6.3: requireCashier - Implemented with hierarchical permissions
- ✅ Task 6.4: getSession - Implemented as non-throwing utility

**Status:** ✅ **ALL MIDDLEWARE FUNCTIONS COMPLETE**

---

## 📝 Summary

Phase 6 successfully implemented a complete, production-ready authentication and authorization middleware layer with:

- ✅ 4 middleware functions (getSession, requireUser, requireManager, requireCashier)
- ✅ JWT token verification from HTTP-only cookies
- ✅ Role-based access control (RBAC)
- ✅ Hierarchical permissions (manager can do cashier operations)
- ✅ Next.js App Router integration
- ✅ Graceful fallback for cookie access
- ✅ Comprehensive error handling
- ✅ French error messages for UI
- ✅ Seamless integration with Phase 5 API routes
- ✅ No breaking changes to existing code
- ✅ Ready for frontend integration

The middleware layer follows all architectural requirements and security best practices, providing a solid foundation for the frontend implementation in Phase 7.

---

_Report generated: 2025-01-12_  
_All middleware functions ready for Phase 7: Manager Dashboard_

