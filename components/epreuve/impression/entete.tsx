/**
 * En-tete d'epreuve — repete sur chaque page du PDF.
 * Hauteur plafonnee a 80 px (D6, print-engine v2.1).
 *
 * Rendu austere : Arial, noir, pas de decoration.
 * Ne connait pas la pagination — recoit `numeroPage` / `totalPages` en props.
 */

import type { EnTeteEpreuve } from "@/lib/epreuve/contrats/donnees";
import { HEADER_HEIGHT_PX } from "@/lib/epreuve/pagination/constantes";

export type EnTeteImpressionProps = {
  enTete: EnTeteEpreuve;
  numeroPage: number;
  totalPages: number;
};

export function EnTeteImpression({ enTete, numeroPage, totalPages }: EnTeteImpressionProps) {
  const metaSegments: string[] = [];
  if (enTete.ecole) metaSegments.push(enTete.ecole);
  if (enTete.niveau) metaSegments.push(enTete.niveau);
  if (enTete.groupe) metaSegments.push(enTete.groupe);
  if (enTete.date) metaSegments.push(enTete.date);

  return (
    <header
      style={{
        maxHeight: `${HEADER_HEIGHT_PX}px`,
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
        color: "#000",
        borderBottom: "1.5pt solid #000",
        paddingBottom: "6px",
        marginBottom: "10px",
      }}
    >
      {/* Ligne 1 : titre + pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontSize: "13pt",
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {enTete.titre}
        </span>
        <span
          style={{
            fontSize: "9pt",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: "1em",
          }}
        >
          Page {numeroPage} / {totalPages}
        </span>
      </div>

      {/* Ligne 2 : enseignant + meta optionnelle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: "10pt",
          lineHeight: 1.35,
          marginTop: "2px",
        }}
      >
        <span>{enTete.enseignant}</span>
        {metaSegments.length > 0 && (
          <span
            style={{
              textAlign: "right",
              flexShrink: 0,
              marginLeft: "1em",
            }}
          >
            {metaSegments.join(" \u2014 ")}
          </span>
        )}
      </div>
    </header>
  );
}
