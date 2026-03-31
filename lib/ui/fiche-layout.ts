/**
 * Mise en page fiche (maquette lecture / sommaire) — alignement titres § corps.
 * DESIGN-SYSTEM : pas de hex ; espacements cohérents avec `gap-2` des titres h3.
 */

/** Contenu sous le libellé de section : aligné après icône 1em + gap-2 (0.5rem). */
export const FICHE_SECTION_BODY_INSET = "pl-[calc(1em+0.5rem)]";

/** Ligne de titre h3 des sections corps fiche. */
export const FICHE_SECTION_TITLE_CLASS =
  "mb-[0.65rem] flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent";

/** Padding horizontal des blocs sous l’en-tête P0. */
export const FICHE_BODY_SECTION_PX = "px-5";

/** Espacement vertical uniforme au-dessus du titre (1re section ou après hairline interne). */
export const FICHE_BODY_SECTION_PT = "pt-4";

/** Padding bas d’un bloc section corps. */
export const FICHE_BODY_SECTION_PB = "pb-4";

/**
 * Filets hairline — retrait uniforme vers l’intérieur de la zone (même valeur partout).
 * Horizontaux : `mx-2` ; verticaux : `top-2 bottom-2` sur le trait 1px (échelle Tailwind `2` = 0,5rem).
 */
export const FICHE_HAIRLINE_RULE = "mx-2 h-px shrink-0 bg-border";

/** Même retrait que `FICHE_HAIRLINE_RULE` mais pour un séparateur vertical. */
export const FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET = "top-2 bottom-2";
