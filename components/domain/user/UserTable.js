/**
 * User Table Component
 *
 * Client Component for displaying users in table format.
 * Uses reusable Table and TableHeader components.
 * Read-only table with server-side pagination and sorting.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { slideUp, smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("background-color")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
  }
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  white-space: nowrap;
  text-align: ${(props) => props.$align || "left"};
`;

const UserName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const UserEmail = styled.div`
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  background-color: ${(props) =>
    props.$role === "manager"
      ? props.theme.colors.primaryLight
      : props.theme.colors.infoLight};
  color: ${(props) =>
    props.$role === "manager"
      ? props.theme.colors.primary
      : props.theme.colors.info};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;
  justify-content: ${(props) => props.$align || "center"};
`;

const ActionButton = styled.button`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.surface};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  ${smoothTransition("all")}

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.error};

  &:hover {
    background-color: ${(props) => props.theme.colors.error};
    opacity: 0.9;
  }
`;

/**
 * Format date to French locale
 */
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format role to French
 */
function formatRole(role) {
  return role === "manager" ? "Gestionnaire" : "Caissier";
}

/**
 * UserTable Component
 * @param {Object} props
 * @param {Array} props.users - Users array from API
 * @param {string} props.currentSortBy - Current sort field from URL
 * @param {string} props.currentSortOrder - Current sort order from URL
 * @param {Function} props.onEdit - Edit handler (userId: string) => void
 * @param {Function} props.onDelete - Delete handler (userId: string, userName: string) => void
 */
export default function UserTable({
  users,
  currentSortBy,
  currentSortOrder,
  onEdit,
  onDelete,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");
    router.push(`/dashboard/users?${params.toString()}`);
    router.refresh();
  };

  const isEmpty = !users || users.length === 0;

  return (
    <Table
      header={
        <tr>
          <TableHeader
            label="Nom"
            sortKey="name"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="Email"
            sortKey="email"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="Rôle"
            sortKey="role"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="Date de création"
            sortKey="createdAt"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Actions" align="center" />
        </tr>
      }
      isEmpty={isEmpty}
      emptyMessage="Aucun utilisateur trouvé"
    >
      {!isEmpty &&
        users.map((user) => {
          const userId = user.id || user._id;

          return (
            <TableRow key={userId}>
              <TableCell>
                <UserName>{user.name || "-"}</UserName>
              </TableCell>
              <TableCell>
                <UserEmail>{user.email || "-"}</UserEmail>
              </TableCell>
              <TableCell>
                <RoleBadge $role={user.role}>
                  {formatRole(user.role)}
                </RoleBadge>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell $align="center">
                <ActionsCell>
                  <ActionButton
                    type="button"
                    onClick={() => onEdit && onEdit(userId)}
                    title="Modifier l'utilisateur"
                  >
                    <AppIcon name="edit" size="xs" color="surface" />
                    Modifier
                  </ActionButton>
                  <DeleteButton
                    type="button"
                    onClick={() => onDelete && onDelete(userId, user.name)}
                    title="Supprimer l'utilisateur"
                  >
                    <AppIcon name="delete" size="xs" color="surface" />
                    Supprimer
                  </DeleteButton>
                </ActionsCell>
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}

