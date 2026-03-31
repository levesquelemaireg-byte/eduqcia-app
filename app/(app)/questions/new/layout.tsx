import type { ReactNode } from "react";

/**
 * Pleine largeur utile du `main` (compense le padding global de `AppShellClient`) pour le split-screen
 * wizard — deux colonnes nettes, sans rétrécissement artificiel.
 * Marges négatives **verticales** alignées sur `main.main--app` (`p-4` / `md:p-6`) : sans elles, le fond
 * global du shell (`bg-bg`) reste visible en bandes haut/bas.
 */
export default function NewQuestionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-panel)] -mx-4 -mt-4 -mb-4 md:-mx-6 md:-mt-6 md:-mb-6">
      {children}
    </div>
  );
}
