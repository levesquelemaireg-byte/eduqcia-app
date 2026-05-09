/**
 * SectionCahierReponses — bloc du cahier de réponses (mode épreuve
 * ministérielle, spec §7.4).
 *
 * Chaque bloc rend :
 * - le numéro / titre de la tâche
 * - la zone réponse (lignes vierges, cases A/B/C/D, ou cases catégories
 *   selon `espaceProduction.type`)
 * - la grille d'évaluation (présente AUSSI dans le questionnaire — la
 *   grille apparaît aux deux endroits, par décision spec §7.4)
 *
 * Pas de consigne (l'élève consulte le questionnaire pour le texte).
 *
 * Résout Bug 7 : auparavant les blocs cahier-réponses ne contenaient pas
 * `outilEvaluation` et le type guard du renderer retournait `null`.
 */

import type { ContenuCahierReponses } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { SectionEspaceProduction } from "./espace-production";
import { SectionOutilEvaluation } from "./outil-evaluation";

export type SectionCahierReponsesProps = {
  contenu: ContenuCahierReponses;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  marginBottom: "12px",
};

export function SectionCahierReponses({ contenu }: SectionCahierReponsesProps) {
  const { tacheIndex, titre, espaceProduction, outilEvaluation } = contenu;

  return (
    <div className="bloc-quadruplet" style={STYLE_BASE}>
      <p
        style={{
          fontSize: "11pt",
          fontWeight: 700,
          marginBottom: "6px",
          marginTop: 0,
        }}
      >
        {titre || `Question ${tacheIndex + 1}`}
      </p>

      {espaceProduction && <SectionEspaceProduction espaceProduction={espaceProduction} />}
      <SectionOutilEvaluation outilEvaluation={outilEvaluation} />
    </div>
  );
}
