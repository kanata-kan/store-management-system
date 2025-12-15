/**
 * Edit User Page
 *
 * Server Component that renders UserEditPage with user ID.
 */

import UserEditPage from "@/components/domain/user/UserEditPage";

export default function EditUserPage({ params }) {
  const { id } = params;

  return <UserEditPage userId={id} />;
}

