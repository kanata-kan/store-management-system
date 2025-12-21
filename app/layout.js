import StyledComponentsRegistry from "@/components/StyledComponentsRegistry.js";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper.js";

export const metadata = {
  title: "Abidin Électroménager - Système de Gestion",
  description: "Système de gestion de stock pour magasin d'électroménager - Abidin Électroménager",
  icons: {
    icon: [{ url: "/assets/logo/abidin-logo.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/assets/logo/abidin-logo.png", sizes: "180x180" }],
  },
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
