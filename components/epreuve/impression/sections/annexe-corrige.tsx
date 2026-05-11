/**
 * SectionAnnexeCorrige — page annexe « Notes du correcteur » du corrigé
 * détaillé (spec §7.5).
 *
 * Le corrigé détaillé empile :
 *   1. La version élève + overlay corrigé simple (rouge sur les fragments)
 *   2. Cette annexe en fin de feuillet questionnaire — un bloc titre suivi
 *      d'un bloc par question avec la réponse attendue (tache.corrige).
 *
 * Style sobre — Arial 11pt, noir, pas de rouge. C'est un document
 * enseignant, pas un overlay sur la feuille élève.
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Contenu d'un bloc annexe — soit le titre de l'annexe, soit une question.
 *
 * Discrimination par `type` pour permettre au pager de paginer
 * naturellement (le titre tient avec la première question si la place le
 * permet, sinon il bascule sur la page suivante).
 */
export type ContenuAnnexeCorrige =
  | { type: "titre" }
  | { type: "question"; tacheIndex: number; corrige: string };

export type SectionAnnexeCorrigeProps = {
  contenu: ContenuAnnexeCorrige;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  fontSize: "11pt",
  lineHeight: 1.35,
};

const STYLE_TITRE: React.CSSProperties = {
  ...STYLE_BASE,
  fontSize: "14pt",
  fontWeight: 600,
  margin: "0 0 16pt 0",
};

const STYLE_HANGING: React.CSSProperties = {
  ...STYLE_BASE,
  display: "flex",
  alignItems: "baseline",
  gap: "6px",
  marginBottom: "14pt",
};

const STYLE_NUMERO: React.CSSProperties = {
  fontSize: "11pt",
  fontWeight: 400,
  flexShrink: 0,
};

const STYLE_COLONNE: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const STYLE_LABEL: React.CSSProperties = {
  fontWeight: 600,
  marginRight: "0.35em",
};

/** Titre de page « Notes du correcteur ». */
function TitreAnnexe() {
  return <h2 style={STYLE_TITRE}>Notes du correcteur</h2>;
}

/** Une entrée de l'annexe : numéro + réponse attendue. */
function QuestionAnnexe({ tacheIndex, corrige }: { tacheIndex: number; corrige: string }) {
  return (
    <div style={STYLE_HANGING}>
      <span style={STYLE_NUMERO}>{tacheIndex + 1}.</span>
      <div style={STYLE_COLONNE}>
        <span style={STYLE_LABEL}>Réponse attendue :</span>
        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(corrige) }} />
      </div>
    </div>
  );
}

export function SectionAnnexeCorrige({ contenu }: SectionAnnexeCorrigeProps) {
  if (contenu.type === "titre") return <TitreAnnexe />;
  return <QuestionAnnexe tacheIndex={contenu.tacheIndex} corrige={contenu.corrige} />;
}
