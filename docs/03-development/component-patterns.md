# 🎨 Component Patterns

> أنماط البرمجة للمكونات في React

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Intermediate

---

## 🎯 الهدف

هذا الدليل يشرح كيفية كتابة مكونات React بطريقة احترافية ومتسقة.

---

## 📐 Component Hierarchy

```
Generic Components (components/ui/)
    ↓ used by
Domain Components (components/domain/)
    ↓ used by
Page Components (app/*/page.js)
```

---

## 🎨 Generic UI Components

### Pattern: Simple Generic Component

```javascript
// components/ui/Button.js
"use client";

import styled from "styled-components";

/**
 * Button Component
 * Generic reusable button
 */
export const Button = styled.button`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  /* Theme-based styling */
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.motion.duration.fast} 
              ${props => props.theme.motion.easing.easeOut};
  
  /* Variant styles */
  ${props => props.$variant === "primary" && `
    background-color: ${props.theme.colors.primary};
    color: ${props.theme.colors.white};
    
    &:hover {
      background-color: ${props.theme.colors.primaryDark};
    }
  `}
  
  ${props => props.$variant === "secondary" && `
    background-color: ${props.theme.colors.secondary};
    color: ${props.theme.colors.white};
    
    &:hover {
      background-color: ${props.theme.colors.secondaryDark};
    }
  `}
  
  ${props => props.$variant === "danger" && `
    background-color: ${props.theme.colors.danger};
    color: ${props.theme.colors.white};
    
    &:hover {
      background-color: ${props.theme.colors.dangerDark};
    }
  `}
  
  /* Size variants */
  ${props => props.$size === "sm" && `
    padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
    font-size: ${props.theme.typography.fontSize.sm};
  `}
  
  ${props => props.$size === "lg" && `
    padding: ${props.theme.spacing.lg} ${props.theme.spacing.xl};
    font-size: ${props.theme.typography.fontSize.lg};
  `}
  
  /* States */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Default props
Button.defaultProps = {
  $variant: "primary",
  $size: "md",
  type: "button",
};
```

**Usage:**
```javascript
<Button onClick={handleClick}>Sauvegarder</Button>
<Button $variant="secondary">Annuler</Button>
<Button $variant="danger" $size="sm">Supprimer</Button>
```

---

## 🏢 Domain Components

### Pattern: Server Component (Default)

```javascript
// app/dashboard/products/page.js
import { fetchWithCookies } from "@/lib/utils/fetch";
import ProductTable from "@/components/domain/product/ProductTable";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Products Page
 * Server Component - fetches data
 */
export default async function ProductsPage({ searchParams }) {
  // 1. Fetch data server-side
  const response = await fetchWithCookies(
    `/api/products?page=${searchParams.page || 1}&limit=10`
  );
  
  // 2. Pass data to client component
  return (
    <div>
      <PageHeader title="Produits" />
      <ProductTable 
        initialData={response.data}
        pagination={response.pagination}
      />
    </div>
  );
}
```

### Pattern: Client Component (Interactive)

```javascript
// components/domain/product/ProductForm.js
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/**
 * ProductForm Component
 * Client Component - user interaction
 */
export default function ProductForm({ onSubmit, initialData = null }) {
  // 1. Local state
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      brandId: "",
      salePrice: "",
      purchasePrice: "",
      stock: "",
    }
  );
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // 2. Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // 3. API call (no business logic!)
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (result.error?.details) {
          const newErrors = {};
          result.error.details.forEach(err => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
        } else {
          alert(result.error?.message || "Erreur");
        }
        return;
      }
      
      // 4. Success callback
      onSubmit?.(result.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };
  
  // 5. Render
  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nom du produit"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      
      <Input
        label="Prix d'achat"
        name="purchasePrice"
        type="number"
        value={formData.purchasePrice}
        onChange={handleChange}
        error={errors.purchasePrice}
        required
      />
      
      <Input
        label="Prix de vente"
        name="salePrice"
        type="number"
        value={formData.salePrice}
        onChange={handleChange}
        error={errors.salePrice}
        required
      />
      
      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Sauvegarder"}
      </Button>
    </form>
  );
}
```

---

## 🎯 Component Best Practices

### 1. Server Components First

```javascript
// ✅ CORRECT: Server Component (default)
// app/dashboard/products/page.js
export default async function ProductsPage() {
  const products = await fetchWithCookies("/api/products");
  return <ProductTable products={products} />;
}

