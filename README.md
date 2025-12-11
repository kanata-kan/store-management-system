# Store Management System

## Inventory Management System for Home Appliances Store

A comprehensive inventory management system designed for managing home appliances store operations including TVs, Refrigerators, Fans, Receivers, and more.

---

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs/) directory. See [`docs/README.md`](./docs/README.md) for a complete index.

### Quick Links:

- [Requirements Specification](./docs/requirements/SRS.md)
- [Design Specification](./docs/design/SDS.md)
- [Architecture Blueprint](./docs/design/ARCHITECTURE_BLUEPRINT.md)
- [API Contract](./docs/api/API_CONTRACT.md)
- [Coding Standards](./docs/standards/CODING_STANDARDS.md)
- [CI/CD Guide](./docs/deployment/CI_CD.md)
- [Project Roadmap](./docs/project-management/ROADMAP.md)

---

## 🚀 Technology Stack

- **Frontend:** Next.js (App Router), JavaScript (ES6+)
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas with Mongoose ODM
- **Validation:** Zod
- **Authorization:** RBAC (Role-Based Access Control)
- **Styling:** Styled-components
- **Animations:** Framer Motion (optional)

---

## 📋 Project Status

**Version:** 2.0  
**Status:** MVP-Ready  
**Date:** 2025-01-02

---

## 👥 User Roles

- **Manager (Gestionnaire):** Full system access
- **Cashier (Caissier):** Sales operations and read-only access

---

## 🌐 Language Requirements

- **UI Language:** All user-facing text (labels, buttons, errors, placeholders) must be in **French**
- **Technical Documentation:** All technical text (code, comments, API documentation) must be in **English**

---

## 📖 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/store-management-system.git
   cd store-management-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your MongoDB connection string and JWT secret.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Development Workflow

1. Review the [Requirements Specification](./docs/requirements/SRS.md)
2. Understand the [Architecture Blueprint](./docs/design/ARCHITECTURE_BLUEPRINT.md)
3. Follow the [Coding Standards](./docs/standards/CODING_STANDARDS.md)
4. Reference the [API Contract](./docs/api/API_CONTRACT.md) during development

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 📊 Project Status

**Current Phase:** Phase 1 - Project Setup ✅  
**Version:** 0.1.0 (Phase 1 Complete)  
**Last Updated:** 2025-01-11

See [PROJECT_STATUS_REPORT.md](./PROJECT_STATUS_REPORT.md) for detailed status.
