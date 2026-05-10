import type { ReactNode } from "react";
// Géométrie de page Letter portrait + `@page` + `@media print` — propres
// au contexte print physique (route `/apercu/[token]` rendue par Puppeteer).
// Les règles `[data-*-eleve]` et `.bloc-guidage` sont chargées au root
// via `styles/impression/index.css` (cf. `app/layout.tsx`).
import "@/styles/impression.css";

/**
 * Layout minimal pour la route d'aperçu impression.
 * Pas d'AppShell — rendu austère pour Puppeteer et aperçu navigateur.
 *
 * Les éléments dev tools Next.js (portal, toasts, build watcher) sont
 * masqués globalement : sinon Puppeteer les capture dans les PNG du carrousel.
 */
export default function ApercuLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <style>{`
          nextjs-portal,
          [data-nextjs-toast],
          [data-nextjs-dialog-overlay],
          [data-nextjs-dev-tools-button],
          [data-nextjs-dev-tools-menu],
          [data-nextjs-scroll-focus-boundary],
          #__next-build-watcher,
          #__next-prerender-indicator {
            display: none !important;
          }
        `}</style>
      </head>
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
