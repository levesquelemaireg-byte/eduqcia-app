/**
 * SectionCorrige — affiche le corrige HTML + outil d'evaluation avec reponses attendues.
 *
 * Invariants : Arial, noir, pas de decoration.
 */

import type { ContenuCorrige } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { SectionOutilEvaluation } from "./outil-evaluation";

export type SectionCorrigeProps = {
  contenu: ContenuCorrige;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  marginBottom: "12px",
};

export function SectionCorrige({ contenu }: SectionCorrigeProps) {
  const { tacheIndex, titre, corrige, outilEvaluation } = contenu;

  return (
    <div className="bloc-corrige" style={STYLE_BASE}>
      {/* Titre */}
      <p
        style={{
          fontSize: "11pt",
          fontWeight: 700,
          marginBottom: "6px",
          marginTop: 0,
        }}
      >
        Corrige — {titre || `Question ${tacheIndex + 1}`}
      </p>

      {/* Corrige HTML */}
      <div
        style={{ fontSize: "11pt", lineHeight: 1.5 }}
        dangerouslySetInnerHTML={{ __html: corrige }}
      />

      {/* Outil d'evaluation avec reponses attendues */}
      <SectionOutilEvaluation outilEvaluation={outilEvaluation} />
    </div>
  );
}
