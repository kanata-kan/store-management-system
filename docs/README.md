# Documentation

**Store Management System**  
**Version:** 2.0  
**Last Updated:** 2025-01-02  
**Status:** Active & Maintained

---

## Overview

This directory contains comprehensive documentation for the Store Management System. The documentation is organized by topic to help developers understand, develop, and maintain the system.

**Starting Point:** New developers should begin with [Getting Started](./01-getting-started/) and [Architecture Documentation](../ARCHITECTURE.md).

---

## Documentation Structure

### Core Sections

| Section | Description | Purpose | Time |
|---------|-------------|---------|------|
| [01-getting-started/](./01-getting-started/) | Quick start guide | Set up project locally | 30-60 min |
| [02-architecture/](./02-architecture/) | System architecture | Understand design and principles | 1-2 hours |
| [03-development/](./03-development/) | Development guide | Coding standards and patterns | 2 hours |
| [04-api/](./04-api/) | API documentation | API endpoints reference | As needed |
| [05-features/](./05-features/) | Features documentation | Understand each feature | As needed |
| [06-database/](./06-database/) | Database documentation | Models and schemas | As needed |
| [07-ui-ux/](./07-ui-ux/) | Design system | UI/UX guidelines | As needed |
| [08-deployment/](./08-deployment/) | Deployment guide | Production setup | When deploying |
| [09-maintenance/](./09-maintenance/) | Maintenance guide | Troubleshooting | As needed |

---

## Quick Start Paths

### For New Developers (3-4 hours)

```
1. Getting Started (30 min)
   └─> Install and run project locally

2. Architecture Overview (1 hour)
   └─> Understand system architecture

3. Development Guide (2 hours)
   └─> Learn coding standards and patterns

4. First Feature (30 min)
   └─> Add your first feature
```

### For Frontend Developers (2 hours)

```
1. Architecture → UI Layer (30 min)
2. UI/UX Guide (1 hour)
3. Component Patterns (30 min)
4. Start coding!
```

### For Backend Developers (2 hours)

```
1. Architecture → Service Layer (30 min)
2. API Documentation (30 min)
3. Database Documentation (30 min)
4. Service Patterns (30 min)
5. Start coding!
```

---

## Key Files

### In Project Root

- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Official architectural principles (START HERE)
- [DEPLOYMENT_STRATEGY.md](../DEPLOYMENT_STRATEGY.md) - Deployment strategy
- [ENV_REFERENCE.md](../ENV_REFERENCE.md) - Environment variables reference

### In docs/

- This file - Main documentation index
- 9 organized sections by topic
- Each section has its own README.md

---

## Documentation Structure

```
docs/
│
├── 01-getting-started/     ⚡ Quick Start
│   ├── Quick start
│   ├── Installation
│   └── First steps
│
├── 02-architecture/        🏗️ Understanding
│   ├── System overview
│   ├── Service layer
│   └── Data layer
│
├── 03-development/         💻 Development
│   ├── Coding standards
│   ├── Patterns
│   └── Testing
│
├── 04-api/                 🌐 Reference
│   └── API endpoints
│
├── 05-features/            🎯 Features
│   ├── Products
│   ├── Sales
│   └── Invoices
│
├── 06-database/            🗄️ Database
│   ├── Models
│   └── Schemas
│
├── 07-ui-ux/              🎨 Design
│   ├── Design system
│   └── Components
│
├── 08-deployment/          🚀 Deployment
│   └── Deployment guide
│
└── 09-maintenance/         🔧 Maintenance
    └── Troubleshooting
```

---

## Where to Find...

### How do I get started?
→ [Getting Started](./01-getting-started/)

### How does the system work?
→ [Architecture](./02-architecture/) and [ARCHITECTURE.md](../ARCHITECTURE.md)

### How do I write code?
→ [Development Guide](./03-development/)

### Where are the API endpoints?
→ [API Documentation](./04-api/)

### How does a specific feature work?
→ [Features Documentation](./05-features/)

### How do I design the database?
→ [Database Documentation](./06-database/)

### How do I use the theme?
→ [UI/UX Guide](./07-ui-ux/)

### How do I deploy the project?
→ [Deployment Guide](./08-deployment/)

### How do I troubleshoot issues?
→ [Maintenance Guide](./09-maintenance/)

---

## Core Principles

```javascript
// 1. Business logic in Service Layer only
await ProductService.createProduct(data);

// 2. Validation using Zod
const validated = validateProduct(body);

// 3. Authorization server-side
await requireManager(request);

// 4. French UI / English Code
<Button>Ajouter un produit</Button> // ✅

// 5. Theme tokens only
background: ${props => props.theme.colors.primary}; // ✅
```

---

## Getting Help

### Technical Issue?
1. Review [Troubleshooting Guide](./09-maintenance/)
2. Search documentation
3. Contact the team

### Can't Find a File?
- Use the table above
- Browse sections
- Check section README files

---

## Important Notes

1. **Start with getting-started/** - Don't skip it
2. **Read ARCHITECTURE.md** - Official and binding principles
3. **Update documentation** when modifying code
4. **Follow standards** in Development Guide

---

## Quality Standards

### Good Documentation
- Clear and direct
- Examples from actual code
- Always up to date
- Logically organized

### Bad Documentation
- Outdated and not maintained
- No examples
- Disorganized
- Contains incorrect information

---

## Related Resources

- [Project Repository](https://github.com/your-repo)
- [Issue Tracker](https://github.com/your-repo/issues)

---

**Status:** Active & Maintained  
**Version:** 2.0  
**Last Major Update:** 2025-01-02  
**Next Review:** 2026-01-20
