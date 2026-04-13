import type { ReactNode } from "react";

type Props = {
  /** Colonne gauche — flux principal (FluxLecture). */
  children: ReactNode;
  /** Colonne droite — rail de métadonnées (TacheRail). */
  rail: ReactNode;
};

/**
 * Layout 2 colonnes desktop de la vue détaillée tâche.
 * CSS grid : flux principal (1fr) + rail fixe (280px), gap 40px, max-width 1080px centré.
 * En dessous de 1024px, le grid passe en 1 colonne (responsive Phase 7).
 */
export function TacheVueDetailleeLayout({ children, rail }: Props) {
  return (
    <div className="mx-auto grid max-w-[1080px] grid-cols-[minmax(0,1fr)_280px] gap-10 px-6 py-8">
      <main className="min-w-0">{children}</main>
      {rail}
    </div>
  );
}
