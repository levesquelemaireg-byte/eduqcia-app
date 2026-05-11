/**
 * SectionEspaceProduction — zone de réponse rédactionnelle (lignes vierges).
 *
 * Phase 1 a posé `espaceProduction: null` pour tous les parcours NR (les
 * cases vivent dans la consigne via `FragmentsNR`). Seul le variant
 * `"lignes"` est en circulation — d'où la simplification au seul cas
 * `LignesVierges`.
 *
 * Phase 5 lot 3 : prop `corrigeTexte` — si non-null, positionne le texte
 * de la réponse attendue en rouge italique sur les lignes vierges
 * (overlay corrigé simple, spec §3.5 / §7.5). Zéro décalage du gabarit
 * de lignes : la version corrigée est empilable pixel-perfect sur la
 * version élève.
 *
 * Invariants : Arial, noir (texte élève), pas de décoration.
 */

import type { EspaceProduction } from "@/lib/tache/contrats/donnees";
import { PRINT_CORRIGE_COLOR } from "@/styles/impression/tokens";

export type SectionEspaceProductionProps = {
  espaceProduction: EspaceProduction;
  /** HTML ou texte du corrigé — positionné en rouge italique sur les lignes. */
  corrigeTexte?: string | null;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  marginTop: "8px",
};

const STYLE_LIGNE: React.CSSProperties = {
  position: "relative",
  borderBottom: "0.5pt solid #000",
  height: "24px",
  width: "100%",
};

const STYLE_CORRIGE: React.CSSProperties = {
  position: "absolute",
  bottom: "4px",
  left: 0,
  fontSize: "13px",
  color: PRINT_CORRIGE_COLOR,
  fontStyle: "italic",
};

/** Largeur cible (en caractères) pour découper le corrigé en lignes. */
const CORRIGE_MAX_CHARS_PAR_LIGNE = 85;

/**
 * Strip les balises et entités HTML pour obtenir du texte brut, puis
 * découpe en lignes de longueur ~`maxChars` en respectant les frontières
 * de mots et les sauts de paragraphe explicites.
 */
function decouperCorrigeEnLignes(html: string, maxChars: number): string[] {
  // Préserve les frontières de paragraphes en remplaçant `</p>` par `\n`.
  const normalise = html
    .replace(/<\/(p|li|div|br)[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  const lignes: string[] = [];
  for (const paragraphe of normalise.split("\n")) {
    const texte = paragraphe.replace(/\s+/g, " ").trim();
    if (!texte) continue;
    let courante = "";
    for (const mot of texte.split(" ")) {
      if (courante.length + mot.length + 1 > maxChars && courante.length > 0) {
        lignes.push(courante);
        courante = mot;
      } else {
        courante = courante ? `${courante} ${mot}` : mot;
      }
    }
    if (courante) lignes.push(courante);
  }
  return lignes;
}

/** Lignes vierges pour réponse rédactionnelle, avec corrigé optionnel. */
function LignesVierges({
  nbLignes,
  corrigeTexte,
}: {
  nbLignes: number;
  corrigeTexte: string | null;
}) {
  const lignesCorrige = corrigeTexte
    ? decouperCorrigeEnLignes(corrigeTexte, CORRIGE_MAX_CHARS_PAR_LIGNE)
    : [];
  return (
    <div style={STYLE_BASE}>
      {Array.from({ length: nbLignes }, (_, i) => {
        const texte = lignesCorrige[i];
        return (
          <div key={i} style={STYLE_LIGNE}>
            {texte && <span style={STYLE_CORRIGE}>{texte}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function SectionEspaceProduction({
  espaceProduction,
  corrigeTexte = null,
}: SectionEspaceProductionProps) {
  // Seul le variant `lignes` est en circulation depuis Phase 1.
  return <LignesVierges nbLignes={espaceProduction.nbLignes} corrigeTexte={corrigeTexte} />;
}
