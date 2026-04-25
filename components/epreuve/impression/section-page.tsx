/**
 * SectionPage — wrapper d'une page physique du PDF.
 *
 * Responsabilités :
 * - Impose les dimensions Letter portrait (816 × 1056 px à 96 dpi).
 * - Positionne l'en-tête d'épreuve dans la marge haute de 2 cm
 *   (`position: absolute`).
 * - Positionne la pagination « Page X / Y » dans la marge basse de 2 cm.
 * - Les blocs enfants occupent toute la zone de contenu (`MAX_CONTENT_HEIGHT_PX`),
 *   sans en-tête en flow.
 *
 * Seul composant qui connaît `EnTeteEpreuve` et la pagination courante.
 * Les blocs de contenu (document, quadruplet, etc.) les ignorent totalement.
 *
 * Pour les tâches seules et documents seuls, `enTete` est `null` :
 * pas d'en-tête haut ; la pagination basse n'est rendue que si l'en-tête
 * est présent (cohérent avec l'usage actuel).
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
  enTete: EnTeteEpreuve | null;
  numeroPage: number;
  totalPages: number;
  children: ReactNode;
};

const MARGE_PAGE = "2cm";

export function SectionPage({ enTete, numeroPage, totalPages, children }: SectionPageProps) {
  return (
    <section
      className="page"
      data-page-impression
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: `${PAGE_WIDTH_PX}px`,
        height: `${PAGE_HEIGHT_PX}px`,
        padding: MARGE_PAGE,
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
      {enTete && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: MARGE_PAGE,
            right: MARGE_PAGE,
            height: MARGE_PAGE,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingBottom: "4px",
          }}
        >
          <EnTeteImpression enTete={enTete} />
        </div>
      )}

      <div
        className="page-content"
        style={{
          maxHeight: `${MAX_CONTENT_HEIGHT_PX}px`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {enTete && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: MARGE_PAGE,
            right: MARGE_PAGE,
            height: MARGE_PAGE,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            paddingTop: "4px",
            fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
            fontSize: "8pt",
            color: "#000",
          }}
        >
          Page {numeroPage} / {totalPages}
        </div>
      )}
    </section>
  );
}
