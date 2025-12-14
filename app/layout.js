import StyledComponentsRegistry from "@/components/StyledComponentsRegistry.js";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper.js";

export const metadata = {
  title: "Store Management System",
  description: "Inventory Management System for Home Appliances Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