// ✅ CORRECT: Client Component (when needed)
// components/domain/product/ProductForm.js
"use client";
export default function ProductForm() {
  const [state, setState] = useState();
  // ... interactive logic
}
```

### 2. Use Theme Tokens

```javascript
// ✅ CORRECT: Theme tokens
const Card = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
`;

// ❌ WRONG: Hard-coded values
const Card = styled.div`
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;
```

### 3. Prop Naming

```javascript
// ✅ CORRECT: Transient props for styled-components
<Button $variant="primary" $size="lg">
  Sauvegarder
</Button>

// ❌ WRONG: Regular props (passed to DOM)
<Button variant="primary" size="lg">
  Sauvegarder
</Button>
```

### 4. Component Documentation

```javascript
/**
 * ProductTable Component
 * Displays products in a table with sorting, filtering, and pagination
 * 
 * @param {Array} products - Array of product objects
 * @param {Object} pagination - Pagination info { page, limit, total, pages }
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 */
export default function ProductTable({ 
  products, 
  pagination, 
  onEdit, 
  onDelete 
}) {
  // ...
}
```

---

## 🧩 Complex Component Pattern

### Multi-File Component Structure

```
components/domain/product/ProductForm/
├── index.js                    # Main component
├── ProductFormFields.js        # Form fields
├── ProductFormActions.js       # Submit/Cancel buttons
├── useProductForm.js           # Custom hook
└── ProductForm.styles.js       # Styled components
```

**index.js:**
```javascript
"use client";

import ProductFormFields from "./ProductFormFields";
import ProductFormActions from "./ProductFormActions";
import useProductForm from "./useProductForm";
import { FormContainer } from "./ProductForm.styles";

export default function ProductForm({ onSubmit, initialData }) {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  } = useProductForm(onSubmit, initialData);
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <ProductFormFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />
      <ProductFormActions loading={loading} />
    </FormContainer>
  );
}
```

**useProductForm.js:**
```javascript
import { useState } from "react";

export default function useProductForm(onSubmit, initialData) {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // ... submit logic
  };
  
  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}
```

---

## 🎨 Styling Patterns

### Co-located Styles

```javascript
// ProductCard.js
"use client";

import styled from "styled-components";

const Card = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

export default function ProductCard({ product }) {
  return (
    <Card>
      <Title>{product.name}</Title>
      {/* ... */}
    </Card>
  );
}
```

---

## 🔄 Data Fetching Patterns

### Client-Side Fetching (SWR/React Query)

```javascript
"use client";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then(r => r.json());

export default function ProductList() {
  const { data, error, mutate } = useSWR("/api/products", fetcher);
  
  if (error) return <div>Erreur de chargement</div>;
  if (!data) return <div>Chargement...</div>;
  
  return (
    <div>
      {data.data.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### Server-Side Fetching

```javascript
// Server Component
import { fetchWithCookies } from "@/lib/utils/fetch";

export default async function ProductsPage() {
  const response = await fetchWithCookies("/api/products");
  
  return <ProductTable products={response.data} />;
}
```

---

## 🎯 Component Composition

### Compound Components

```javascript
// Table.js
export const Table = ({ children }) => <table>{children}</table>;
export const TableHeader = ({ children }) => <thead>{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ children }) => <tr>{children}</tr>;
export const TableCell = ({ children }) => <td>{children}</td>;

// Usage
<Table>
  <TableHeader>
    <TableRow>
      <TableCell>Nom</TableCell>
      <TableCell>Prix</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {products.map(p => (
      <TableRow key={p._id}>
        <TableCell>{p.name}</TableCell>
        <TableCell>{p.price}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Business Logic in Component

```javascript
// ❌ WRONG
function ProductCard({ product }) {
  const isLowStock = product.stock <= product.lowStockThreshold;
  const profit = product.salePrice - product.purchasePrice;
  // Business logic in UI!
}

// ✅ CORRECT
function ProductCard({ product }) {
  // Backend calculates these
  const { isLowStock, profit } = product;
}
```

### ❌ Mistake 2: Using "use client" Unnecessarily

```javascript
// ❌ WRONG: Doesn't need interactivity
"use client";
export default function ProductList({ products }) {
  return products.map(p => <div>{p.name}</div>);
}

// ✅ CORRECT: Server Component
export default function ProductList({ products }) {
  return products.map(p => <div>{p.name}</div>);
}
```

### ❌ Mistake 3: Hard-Coded Styles

```javascript
// ❌ WRONG
const Button = styled.button`
  color: #2563eb;
  padding: 12px 24px;
`;

// ✅ CORRECT
const Button = styled.button`
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
`;
```

---

## 🔗 Related

- [Project Structure](project-structure.md) - Where components live
- [Coding Standards](coding-standards.md) - Code style guide
- [UI/UX Guide](../07-ui-ux/design-system.md) - Design system

---

**Status:** ✅ Reference Guide  
**Priority:** High  
**Last Updated:** 2025-12-20

