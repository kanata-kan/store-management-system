/**
 * Dashboard Sidebar
 *
 * Server Component that renders the navigation sidebar for the dashboard.
 * Displays navigation links for all manager dashboard pages.
 * Includes active state highlighting and responsive collapse functionality.
 */

import SidebarClient from "./SidebarClient.js";

/**
 * Sidebar Server Component
 * Passes user data to client component for navigation
 */
export default function Sidebar({ user }) {
  return <SidebarClient user={user} />;
}

