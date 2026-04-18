/**
 * SectionQuadruplet — bloc atomique insecable du PDF.
 *
 * Affiche dans l'ordre : consigne (HTML), guidage (si non null),
 * espace de production, outil d'evaluation.
 *
 * Invariant §0.2 : le quadruplet ne peut jamais etre coupe sur deux pages.
 * Le CSS `break-inside: avoid` est applique via la classe `.bloc-quadruplet`.
 *
 * Invariants : Arial, noir, pas de decoration.
 */

import DOMPurify from "isomorphic-dompurify";
import type { ContenuQuadruplet } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { SectionEspaceProduction } from "./espace-production";
import { SectionOutilEvaluation } from "./outil-evaluation";

export type SectionQuadrupletProps = {
  contenu: ContenuQuadruplet;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  marginBottom: "12px",
};

export function SectionQuadruplet({ contenu }: SectionQuadrupletProps) {
  const { tacheIndex, titre, consigne, guidage, espaceProduction, outilEvaluation } = contenu;

  return (
    <div className="bloc-quadruplet" style={STYLE_BASE}>
      {/* Titre de la tache */}
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

      {/* Consigne (HTML) */}
      <div
        style={{ fontSize: "11pt", lineHeight: 1.5 }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(consigne) }}
      />

      {/* Guidage (optionnel — visible en formatif, masque sinon) */}
      {guidage && (
        <div
          style={{
            fontSize: "10pt",
            lineHeight: 1.4,
            marginTop: "6px",
            paddingLeft: "12px",
            borderLeft: "2pt solid #000",
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(guidage.content) }}
        />
      )}

      {/* Espace de production */}
      <SectionEspaceProduction espaceProduction={espaceProduction} />

      {/* Outil d'evaluation */}
      <SectionOutilEvaluation outilEvaluation={outilEvaluation} />
    </div>
  );
}
