import type { ReactNode } from "react";

type SectionRailProps = {
  titre: string;
  children: ReactNode;
  /** Première section : pas de border-top ni de padding-top. */
  estPremiere?: boolean;
};

/**
 * Section du rail latéral — titre uppercase + contenu.
 * Le rail est une colonne structurelle sans fond distinct.
 */
export function SectionRail({ titre, children, estPremiere }: SectionRailProps) {
  return (
    <div className={estPremiere ? "pb-3" : "border-b border-border/50 py-3 last:border-b-0"}>
      <h4 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">
        {titre}
      </h4>
      <div>{children}</div>
    </div>
  );
}

type RailLayoutProps = {
  children: ReactNode;
};

/**
 * Conteneur du rail — empile les SectionRail avec séparation.
 */
export function RailLayout({ children }: RailLayoutProps) {
  return <div className="space-y-0">{children}</div>;
}
