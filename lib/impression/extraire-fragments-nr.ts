/**
 * Extraction des fragments d'une consigne non-rédactionnelle (NR) — couche
 * transformation du pipeline d'impression.
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §3.1 (type FragmentsNR),
 * §3.2 (contrat mapper vs transformation), §3.4 (FragmentsNR n'est PAS
 * stocké en DB — dérivé à la volée).
 *
 * Décision architecturale : `tache.consigne` reste un `string` (HTML brut)
 * en base. Cette fonction parse le HTML produit par les 6 builders NR et le
 * découpe en 3 fragments (intro / corps / reponse). Le découpage repose sur
 * les classes CSS uniques par parcours — contrat builder→extracteur stable.
 *
 * Approche A retenue (cf. spec §3.4) : parsing positionnel sur classes
 * uniques + restriction de balise (`<div` pour la zone réponse) afin
 * d'exclure les `<span class="…reponse">` inline (cas carte-historique 2.3).
 */

/* -------------------------------------------------------------------------- */
/*  Type public                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Découpage d'une consigne NR en 3 fragments — consommé par le renderer
 * impression pour insérer le guidage entre `intro` et `corps`.
 *
 * `parcours` est l'attribut `data-{parcours}` du wrapper d'origine
 * (ex. `"ordre-chrono-eleve"`). Le renderer le réapplique sur le wrapper
 * recomposé pour préserver le scoping CSS — les règles `.{parcours}-grid`,
 * etc. dans `globals.css` sont scopées par `[data-{parcours}="true"]`.
 * Cette information est purement technique (scoping) et ne pilote AUCUNE
 * logique de rendu — le renderer reste agnostique du parcours, conformément
 * à spec §3.4 (« pas de discriminant kind »).
 *
 * `reponse` est `null` quand les cases sont intégrées dans `corps`
 * (manifestations, causes-conséquences, carte-historique 2.3 — voir
 * spec §5.5, §5.6, §5.4).
 */
