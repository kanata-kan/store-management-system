/**
 * Login Page
 *
 * Server component wrapper for login page.
 * Redirects to dashboard if already authenticated.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthService from "@/lib/services/AuthService.js";
import { LoginPage } from "@/components/auth";

export default async function LoginPageWrapper() {
  // Check if user is already authenticated
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("session_token");

  if (tokenCookie?.value) {
    try {
      const user = await AuthService.getUserFromSession(tokenCookie.value);
      
      // Redirect based on role
      if (user.role === "manager") {
        redirect("/dashboard");
      } else if (user.role === "cashier") {
        redirect("/cashier");
      } else {
        redirect("/dashboard");
      }
    } catch (error) {
      // Invalid token, continue to login page
    }
  }

  return <LoginPage />;
}

