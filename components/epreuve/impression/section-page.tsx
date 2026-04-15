/**
 * SectionPage — wrapper d'une page physique du PDF.
 *
 * Responsabilites :
 * - Injecte l'en-tete d'epreuve (`EnTeteImpression`) en haut de chaque page.
 * - Impose les dimensions Letter portrait (816 x 1056 px a 96 dpi).
 * - Les blocs enfants occupent l'espace restant (`MAX_CONTENT_HEIGHT_PX`).
 *
 * Seul composant qui connait `EnTeteEpreuve`. Les blocs de contenu
 * (document, quadruplet, corrige, etc.) l'ignorent totalement.
 */

import type { ReactNode } from "react";
import type { EnTeteEpreuve } from "@/lib/epreuve/contrats/donnees";
import {
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  MAX_CONTENT_HEIGHT_PX,
} from "@/lib/epreuve/pagination/constantes";
import { EnTeteImpression } from "./entete";

export type SectionPageProps = {
  enTete: EnTeteEpreuve;
  numeroPage: number;
  totalPages: number;
  children: ReactNode;
};

export function SectionPage({ enTete, numeroPage, totalPages, children }: SectionPageProps) {
  return (
    <section
      className="page"
      style={{
        boxSizing: "border-box",
        width: `${PAGE_WIDTH_PX}px`,
        height: `${PAGE_HEIGHT_PX}px`,
        /* ~2 cm de marge de chaque cote — aligne sur --tae-print-sheet-padding */
        padding: "2cm",
        fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
        fontSize: "11pt",
        lineHeight: 1.5,
        color: "#000",
        background: "#fff",
        overflow: "hidden",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      <EnTeteImpression enTete={enTete} numeroPage={numeroPage} totalPages={totalPages} />

      <div
        className="page-content"
        style={{
          maxHeight: `${MAX_CONTENT_HEIGHT_PX}px`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </section>
  );
}
