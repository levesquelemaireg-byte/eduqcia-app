import type { ReactNode } from "react";
import { grilleTextWithLockedParenGroups } from "@/components/tae/grilles/grille-text-nodes";

/**
 * Sauts de ligne OI3_SO5 — alignés sur le PNG ministériel / `maquette/grilles-preview.html`.
 * Largeurs (**84 + 106 + 420 + 50 px** = 660, **4 col.** dont points) : `eval-grid.module.css`.
 * Si le référentiel change : ajuster ici (une seule source pour ce barème).
 */
export const OI3_SO5_CONDITION_LINES = [
  "L’élève nomme",
  "correctement l’acteur",
  "qui présente une",
  "position différente",
] as const;

/** Cellule critère + colonne points : texte sur une ligne (PNG). */
export const OI3_SO5_ROW_DETAIL_1 = "et présente correctement les deux positions." as const;

/** Palier 2 points — une phrase (pas de `<br />` artificiel après « et »). */
export const OI3_SO5_ROW_DETAIL_2 =
  "et présente correctement une position et plus ou moins correctement l’autre position." as const;

/** Bloc 1 point : quatre bandes visuelles comme sur le PNG. */
export function Oi3So5RowDetail3Content(): ReactNode {
  return (
    <>
      et présente plus ou moins correctement les deux positions.
      <br />
      <strong>ou</strong>
      <br />
      et présente correctement une position et
      <br />
      incorrectement l’autre position ou ne la présente pas.
    </>
  );
}

/** Palier 0 point — une seule ligne (pas de `<br />` dans la 3ᵉ colonne). */
export const OI3_SO5_ROW_DETAIL_4 =
  "et présente tout au plus une seule position plus ou moins correctement." as const;

export const OI3_SO5_FOOTER_LINES =
  "L’élève nomme incorrectement l’acteur qui présente une position différente ou ne le nomme pas." as const;

export function Oi3So5Lines({ lines }: { lines: readonly string[] }): ReactNode {
  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 ? <br /> : null}
      {grilleTextWithLockedParenGroups(line)}
    </span>
  ));
}
