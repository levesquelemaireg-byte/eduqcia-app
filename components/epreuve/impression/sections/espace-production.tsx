/**
 * SectionEspaceProduction — zone de reponse de l'eleve dans le PDF.
 *
 * Rendu selon le type :
 * - 'lignes' : lignes vierges (nbLignes)
 * - 'cases'  : cases A/B/C/D
 * - 'libre'  : zone libre encadree
 *
 * Invariants : Arial, noir, pas de decoration.
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

/** Lignes vierges pour reponse redactionnelle. */
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

/** Cases A/B/C/D pour OI1 ordre chronologique. */
function CasesReponse({ options }: { options: string[] }) {
  return (
    <div style={{ ...STYLE_BASE, display: "flex", gap: "12px" }}>
      {options.map((option) => (
        <div
          key={option}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              border: "1pt solid #000",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11pt" }}>{option}</span>
        </div>
      ))}
    </div>
  );
}

/** Zone libre encadree. */
function ZoneLibre() {
  return (
    <div
      style={{
        ...STYLE_BASE,
        border: "0.5pt solid #000",
        minHeight: "80px",
        width: "100%",
      }}
    />
  );
}

export function SectionEspaceProduction({ espaceProduction }: SectionEspaceProductionProps) {
  switch (espaceProduction.type) {
    case "lignes":
      return <LignesVierges nbLignes={espaceProduction.nbLignes} />;
    case "cases":
      return <CasesReponse options={espaceProduction.options} />;
    case "libre":
      return <ZoneLibre />;
  }
}
