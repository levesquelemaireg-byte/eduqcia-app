/**
 * SectionOutilEvaluation — tableau criteres x niveaux de performance.
 *
 * Style austere : bordures noires, Arial, pas de decoration.
 * Invariant §0.4 : Arial uniquement, noir uniquement.
 */

import type { OutilEvaluation, Critere } from "@/lib/tache/contrats/donnees";

export type SectionOutilEvaluationProps = {
  outilEvaluation: OutilEvaluation;
};

const CELL_STYLE: React.CSSProperties = {
  border: "1pt solid #000",
  padding: "4px 6px",
  fontSize: "9pt",
  lineHeight: 1.35,
  verticalAlign: "top",
};

const HEADER_CELL_STYLE: React.CSSProperties = {
  ...CELL_STYLE,
  fontWeight: 700,
  textAlign: "center",
  fontSize: "9pt",
};

export function SectionOutilEvaluation({ outilEvaluation }: SectionOutilEvaluationProps) {
  const { criteres } = outilEvaluation;
  if (criteres.length === 0) return null;

  // Extraire les niveaux depuis le premier critere (tous partagent les memes niveaux)
  const niveaux = criteres[0].descripteurs.map((d) => d.niveau);

  return (
    <div className="bloc-outil-evaluation" style={{ marginTop: "8px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
          color: "#000",
        }}
      >
        <thead>
          <tr>
            <th style={{ ...HEADER_CELL_STYLE, textAlign: "left" }}>Critere</th>
            {niveaux.map((niveau) => (
              <th key={niveau} style={HEADER_CELL_STYLE}>
                {niveau}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteres.map((critere: Critere, i: number) => (
            <tr key={i}>
              <td style={{ ...CELL_STYLE, fontWeight: 600 }}>{critere.libelle}</td>
              {critere.descripteurs.map((desc, j) => (
                <td key={j} style={CELL_STYLE}>
                  {desc.description}
                  {desc.points > 0 && (
                    <span style={{ display: "block", fontSize: "8pt", marginTop: "2px" }}>
                      ({desc.points} pt{desc.points > 1 ? "s" : ""})
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
