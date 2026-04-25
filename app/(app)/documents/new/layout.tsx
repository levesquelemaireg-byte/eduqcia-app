import type { ReactNode } from "react";

/** Enveloppe split wizard pleine largeur — fond panneau, prend toute la hauteur disponible du `<main>`. */
export default function NewDocumentLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-(--color-panel)">{children}</div>;
}
