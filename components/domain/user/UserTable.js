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
import { Table, TableHeader, TableActionButtons } from "@/components/ui/table";
import { slideUp, smoothTransition } from "@/components/motion";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("all")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.borderLight};
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
  border-radius: ${(props) => props.theme.borderRadius.full};
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
  box-shadow: ${(props) => props.theme.shadows.sm};
`;


const SuspendedBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  background-color: ${(props) => props.theme.colors.errorLight};
  color: ${(props) => props.theme.colors.error};
  box-shadow: ${(props) => props.theme.shadows.sm};
  margin-right: ${(props) => props.theme.spacing.sm};
`;

import { formatDate } from "@/lib/utils/dateFormatters.js";

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
 * @param {Function} props.onSuspend - Suspend handler (userId: string, isSuspended: boolean) => void
 */
export default function UserTable({
  users,
  currentSortBy,
  currentSortOrder,
  onEdit,
  onDelete,
  onSuspend,
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <RoleBadge $role={user.role}>
                    {formatRole(user.role)}
                  </RoleBadge>
                  {user.isSuspended && (
                    <SuspendedBadge>Suspendu</SuspendedBadge>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell $align="center">
                <TableActionButtons
                  onEdit={() => onEdit && onEdit(userId)}
                  onDelete={() => onDelete && onDelete(userId, user.name)}
                  onSuspend={user.role === "cashier" ? () => onSuspend && onSuspend(userId, !user.isSuspended) : undefined}
                  isSuspended={user.isSuspended}
                  align="center"
                />
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}

