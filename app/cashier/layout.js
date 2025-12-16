/**
 * Cashier Layout
 *
 * Server Component that provides the main layout for all cashier pages.
 * Handles authentication and authorization checks server-side.
 * Includes simple header with user info and minimal navigation.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthService from "@/lib/services/AuthService.js";
import CashierLayoutClient from "./CashierLayoutClient.js";
import CashierHeader from "./CashierHeader.js";
import CashierNavigation from "./CashierNavigation.js";

export default async function CashierLayout({ children }) {
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
      name: "Developer Cashier",
      email: "cashier@example.com",
      role: "cashier",
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
        // Invalid or expired token, user remains null
        user = null;
      }
    }

    // Redirect to login if not authenticated
    if (!user) {
      redirect("/login");
    }

    // Redirect to dashboard if user is not a cashier or manager
    if (user.role !== "cashier" && user.role !== "manager") {
      redirect("/dashboard");
    }
  }

  return (
    <CashierLayoutClient
      header={<CashierHeader user={user} />}
      navigation={<CashierNavigation />}
    >
      {children}
    </CashierLayoutClient>
  );
}

