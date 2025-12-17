/**
 * Centralized Icon System
 *
 * All icons must go through this component.
 * NEVER import lucide-react icons directly in components.
 */

"use client";

import {
  LayoutGrid,
  Package,
  Pencil,
  Trash,
  Plus,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Folder,
  Tag,
  Truck,
  ShoppingCart,
  Bell,
  Loader2,
  Calendar,
  Users,
  Eye,
  EyeOff,
  LogIn,
  TrendingUp,
  Shield,
  ArrowRight,
  Lock,
  Clock,
  AlertCircle,
  // Add more icons as needed
} from "lucide-react";
import styled from "styled-components";

const ICONS = {
  dashboard: LayoutGrid,
  product: Package,
  package: Package,
  edit: Pencil,
  delete: Trash,
  add: Plus,
  search: Search,
  filter: SlidersHorizontal,
  warning: AlertTriangle,
  "alert-triangle": AlertTriangle,
  success: CheckCircle,
  close: X,
  menu: Menu,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  inventory: Warehouse,
  category: Folder,
  brand: Tag,
  supplier: Truck,
  sale: ShoppingCart,
  "shopping-cart": ShoppingCart,
  alert: Bell,
  loader: Loader2,
  calendar: Calendar,
  user: Users,
  eye: Eye,
  "eye-off": EyeOff,
  "log-in": LogIn,
  "trending-up": TrendingUp,
  shield: Shield,
  "arrow-right": ArrowRight,
  lock: Lock,
  clock: Clock,
  "alert-circle": AlertCircle,
  package: Package,
  // Add more icon mappings as needed
};

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => {
    const colorName = props.$color;
    const colorValue = props.theme.colors[colorName];
    return colorValue || props.theme.colors.foreground;
  }};
  width: ${(props) => props.$size};
  height: ${(props) => props.$size};
  ${(props) =>
    props.$spinning &&
    `
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

/**
 * AppIcon Component
 *
 * @param {string} name - Icon name from ICONS mapping
 * @param {string} size - Icon size: "xs" | "sm" | "md" | "lg" | "xl"
 * @param {string} color - Icon color from theme: "primary" | "muted" | "error" | etc.
 * @param {number} strokeWidth - Icon stroke width (default: 2)
 * @param {boolean} spinning - Whether to show spinning animation (for loader icons)
 */
export default function AppIcon({
  name,
  size = "md",
  color = "foreground",
  strokeWidth = 2,
  spinning = false,
}) {
  const IconComponent = ICONS[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in AppIcon mapping`);
    return null;
  }

  const sizeMap = {
    xs: "0.875rem", // 14px
    sm: "1rem", // 16px
    md: "1.125rem", // 18px
    lg: "1.25rem", // 20px
    xl: "1.5rem", // 24px
  };

  const iconSize = sizeMap[size] || sizeMap.md;

  return (
    <IconWrapper $size={iconSize} $color={color} $spinning={spinning}>
      <IconComponent size={iconSize} strokeWidth={strokeWidth} />
    </IconWrapper>
  );
}

