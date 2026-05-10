/**
 * SectionQuadruplet — bloc atomique insécable du PDF.
 *
 * Type guard sur `consigne` (spec §3.3) :
 * - `string` (rédactionnel) : consigne → guidage → espace production → grille
 * - `FragmentsNR` (NR)     : intro → guidage → corps → reponse → grille
 *
 * Pour les NR, `SectionEspaceProduction` n'est PAS appelé : la zone réponse
 * vit dans `consigne.reponse` (ou `consigne.corps` quand les cases sont
 * intégrées au dispositif visuel — manifestations, causes-conséquences,
 * carte-historique 2.3).
 *
 * Layout (spec §4.2 — hanging indent + §9.2 — titre = numéro) :
 * - Le numéro de question (« 1. », « 2. », …) est fixe à gauche,
 *   `flex-shrink: 0`. L'énoncé du comportement attendu n'est JAMAIS
 *   visible par l'élève — c'est un metadata enseignant.
 * - Tout le contenu (consigne, guidage, zone d'options, espace réponse)
 *   vit dans la colonne indentée à droite.
 * - La grille d'évaluation est HORS du hanging indent (pleine largeur).
 *
 * Spacing (spec §4 — convention `margin-bottom`, jamais `margin-top`) :
 * - 18pt entre le dernier élément du contenu (espace réponse / fragment
 *   NR) et la grille d'évaluation.
 *
 * Sécabilité (spec §4.8) : un quadruplet ne peut jamais être coupé sur
 * deux pages — `break-inside: avoid` sur `.bloc-quadruplet`.
 */

import DOMPurify from "isomorphic-dompurify";
import type { ContenuQuadruplet } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { FragmentsNR } from "@/lib/impression/extraire-fragments-nr";
import type { Guidage } from "@/lib/tache/contrats/donnees";
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

const STYLE_CONSIGNE: React.CSSProperties = { fontSize: "11pt", lineHeight: 1.5 };

/** Hanging indent : numéro fixe + colonne contenu indentée (spec §4.2). */
const STYLE_HANGING: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  marginBottom: "18pt", // espace avant la grille (spec §4)
};

const STYLE_NUMERO: React.CSSProperties = {
  fontSize: "11pt",
  fontWeight: 500,
  flexShrink: 0,
  marginTop: 0,
};

const STYLE_COLONNE_CONTENU: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

/** Bloc HTML inline sécurisé via DOMPurify. */
function HtmlBloc({ html, style }: { html: string; style?: React.CSSProperties }) {
  return <div style={style} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}

/** Guidage stylé via `.bloc-guidage` (italique + couleur secondaire, spec §4.1). */
function BlocGuidage({ guidage }: { guidage: Guidage }) {
  if (!guidage) return null;
  return (
    <div
      className="bloc-guidage"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(guidage.content) }}
    />
  );
}

export function SectionQuadruplet({ contenu }: SectionQuadrupletProps) {
  const { tacheIndex, consigne, guidage, espaceProduction, outilEvaluation } = contenu;

  return (
    <div className="bloc-quadruplet" style={STYLE_BASE}>
      <div style={STYLE_HANGING}>
        <span style={STYLE_NUMERO}>{tacheIndex + 1}.</span>
        <div style={STYLE_COLONNE_CONTENU}>
          {typeof consigne === "string" ? (
            <BrancheRedactionnelle
              consigne={consigne}
              guidage={guidage}
              espaceProduction={espaceProduction}
            />
          ) : (
            <BrancheNR fragments={consigne} guidage={guidage} />
          )}
        </div>
      </div>

      {/* Grille d'évaluation — HORS du hanging indent (pleine largeur, centrée). */}
      <SectionOutilEvaluation outilEvaluation={outilEvaluation} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Branche rédactionnelle                                                    */
/* -------------------------------------------------------------------------- */

function BrancheRedactionnelle({
  consigne,
  guidage,
  espaceProduction,
}: {
  consigne: string;
  guidage: Guidage;
  espaceProduction: ContenuQuadruplet["espaceProduction"];
}) {
  return (
    <>
      <HtmlBloc html={consigne} style={STYLE_CONSIGNE} />
      <BlocGuidage guidage={guidage} />
      {espaceProduction && <SectionEspaceProduction espaceProduction={espaceProduction} />}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Branche NR — guidage entre intro et corps (spec §3.3)                     */
/* -------------------------------------------------------------------------- */

/**
 * Le wrapper recomposé porte l'attribut `data-{parcours}="true"` original
 * pour préserver le scoping CSS (les règles `.{parcours}-eleve-*` dans
 * `globals.css` sont scopées par cet attribut). Le renderer reste agnostique
 * de la valeur du parcours — c'est un passthrough technique.
 */
function BrancheNR({ fragments, guidage }: { fragments: FragmentsNR; guidage: Guidage }) {
  // Convention builders : `<div data-{parcours}="true" class="{parcours}-root">`.
  // On reproduit le wrapper original pour préserver l'intégralité du scoping CSS.
  const wrapperAttrs = { [`data-${fragments.parcours}`]: "true" };
  const wrapperClass = `${fragments.parcours}-root`;
  return (
    <div {...wrapperAttrs} className={wrapperClass} style={STYLE_CONSIGNE}>
      {fragments.intro && <HtmlBloc html={fragments.intro} />}
      <BlocGuidage guidage={guidage} />
      {fragments.corps && <HtmlBloc html={fragments.corps} />}
      {fragments.reponse && <HtmlBloc html={fragments.reponse} />}
    </div>
  );
}
