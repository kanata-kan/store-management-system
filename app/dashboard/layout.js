/**
 * Dashboard Layout
 *
 * Server Component that provides the main layout for all dashboard pages.
 * Handles authentication and authorization checks server-side.
 * Includes Sidebar navigation and TopBar with user information.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthService from "@/lib/services/AuthService.js";
import { Sidebar, TopBar, DashboardLayoutClient } from "@/components/layout/dashboard";

export default async function DashboardLayout({ children }) {
  // DEVELOPMENT MODE: Skip authentication if SKIP_AUTH is enabled
  // ⚠️ WARNING: This should NEVER be enabled in production!
  const SKIP_AUTH = process.env.SKIP_AUTH === "true";

  let user = null;

  if (SKIP_AUTH) {
    // Development mode: Use mock user
    // ⚠️ SECURITY WARNING: Authentication is disabled!
    console.warn(
      "⚠️ [DEVELOPMENT MODE] Authentication is DISABLED! This should NEVER be enabled in production!"
    );
    user = {
      id: "dev-user-id",
      name: "Developer User",
      email: "dev@example.com",
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } else {
    // Production mode: Normal authentication check
    // Get session token from cookies (server-side)
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("session_token");

    // Check authentication server-side
    if (tokenCookie?.value) {
      try {
        user = await AuthService.getUserFromSession(tokenCookie.value);
      } catch (error) {
        // Invalid or expired token - ignore it
        // The cookie will be cleared by the logout route handler if user explicitly logs out
        // For now, we just ignore invalid tokens and redirect to login
        // Invalid or expired token, user remains null
        user = null;
      }
    }

    // Redirect to login if not authenticated
    if (!user) {
      redirect("/login");
    }

    // Validate user object
    if (!user.role) {
      // Invalid user object - redirect to login
      redirect("/login");
    }

    // Redirect to cashier panel if user is not a manager
    if (user.role !== "manager") {
      redirect("/cashier");
    }
  }

  return (
    <DashboardLayoutClient
      sidebar={<Sidebar user={user} />}
      topBar={<TopBar user={user} />}
    >
      {children}
    </DashboardLayoutClient>
  );
}

