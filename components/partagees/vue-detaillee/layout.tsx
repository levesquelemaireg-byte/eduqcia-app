"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  layout: "sidebar" | "stacked";
  barreActions: ReactNode;
  header: ReactNode;
  onglets: ReactNode;
  contenuPrincipal: ReactNode;
  rail: ReactNode;
};

/**
 * Layout partagé pour les vues détaillées Document / Tâche / Épreuve.
 * En `sidebar` : grid 2 colonnes (contenu + rail 300px sticky).
 * En `stacked` : 1 colonne, rail empilé sous le contenu.
 * Passe automatiquement de sidebar à stacked sous le breakpoint `lg`.
 */
export function VueDetailleeLayout({
  layout,
  barreActions,
  header,
  onglets,
  contenuPrincipal,
  rail,
}: Props) {
  const estSidebar = layout === "sidebar";

  return (
    <div className="min-h-0 w-full">
      {/* Barre d'actions */}
      {barreActions}

      {/* Header + onglets */}
      <div className={cn("mx-auto w-full", estSidebar ? "max-w-6xl px-6" : "px-4")}>
        <div className="py-4">{header}</div>
        {onglets}
      </div>

      {/* Contenu principal + rail */}
      <div className={cn("mx-auto w-full", estSidebar ? "max-w-6xl px-6" : "px-4")}>
        <div
          className={cn(
            "py-5",
            estSidebar ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]" : "flex flex-col gap-6",
          )}
        >
          {/* Contenu principal */}
          <div className="min-w-0">{contenuPrincipal}</div>

          {/* Rail */}
          <aside
            className={cn(
              estSidebar
                ? "hidden border-l border-border pl-6 lg:block lg:sticky lg:top-[var(--topbar-height)] lg:self-start"
                : "border-t border-border pt-5",
            )}
          >
            {rail}
          </aside>

          {/* Rail empilé sous le contenu sur mobile en mode sidebar */}
          {estSidebar && <aside className="border-t border-border pt-5 lg:hidden">{rail}</aside>}
        </div>
      </div>
    </div>
  );
}
