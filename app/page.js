/**
 * Home Page
 * 
 * Professional landing page for Store Management System.
 * Server component wrapper for HomePageClient.
 */

import HomePageClient from "@/components/landing/HomePageClient.js";

export const metadata = {
  title: "Système de Gestion de Magasin",
  description: "Système de gestion d'inventaire pour magasin d'électroménager",
};

export default function HomePage() {
  return <HomePageClient />;
}
