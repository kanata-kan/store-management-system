/**
 * Login Page
 *
 * Server component wrapper for login page.
 * Redirects to dashboard if already authenticated.
 * This ensures authenticated users cannot access login page directly via URL.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthService from "@/lib/services/AuthService.js";
import { LoginPage } from "@/components/auth";

export default async function LoginPageWrapper() {
  // Check if user is already authenticated
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("session_token");

  let user = null;

  // Always check authentication first (even if no cookie)
  if (tokenCookie?.value) {
    try {
      user = await AuthService.getUserFromSession(tokenCookie.value);
    } catch (error) {
      // Invalid or expired token - ignore it
      // The cookie will be cleared by the logout route handler if user explicitly logs out
      // For now, we just ignore invalid tokens and show the login page
      // user remains null - will show login page
    }
  }

  // If user is authenticated and has a valid role, redirect immediately
  // This prevents authenticated users from seeing login page even if they access /login directly
  if (user && user.role) {
    if (user.role === "manager") {
      redirect("/dashboard");
    } else if (user.role === "cashier") {
      redirect("/cashier");
    } else {
      // Default to dashboard for unknown roles
      redirect("/dashboard");
    }
  }

  // No valid session - show login page
  return <LoginPage />;
}

