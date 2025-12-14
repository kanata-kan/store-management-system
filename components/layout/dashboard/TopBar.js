/**
 * Dashboard Top Bar
 *
 * Server Component that renders the top bar with page title and user information.
 * Displays current page context and logout functionality.
 */

import styled from "styled-components";
import { theme } from "@/styles/theme.js";
import TopBarClient from "./TopBarClient.js";

/**
 * TopBar Server Component
 * Passes user data to client component
 */
export default function TopBar({ user }) {
  return <TopBarClient user={user} />;
}

