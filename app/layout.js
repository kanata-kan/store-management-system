export const metadata = {
  title: "Store Management System",
  description: "Inventory Management System for Home Appliances Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
