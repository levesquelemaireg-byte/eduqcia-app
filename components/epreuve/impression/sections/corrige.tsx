/**
 * SectionCorrige — affiche le corrigé HTML + outil d'évaluation avec
 * réponses attendues.
 *
 * Layout (spec §4.2 + §9.2) : hanging indent — le numéro de question
 * est fixe à gauche, le corrigé indenté à droite. L'énoncé du
 * comportement attendu n'est jamais affiché (metadata enseignant).
 *
 * Spacing (spec §4) : 18pt entre le corrigé et la grille d'évaluation
 * via `margin-bottom` sur le hanging indent.
 *
 * Invariants : Arial, noir, pas de décoration.
 */

import DOMPurify from "isomorphic-dompurify";
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

const STYLE_HANGING: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline", // alignement baseline numéro / 1re ligne consigne
  gap: "6px",
  marginBottom: "14pt", // Phase 8b correction 5 : 18pt → 14pt
};

const STYLE_NUMERO: React.CSSProperties = {
  fontSize: "11pt",
  fontWeight: 400, // poids normal — pas en gras (Phase 8b correction 1)
  flexShrink: 0,
  marginTop: 0,
};

const STYLE_COLONNE_CONTENU: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

export function SectionCorrige({ contenu }: SectionCorrigeProps) {
  const { tacheIndex, corrige, outilEvaluation } = contenu;

  return (
    <div className="bloc-corrige" style={STYLE_BASE}>
      <div style={STYLE_HANGING}>
        <span style={STYLE_NUMERO}>{tacheIndex + 1}.</span>
        <div
          style={{ ...STYLE_COLONNE_CONTENU, fontSize: "11pt", lineHeight: 1.35 }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(corrige) }}
        />
      </div>

      {/* Grille d'évaluation — HORS du hanging indent (pleine largeur). */}
      <SectionOutilEvaluation outilEvaluation={outilEvaluation} />
    </div>
  );
}
