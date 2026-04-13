import type { ReactNode } from "react";

type Props = {
  /** Colonne gauche — flux principal (FluxLecture). */
  children: ReactNode;
  /** Colonne droite (desktop) / au-dessus (tablet/mobile) — rail de métadonnées. */
  rail: ReactNode;
};

/**
 * Layout responsive de la vue détaillée tâche.
 *
 * - Desktop ≥1024px : grid 2 colonnes (flux 1fr + rail 280px), gap 40px, max-width 1080px.
 * - Tablet 768-1023px : 1 colonne, rail au-dessus du flux (non sticky), margin-bottom 32px.
 * - Mobile <768px : 1 colonne, padding 16px, rail au-dessus (rendu en accordéon par TacheRail).
 */
export function TacheVueDetailleeLayout({ children, rail }: Props) {
  return (
    <div className="mx-auto max-w-[1080px] px-4 py-6 md:px-6 md:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 print:block print:max-w-none print:px-0 print:py-0">
      {/* Rail — rendu au-dessus du flux en tablet/mobile, en colonne droite en desktop */}
      <div className="mb-8 lg:order-2 lg:mb-0">{rail}</div>
      <main className="min-w-0 lg:order-1">{children}</main>
    </div>
  );
}
