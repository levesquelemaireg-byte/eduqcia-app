/**
 * Maquette DEV — assemblage de consigne OI 3.5 (Montrer différences / similitudes).
 * Hors wizard : logique pure pour itérer sur libellés et options.
 * La consigne ne reprend pas les numéros / références du document d’origine : uniquement A, B, C (slots app).
 */

export type Oi35Nature = "acteurs" | "historiens";

/** Un seul PDF avec trois extraits vs trois documents distincts — même contrat technique (3 lignes documents_new). */
export type Oi35Structure = "grouped" | "separate";

export type Oi35Bloc3MockupInput = {
  nature: Oi35Nature;
  structure: Oi35Structure;
  /** Sujet central (ex. la capitulation de Montréal). */
  enjeu: string;
  /** Repère temporel libre (ex. « en 1760 », « au XIXe siècle ») — inséré tel quel après l’enjeu. */
  repere: string;
};

type NatureFragments = {
  troisPointsDeVueDe: string;
  chacunUnPointDeVueDe: string;
  nommez: string;
  deuxAutres: string;
};

function natureFragments(nature: Oi35Nature): NatureFragments {
  if (nature === "acteurs") {
    return {
      troisPointsDeVueDe: "trois points de vue d'acteurs",
      chacunUnPointDeVueDe: "un point de vue d'acteurs",
      nommez: "l'acteur",
      deuxAutres: "des deux autres acteurs",
    };
  }
  return {
    troisPointsDeVueDe: "trois points de vue d'historiens",
    chacunUnPointDeVueDe: "un point de vue d'historiens",
    nommez: "l'historien",
    deuxAutres: "des deux autres historiens",
  };
}

function trimPart(s: string): string {
  const t = s.trim();
  return t.length ? ` ${t}` : "";
}

/** Amorce documentaire (texte brut) — toujours en termes documents A, B, C. */
export function buildOi35IntroPlain(input: Oi35Bloc3MockupInput): string {
  const g = natureFragments(input.nature);
  const enjeu = input.enjeu.trim();
  const repere = trimPart(input.repere);
  const sujet = enjeu || "…";

  if (input.structure === "separate") {
    return `Les documents A, B et C présentent chacun ${g.chacunUnPointDeVueDe} sur ${sujet}${repere}.`;
  }

  return `${g.troisPointsDeVueDe.charAt(0).toUpperCase()}${g.troisPointsDeVueDe.slice(1)} sur ${sujet}${repere} sont présentés dans les documents A, B et C.`;
}

/** Suite fixe de la consigne (texte brut). */
export function buildOi35BodyPlain(input: Oi35Bloc3MockupInput): string {
  const g = natureFragments(input.nature);
  return `Nommez ${g.nommez} qui présente un point de vue différent. Puis, comparez ce point de vue à celui ${g.deuxAutres}.`;
}

export function buildOi35FullPlain(input: Oi35Bloc3MockupInput): string {
  return `${buildOi35IntroPlain(input)} ${buildOi35BodyPlain(input)}`;
}

const DOC_REF_SPAN_CLASS =
  "inline-flex min-w-[1.25rem] items-center justify-center rounded border border-accent/40 bg-accent/10 px-1 font-semibold text-accent";

function docRefSpan(letter: "A" | "B" | "C"): string {
  return `<span class="${DOC_REF_SPAN_CLASS}" data-doc-ref="${letter}">{{doc_${letter}}}</span>`;
}

/**
 * HTML proche du rendu TipTap (spans `data-doc-ref`) pour la partie « documents A, B et C ».
 */
export function buildOi35IntroHtml(input: Oi35Bloc3MockupInput): string {
  const g = natureFragments(input.nature);
  const enjeu = input.enjeu.trim() || "…";
  const repere = trimPart(input.repere);
  const abc = `${docRefSpan("A")}, ${docRefSpan("B")} et ${docRefSpan("C")}`;

  if (input.structure === "separate") {
    return `<p>Les documents ${abc} présentent chacun ${g.chacunUnPointDeVueDe} sur ${enjeu}${repere}.</p>`;
  }

  return `<p>${g.troisPointsDeVueDe.charAt(0).toUpperCase()}${g.troisPointsDeVueDe.slice(1)} sur ${enjeu}${repere} sont présentés dans les documents ${abc}.</p>`;
}

export function buildOi35BodyHtml(input: Oi35Bloc3MockupInput): string {
  const g = natureFragments(input.nature);
  return `<p>Nommez ${g.nommez} qui présente un point de vue différent. Puis, comparez ce point de vue à celui ${g.deuxAutres}.</p>`;
}

export function buildOi35FullHtml(input: Oi35Bloc3MockupInput): string {
  return `${buildOi35IntroHtml(input)}${buildOi35BodyHtml(input)}`;
}

/** Résumé technique pour la maquette (aligné nb_documents = 3). */
export function buildOi35TechnicalSummary(input: Oi35Bloc3MockupInput): {
  documentsNewCount: 3;
  slots: readonly { slotId: string; newIndex: number; note: string }[];
} {
  const groupedNote =
    input.structure === "grouped"
      ? "Trois extraits (une même source côté enseignant) ; fiche élève : A, B, C."
      : "Trois documents saisis séparément ; fiche élève : A, B, C.";

  return {
    documentsNewCount: 3,
    slots: [
      { slotId: "doc_A", newIndex: 0, note: `${groupedNote} Index 0.` },
      { slotId: "doc_B", newIndex: 1, note: `${groupedNote} Index 1.` },
      { slotId: "doc_C", newIndex: 2, note: `${groupedNote} Index 2.` },
    ],
  };
}
