/**
 * En-tête d'épreuve — répété sur chaque page du PDF.
 *
 * Positionné dans la marge haute de 2 cm par `SectionPage` (position absolue) ;
 * n'occupe pas d'espace dans la zone de contenu. Rendu austère : Arial, noir,
 * pas de décoration. Ne connaît pas la pagination — la pagination de bas de
 * page est rendue séparément par `SectionPage` dans la marge basse.
 */

import type { EnTeteEpreuve } from "@/lib/epreuve/contrats/donnees";

export type EnTeteImpressionProps = {
  enTete: EnTeteEpreuve;
};

export function EnTeteImpression({ enTete }: EnTeteImpressionProps) {
  const metaSegments: string[] = [];
  if (enTete.ecole) metaSegments.push(enTete.ecole);
  if (enTete.niveau) metaSegments.push(enTete.niveau);
  if (enTete.groupe) metaSegments.push(enTete.groupe);
  if (enTete.date) metaSegments.push(enTete.date);

  return (
    <header
      style={{
        boxSizing: "border-box",
        fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
        color: "#000",
        borderBottom: "1.5pt solid #000",
        paddingBottom: "6px",
      }}
    >
      {/* Ligne 1 : titre */}
      <div
        style={{
          fontSize: "13pt",
          fontWeight: 700,
          lineHeight: 1.25,
        }}
      >
        {enTete.titre}
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
            {metaSegments.join(" — ")}
          </span>
        )}
      </div>
    </header>
  );
}
