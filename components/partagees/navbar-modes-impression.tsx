"use client";

/**
 * NavbarModesImpression — navbar des modes d'impression dans les vues
 * détaillées (tâche + épreuve).
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §7 (modes), §8 (UI),
 * §12 Phase 6, §13 règle 6 (mode jamais hardcodé — vient du state UI).
 *
 * Deux groupes de pill buttons indépendants :
 * - Groupe « Mode d'impression » : Formatif · Sommatif standard ·
 *   [Épreuve ministérielle uniquement pour entite="epreuve"]
 * - Groupe « Corrigé » : Sans corrigé · Corrigé simple · Corrigé détaillé
 *
 * Pour Phase 6, « Corrigé simple » et « Corrigé détaillé » mappent tous
 * deux vers `estCorrige=true` (le rendu différencié arrive en Phase 5).
 * On expose le sous-mode au parent (`onCorrigeChange`) pour qu'il puisse
 * conserver la sélection précise et brancher Phase 5 sans changer l'UI.
 */

import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  NAVBAR_IMPRESSION_CORRIGE_DETAILLE,
  NAVBAR_IMPRESSION_CORRIGE_GROUPE_LABEL,
  NAVBAR_IMPRESSION_CORRIGE_SANS,
  NAVBAR_IMPRESSION_CORRIGE_SIMPLE,
  NAVBAR_IMPRESSION_MODE_EPREUVE_MINISTERIELLE,
  NAVBAR_IMPRESSION_MODE_FORMATIF,
  NAVBAR_IMPRESSION_MODE_GROUPE_LABEL,
  NAVBAR_IMPRESSION_MODE_SOMMATIF_STANDARD,
} from "@/lib/ui/ui-copy";

/**
 * Sélection corrigé exposée au parent. Pour Phase 6 : `simple` et `detaille`
 * mappent tous deux vers `estCorrige=true` côté payload, mais on conserve la
 * distinction en state pour brancher Phase 5 sans toucher l'UI.
 */
export type OptionCorrige = "aucun" | "simple" | "detaille";

export type NavbarModesImpressionProps = {
  entite: "tache" | "epreuve";
  mode: ModeImpression;
  optionCorrige: OptionCorrige;
  surChangerMode: (mode: ModeImpression) => void;
  surChangerCorrige: (option: OptionCorrige) => void;
  /** Classes additionnelles sur le wrapper. */
  className?: string;
};

const MODE_OPTIONS_TACHE = [
  { value: "formatif" as const, label: NAVBAR_IMPRESSION_MODE_FORMATIF },
  { value: "sommatif-standard" as const, label: NAVBAR_IMPRESSION_MODE_SOMMATIF_STANDARD },
];

const MODE_OPTIONS_EPREUVE = [
  ...MODE_OPTIONS_TACHE,
  {
    value: "epreuve-ministerielle" as const,
    label: NAVBAR_IMPRESSION_MODE_EPREUVE_MINISTERIELLE,
  },
];

const CORRIGE_OPTIONS = [
  { value: "aucun" as const, label: NAVBAR_IMPRESSION_CORRIGE_SANS },
  { value: "simple" as const, label: NAVBAR_IMPRESSION_CORRIGE_SIMPLE },
  { value: "detaille" as const, label: NAVBAR_IMPRESSION_CORRIGE_DETAILLE },
];

export function NavbarModesImpression({
  entite,
  mode,
  optionCorrige,
  surChangerMode,
  surChangerCorrige,
  className,
}: NavbarModesImpressionProps) {
  const modeOptions = entite === "epreuve" ? MODE_OPTIONS_EPREUVE : MODE_OPTIONS_TACHE;

  // Pas de wrapper visuel (border/bg/padding) — la navbar s'insère dans la
  // barre supérieure existante (slot `actions` du composant `Onglets`).
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className ?? ""}`}>
      <SegmentedControl
        aria-label={NAVBAR_IMPRESSION_MODE_GROUPE_LABEL}
        options={modeOptions}
        value={mode}
        onChange={(v) => surChangerMode(v as ModeImpression)}
      />
      <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />
      <SegmentedControl
        aria-label={NAVBAR_IMPRESSION_CORRIGE_GROUPE_LABEL}
        options={CORRIGE_OPTIONS}
        value={optionCorrige}
        onChange={(v) => surChangerCorrige(v as OptionCorrige)}
      />
    </div>
  );
}