export type FragmentsNR = {
  parcours: string;
  intro: string;
  corps: string;
  reponse: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Configuration par parcours                                                */
/* -------------------------------------------------------------------------- */

type ParcoursConfig = {
  /** Classes CSS qui marquent le début du « corps » (dispositif visuel). */
  corpsClasses: string[];
  /** Classe CSS du bloc réponse, ou `null` si pas de réponse séparée. */
  reponseClass: string | null;
};

const PARCOURS_CONFIG: Record<string, ParcoursConfig> = {
  "ordre-chrono-eleve": {
    corpsClasses: ["ordre-chrono-eleve-grid"],
    reponseClass: "ordre-chrono-eleve-reponse",
  },
  "ligne-temps-eleve": {
    corpsClasses: ["ligne-temps-frise"],
    reponseClass: "ligne-temps-eleve-reponse",
  },
  "avant-apres-eleve": {
    corpsClasses: ["avant-apres-eleve-table"],
    reponseClass: "avant-apres-eleve-reponse",
  },
  "carte-historique-eleve": {
    // 2.1 n'a pas de corps (fall-through géré). 2.2 = table, 2.3 = items (ul).
    corpsClasses: ["carte-historique-eleve-table", "carte-historique-eleve-items"],
    // 2.3 met la réponse en <span> inline → restriction <div> ci-dessous l'exclut
    // naturellement, donc reponse = null pour 2.3 (cases dans corps).
    reponseClass: "carte-historique-eleve-reponse",
  },
  "manifestations-eleve": {
    corpsClasses: ["manifestations-eleve-grille"],
    reponseClass: null,
  },
  "causes-consequences-eleve": {
    corpsClasses: ["causes-consequences-eleve-grille"],
    reponseClass: null,
  },
};

/* -------------------------------------------------------------------------- */
/*  Détection du parcours                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Détecte le parcours NR via l'attribut `data-{parcours}-eleve="true"` du
 * wrapper. Retourne `null` si la consigne est rédactionnelle (TipTap) ou
 * malformée.
 */
export function detecterParcoursNR(consigneHtml: string): string | null {
  if (!consigneHtml) return null;
  for (const parcours of Object.keys(PARCOURS_CONFIG)) {
    if (consigneHtml.includes(`data-${parcours}="true"`)) return parcours;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers de parsing                                                        */
/* -------------------------------------------------------------------------- */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip le wrapper `<div data-{parcours}-eleve="true" …>…</div>` et retourne
 * le contenu interne. Si le wrapper est absent ou malformé, retourne le HTML
 * tel quel.
 */
function stripWrapper(html: string, parcours: string): string {
  const re = new RegExp(
    `^\\s*<div[^>]*\\bdata-${escapeRegex(parcours)}="true"[^>]*>([\\s\\S]*)</div>\\s*$`,
    "i",
  );
  const match = html.match(re);
  return match ? match[1] : html;
}

/**
 * Cherche la position de la balise ouvrante d'un élément dont la `class`
 * contient exactement `className` (avec frontières correctes — exclut
 * `className-suffix` et `prefix-className`).
 *
 * Le paramètre `tag` permet de restreindre la balise (ex. `"div"` pour
 * exclure les `<span class="…reponse">` inline de carte-historique 2.3).
 *
 * Retourne `-1` si non trouvé.
 */
function findPositionByClass(inner: string, className: string, tag = "[a-z]+"): number {
  const cls = escapeRegex(className);
  // class="…" où la valeur est exactement {className}, ou {className} entouré d'espaces.
  // Le `(?:[^"]*\\s)?` impose qu'avant {className}, on ait soit le début de la valeur
  // de class, soit une frontière espace. Le `(?=[\\s"])` impose qu'après, on ait soit
  // un espace, soit la fin de la valeur (guillemet fermant).
  const re = new RegExp(`<${tag}\\b[^>]*\\bclass="(?:[^"]*\\s)?${cls}(?=[\\s"])[^"]*"`, "i");
  const match = inner.match(re);
  return match ? (match.index ?? -1) : -1;
}

/* -------------------------------------------------------------------------- */
/*  Fonction principale                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Parse le HTML d'une consigne NR et le découpe en `FragmentsNR`.
 *
 * Retourne `null` si la consigne n'est pas un NR reconnu — le caller doit
 * dans ce cas conserver la consigne string telle quelle (chemin
 * rédactionnel).
 *
 * Le HTML d'entrée est supposé déjà avoir traversé `resoudreReferencesDocuments`
 * (les jetons `{{doc_X}}` sont déjà résolus en numéros).
 */
export function extraireFragmentsNR(consigneHtml: string): FragmentsNR | null {
  const parcours = detecterParcoursNR(consigneHtml);
  if (!parcours) return null;

  const config = PARCOURS_CONFIG[parcours];
  const inner = stripWrapper(consigneHtml, parcours).trim();

  // Position du début du corps (premier élément avec une classe « corps »).
  let corpsStart = -1;
  for (const cls of config.corpsClasses) {
    const pos = findPositionByClass(inner, cls);
    if (pos !== -1 && (corpsStart === -1 || pos < corpsStart)) {
      corpsStart = pos;
    }
  }

  // Position du début de la zone réponse (uniquement <div>, pas <span>).
  // Restriction au tag `div` : exclut naturellement les <span class="…reponse">
  // inline dans <li> (cas carte-historique 2.3 — cf. spec §5.4).
  const reponseStart =
    config.reponseClass !== null ? findPositionByClass(inner, config.reponseClass, "div") : -1;

  // Cas 1 : pas de corps trouvé (carte-historique 2.1 — intro + question + reponse).
  if (corpsStart === -1) {
    if (reponseStart !== -1) {
      return {
        parcours,
        intro: inner.substring(0, reponseStart).trim(),
        corps: "",
        reponse: inner.substring(reponseStart).trim(),
      };
    }
    return { parcours, intro: inner.trim(), corps: "", reponse: null };
  }

  const intro = inner.substring(0, corpsStart).trim();

  // Cas 2 : corps + reponse séparée (ordre-chrono, ligne-temps, avant-apres,
  // carte-historique 2.2).
  if (reponseStart !== -1 && reponseStart > corpsStart) {
    return {
      parcours,
      intro,
      corps: inner.substring(corpsStart, reponseStart).trim(),
      reponse: inner.substring(reponseStart).trim(),
    };
  }

  // Cas 3 : pas de reponse séparée (manifestations, causes-conséquences,
  // carte-historique 2.3 — cases intégrées au corps).
  return {
    parcours,
    intro,
    corps: inner.substring(corpsStart).trim(),
    reponse: null,
  };
}
