import ThemeProviderWrapper from "@/components/ThemeProviderWrapper.js";

export const metadata = {
  title: "Store Management System",
  description: "Inventory Management System for Home Appliances Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
