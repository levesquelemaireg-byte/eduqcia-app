import type { ReactNode } from "react";
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
