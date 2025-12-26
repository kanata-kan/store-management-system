# Store Management System

## Overview

The Store Management System is a professional inventory and sales management solution designed for retail operations. The system provides comprehensive tools for managing products, inventory, sales transactions, invoicing, and financial reporting in a unified platform.

This system is built with an architecture-first approach, ensuring scalability, maintainability, and long-term reliability for business operations.

---

## System Purpose

The Store Management System addresses core retail business needs:

- **Product Management**: Complete product catalog with brands, categories, subcategories, and supplier relationships
- **Inventory Control**: Real-time stock tracking, low stock alerts, and inventory history
- **Sales Processing**: Multi-item sales registration with automatic stock updates and transaction management
- **Invoicing**: Automatic invoice generation with PDF export and warranty tracking
- **Financial Tracking**: Revenue, profit, and tax calculations with comprehensive reporting
- **User Management**: Role-based access control for managers and cashiers

The system is designed for retail stores, initially optimized for home appliances but extensible to other product categories.

---

## Architecture-First Philosophy

This system is built on a foundation of architectural principles that ensure professional quality, scalability, and maintainability.

**Architectural Contract**: All code modifications must respect the architectural principles defined in [ARCHITECTURE.md](./ARCHITECTURE.md). This document serves as the **Single Source of Truth** for architectural decisions and is binding for all development work.

### Key Architectural Principles

- **Service-Oriented Architecture (SOA)**: All business logic resides in the Service Layer, ensuring reusability and testability
- **Layered Architecture**: Clear separation of concerns across UI, API, Validation, Authorization, Service, Data Access, and Database layers
- **Server Components First**: Next.js App Router with Server Components as the default, Client Components only when interaction is required
- **Data Integrity**: Database transactions for atomic operations, snapshot-based architecture for historical data accuracy
- **Audit Trail**: Complete history preservation with soft deletes and comprehensive metadata tracking
- **No Business Logic in Frontend**: Frontend handles display and interaction only; all business rules enforced server-side

For complete architectural documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Repository Structure

The repository is organized to support the layered architecture and maintain clear separation of concerns:

```
store-management-system/
├── app/                    # Next.js application
│   ├── api/               # API route handlers (thin layer)
│   ├── dashboard/         # Manager interface pages
│   ├── cashier/           # Cashier interface pages
│   └── login/             # Authentication pages
├── lib/                    # Core business logic
│   ├── services/          # Business logic layer
│   ├── models/            # Mongoose data models
│   ├── validation/        # Zod validation schemas
│   ├── middleware/        # Authorization middleware
│   └── utils/             # Utility functions
├── components/             # Reusable UI components
│   ├── domain/            # Domain-specific components
│   ├── ui/                # Generic UI components
│   └── shared/            # Shared components
├── docs/                   # Comprehensive documentation
│   ├── 01-getting-started/
│   ├── 02-architecture/
│   ├── 03-development/
│   ├── 04-api/
│   ├── 05-features/
│   ├── 06-database/
│   ├── 07-ui-ux/
│   ├── 08-deployment/
│   └── 09-maintenance/
└── scripts/                # Utility scripts (seeding, migrations)
```

---

## Documentation

Comprehensive documentation is organized in the [`docs/`](./docs/) directory. See [docs/README.md](./docs/README.md) for a complete index and navigation guide.

### Key Documentation Sections

- **[Getting Started](./docs/01-getting-started/)**: Installation, setup, and first steps
- **[Architecture](./docs/02-architecture/)**: System architecture, layers, and design decisions
- **[Development Guide](./docs/03-development/)**: Coding standards, patterns, and best practices
- **[API Reference](./docs/04-api/)**: Complete API documentation and authentication
- **[Features](./docs/05-features/)**: Detailed feature documentation (products, sales, invoices)
- **[Database](./docs/06-database/)**: Data models, schemas, and seeding guides
- **[UI/UX](./docs/07-ui-ux/)**: Design system and component guidelines
- **[Deployment](./docs/08-deployment/)**: Deployment strategy and environment configuration
- **[Maintenance](./docs/09-maintenance/)**: Troubleshooting and maintenance guides

**Starting Point**: New developers should begin with [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system's architectural principles.

---

## Deployment Status

**Current Status**: Production-ready

**Deployment Strategy**: Staging-first approach with comprehensive environment separation

**Infrastructure**:
- **Hosting**: Vercel
- **Database**: MongoDB Atlas
- **Configuration**: Environment-based (no Docker, no VPS)

**Environments**:
- **Development**: Local development and testing
- **Staging**: Pre-production testing and validation
- **Production**: Live system for end users

For complete deployment documentation, see [docs/08-deployment/DEPLOYMENT_STRATEGY.md](./docs/08-deployment/DEPLOYMENT_STRATEGY.md).

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), JavaScript (ES6+)
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose ODM
- **Validation**: Zod schemas
- **Authorization**: RBAC (Role-Based Access Control) with JWT
- **Styling**: Styled-components with centralized theme system
- **Charts**: Recharts for data visualization

---

## User Roles

The system supports two distinct user roles with appropriate access levels:

- **Manager (Gestionnaire)**: Full system access including product management, inventory control, sales oversight, user management, financial reports, and system configuration
- **Cashier (Caissier)**: Sales operations (register sales, view products/inventory) and read-only access to product and inventory information

---

## Language Requirements

- **UI Language**: All user-facing text (labels, buttons, error messages, placeholders) is in **French**
- **Technical Documentation**: All technical content (code, comments, API documentation) is in **English**

This separation ensures the user interface is accessible to French-speaking users while maintaining a professional English codebase for developers.

---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Version**: 0.1.0  
**Status**: Production-ready  
**Last Updated**: 2025-01-02
