# Architecture Documentation

**Last Updated:** 2025-01-02  
**Level:** Intermediate  
**Estimated Time:** 1-2 hours

---

## Overview

This section provides a deep understanding of the Store Management System architecture, its principles, and patterns.

---

## Section Contents

| File | Description | Status |
|------|-------------|--------|
| [system-overview.md](./system-overview.md) | System overview | ✅ Available |
| [architectural-decisions.md](./architectural-decisions.md) | Important architectural decisions | ✅ Available |
| [service-layer.md](./service-layer.md) | Service Layer explanation | ✅ Available |
| [data-layer.md](./data-layer.md) | Data Layer (Models) explanation | ✅ Available |
| [api-layer.md](./api-layer.md) | API Layer explanation | ✅ Available |

---

## Core Principles

### 1. Service-Oriented Architecture (SOA)
```
All business logic in Service Layer
❌ No business logic in API Routes
❌ No business logic in Frontend
```

### 2. Layered Architecture
```
UI Layer → API Layer → Service Layer → Data Layer → Database
Each layer only communicates with adjacent layers
```

### 3. Server Components First
```
Server Components = Default
Client Components = Exception (for interaction only)
```

### 4. No Business Logic in Frontend
```
Frontend: Display only
Backend: Business logic
```

---

## System Structure

```
┌─────────────────────────────────────┐
│         UI Layer (React)            │
│   Server Components + Client        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        API Layer (Routes)           │
│   Validation + Authorization        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Service Layer (Business)        │
│   All Business Logic Here           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Data Layer (Mongoose Models)     │
│   Schema Definitions                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Database (MongoDB)             │
│   Persistence + Transactions        │
└─────────────────────────────────────┘
```

---

## Key Concepts

### Service Layer
- ✅ All business logic
- ✅ Transactions (MongoDB)
- ✅ Business rules validation
- ✅ Reusable across entry points

### API Layer
- ✅ Thin layer
- ✅ Validation (Zod)
- ✅ Authorization (RBAC)
- ✅ Delegation to Services

### Data Layer
- ✅ Mongoose Models
- ✅ Schema definitions
- ✅ Virtual fields
- ✅ Indexes

---

## Official Reference

For official and binding principles, see:
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Official and binding reference

---

## Next Steps

After understanding the architecture:
1. 💻 Read [Development Guide](../03-development/) to start developing
2. 🌐 Explore [API Documentation](../04-api/)
3. 🎨 Learn [Features Documentation](../05-features/)

---

## Related Links

- [Official Architecture Principles](../../ARCHITECTURE.md)
- [API Documentation](../04-api/)
- [Development Guide](../03-development/)
- [Database Documentation](../06-database/)

---

**Status:** Active  
**Last Updated:** 2025-01-02
