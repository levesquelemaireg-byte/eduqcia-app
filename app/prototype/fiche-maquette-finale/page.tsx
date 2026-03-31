import type { Metadata } from "next";
import { MaquetteFicheFinaleTailwind } from "@/components/prototype/maquette/MaquetteFicheFinaleTailwind";

/**
 * Fiche remplie — reproduction Tailwind de la maquette (`maquette/fiche-maquette-finale.html`).
 * HTML statique : `public/maquette/fiche-maquette-finale.html` (inchangé, hors iframe).
 */
export const metadata: Metadata = {
  title: "Fiche TAÉ — maquette finale (Tailwind)",
  robots: { index: false, follow: false },
};

export default function FicheMaquetteFinalePage() {
  return (
    <main className="min-h-full bg-surface px-4 py-8 text-deep md:px-6">
      <MaquetteFicheFinaleTailwind />
    </main>
  );
}
