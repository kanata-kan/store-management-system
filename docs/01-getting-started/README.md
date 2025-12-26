# Getting Started

**Last Updated:** 2025-01-02  
**Level:** Beginner  
**Estimated Time:** 30-60 minutes

---

## Overview

Welcome to the Store Management System! This section will help you get started from scratch to running the project locally.

---

## Section Contents

| File | Description | Time |
|------|-------------|------|
| [system-requirements.md](./system-requirements.md) | System requirements and specifications | 10 min |
| [development-auth.md](./development-auth.md) | Development authentication setup | 5 min |
| [quick-start.md](./quick-start.md) | Quick start guide | 10 min |
| [installation.md](./installation.md) | Detailed installation steps | 15 min |
| [first-steps.md](./first-steps.md) | Your first development steps | 20 min |

---

## What You'll Learn

By the end of this section, you will be able to:

- ✅ Install the project locally
- ✅ Set up the database
- ✅ Run the local server
- ✅ Understand the basic project structure
- ✅ Make your first modification
- ✅ Test your changes

---

## Quick Start

```bash
# 1. Clone the repository
git clone [repository-url]
cd store-management-system

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# 4. Seed database (optional)
npm run seed

# 5. Run development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** 18+ and npm
- ✅ **MongoDB** (Atlas or local)
- ✅ **Git**
- ✅ Text editor (VS Code recommended)

---

## Development Authentication Setup

For local development, see:
- [development-auth.md](./development-auth.md) - Enable Development Auth Bypass

---

## Next Steps

After completing this section:

1. 📖 Read [Architecture Documentation](../02-architecture/) to understand the system architecture
2. 💻 Review [Development Guide](../03-development/) for development standards
3. 🌐 Explore [API Documentation](../04-api/) to learn about APIs
4. 🎨 Learn [UI/UX Guide](../07-ui-ux/) to understand the design system

---

## Common Issues

### Issue: Cannot connect to database
```
Solution: Verify MONGODB_URI in .env file
```

### Issue: npm install error
```
Solution: Delete node_modules/ and package-lock.json, then reinstall
```

### Issue: Port 3000 is in use
```
Solution: Stop any application using Port 3000 or change PORT in .env
```

---

## Getting Help

If you encounter an issue:
- 📖 Review [Troubleshooting Guide](../09-maintenance/)
- 📧 Contact the team
- 🐛 Create an Issue on GitHub

---

## Useful Links

- [Project README](../../README.md)
- [Architecture Principles](../../ARCHITECTURE.md)
- [API Reference](../04-api/)
- [Development Guide](../03-development/)

---

**Status:** Active  
**Last Updated:** 2025-01-02
