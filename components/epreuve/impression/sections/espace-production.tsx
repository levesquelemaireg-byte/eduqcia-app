/**
 * SectionEspaceProduction — zone de réponse rédactionnelle (lignes vierges).
 *
 * Phase 1 a posé `espaceProduction: null` pour tous les parcours NR (les
 * cases vivent dans la consigne via `FragmentsNR`). Seul le variant
 * `"lignes"` est en circulation — d'où la simplification au seul cas
 * `LignesVierges`.
 *
 * Invariants : Arial, noir, pas de décoration.
 */

import type { EspaceProduction } from "@/lib/tache/contrats/donnees";

export type SectionEspaceProductionProps = {
  espaceProduction: EspaceProduction;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  marginTop: "8px",
};

/** Lignes vierges pour réponse rédactionnelle. */
function LignesVierges({ nbLignes }: { nbLignes: number }) {
  return (
    <div style={STYLE_BASE}>
      {Array.from({ length: nbLignes }, (_, i) => (
        <div
          key={i}
          style={{
            borderBottom: "0.5pt solid #000",
            height: "24px",
            width: "100%",
          }}
        />
      ))}
    </div>
  );
}

export function SectionEspaceProduction({ espaceProduction }: SectionEspaceProductionProps) {
  // Seul le variant `lignes` est en circulation depuis Phase 1.
  return <LignesVierges nbLignes={espaceProduction.nbLignes} />;
}
