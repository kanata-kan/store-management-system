/**
 * New User Page
 *
 * Server Component that renders UserCreatePage.
 */

import UserCreatePage from "@/components/domain/user/UserCreatePage";

export default function NewUserPage() {
  // No data fetching required for users create form
  return <UserCreatePage />;
}

