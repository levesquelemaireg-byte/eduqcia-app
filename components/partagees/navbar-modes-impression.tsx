"use client";

/**
 * NavbarModesImpression — pill buttons des modes d'impression dans la
 * modale carrousel d'aperçu (bouton imprimante des vues détaillées).
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §7 (modes), §8 (UI),
 * §13 règle 6 (mode jamais hardcodé — vient du state UI).
 *
 * Structure :
 * - Groupe « Mode » : Formatif · Sommatif standard · [Épreuve ministérielle]
 *   (dernier masqué pour entite="tache"). SegmentedControl en pills
 *   compactes (12px / py-1 / px-2.5).
 * - Séparateur vertical 1px.
 * - Groupe « Corrigé » : 2 pills toggle (Corrigé simple · Corrigé détaillé).
 *   Pas de pill « Sans corrigé » : par défaut aucune des deux n'est active
 *   (= sans corrigé). Cliquer une pill active l'option ; recliquer la pill
 *   active la désélectionne (toggle).
 *
 * Pour Phase 6, « Corrigé simple » et « Corrigé détaillé » mappent tous
 * deux vers `estCorrige=true` côté payload (le rendu différencié arrive
 * en Phase 5). On expose la sélection précise au parent pour qu'il puisse
 * brancher Phase 5 sans changer l'UI.
 */

import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils/cn";
import {
  NAVBAR_IMPRESSION_CORRIGE_DETAILLE,
  NAVBAR_IMPRESSION_CORRIGE_GROUPE_LABEL,
  NAVBAR_IMPRESSION_CORRIGE_SIMPLE,
  NAVBAR_IMPRESSION_MODE_EPREUVE_MINISTERIELLE,
  NAVBAR_IMPRESSION_MODE_FORMATIF,
  NAVBAR_IMPRESSION_MODE_GROUPE_LABEL,
  NAVBAR_IMPRESSION_MODE_SOMMATIF_STANDARD,
} from "@/lib/ui/ui-copy";

/**
 * Sélection corrigé exposée au parent. `aucun` = aucune pill active
 * (sans corrigé). Phase 6 : `simple` et `detaille` mappent tous deux vers
 * `estCorrige=true` côté payload.
 */
export type OptionCorrige = "aucun" | "simple" | "detaille";

export type NavbarModesImpressionProps = {
  entite: "tache" | "epreuve";
  mode: ModeImpression;
  optionCorrige: OptionCorrige;
  surChangerMode: (mode: ModeImpression) => void;
  surChangerCorrige: (option: OptionCorrige) => void;
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

const CORRIGE_OPTIONS: { value: Exclude<OptionCorrige, "aucun">; label: string }[] = [
  { value: "simple", label: NAVBAR_IMPRESSION_CORRIGE_SIMPLE },
  { value: "detaille", label: NAVBAR_IMPRESSION_CORRIGE_DETAILLE },
];

/** Style des pills (mode + corrigé) — compact, cohérent SegmentedControl. */
const PILL_BTN_BASE =
  "inline-flex min-h-0 items-center justify-center gap-2 rounded-md border-0 px-2.5 py-1 text-[12px] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const PILL_BTN_ACTIVE = "bg-(--color-background-info) text-(--color-text-info)";
const PILL_BTN_INACTIVE = "bg-transparent text-(--color-text-secondary) hover:text-deep";

export function NavbarModesImpression({
  entite,
  mode,
  optionCorrige,
  surChangerMode,
  surChangerCorrige,
  className,
}: NavbarModesImpressionProps) {
  const modeOptions = entite === "epreuve" ? MODE_OPTIONS_EPREUVE : MODE_OPTIONS_TACHE;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <SegmentedControl
        aria-label={NAVBAR_IMPRESSION_MODE_GROUPE_LABEL}
        options={modeOptions}
        value={mode}
        onChange={(v) => surChangerMode(v as ModeImpression)}
        buttonClassName="px-2.5 py-1 text-[12px]"
      />

      <span aria-hidden="true" className="hidden h-4 w-px bg-border md:block" />

      {/*
       * Groupe corrigé en pills toggle (pas SegmentedControl car celui-ci
       * exige une valeur active parmi ses options ; ici l'état « aucun »
       * = aucune pill active). Recliquer une pill active la désélectionne.
       */}
      <div
        role="group"
        aria-label={NAVBAR_IMPRESSION_CORRIGE_GROUPE_LABEL}
        className="flex flex-wrap gap-1"
      >
        {CORRIGE_OPTIONS.map((opt) => {
          const active = optionCorrige === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => surChangerCorrige(active ? "aucun" : opt.value)}
              className={cn(PILL_BTN_BASE, active ? PILL_BTN_ACTIVE : PILL_BTN_INACTIVE)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
