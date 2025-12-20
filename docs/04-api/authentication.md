# 🔐 Authentication API

> API endpoints for authentication

**آخر تحديث:** 20 ديسمبر 2025

---

## Overview

Authentication system uses JWT tokens stored in HTTP-only cookies.

**Base URL:** `/api/auth`

---

## Endpoints

### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "manager@test.com",
  "password": "Manager@123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Connexion réussie",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Admin Manager",
      "email": "manager@test.com",
      "role": "manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Validation error

---

### POST /api/auth/logout

Logout current user.

**Request:** No body required

**Response (200):**
```json
{
  "status": "success",
  "message": "Déconnexion réussie"
}
```

---

### GET /api/auth/me

Get current user info.

**Auth:** Required

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin Manager",
    "email": "manager@test.com",
    "role": "manager",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated

---

## Authentication Flow

```
1. User submits credentials → POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token
4. Server sets HTTP-only cookie
5. Client uses cookie for subsequent requests
6. Server validates token on protected routes
```

---

## Cookie Details

```
Name: token
HttpOnly: true
Secure: true (in production)
SameSite: Strict
Max-Age: 7 days
```

---

## Related

- [API Reference](api-reference.md) - All endpoints
- [Authorization](../02-architecture/api-layer.md#authorization) - RBAC system

