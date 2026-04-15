import type { ReactNode } from "react";
import "@/styles/impression.css";

/**
 * Layout minimal pour la route d'aperçu impression.
 * Pas d'AppShell — rendu austère pour Puppeteer et aperçu navigateur.
 */
export default function ApercuLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#fff",
        }}
      >
        {children}
      </body>
    </html>
  );
}
