"use client";

import { RequiredMark } from "@/components/ui/RequiredMark";
import { ARIA_OPEN_FIELD_HELP } from "@/lib/ui/ui-copy";

type Props = {
  /** Pour associer un contrôle sans `htmlFor` (ex. bouton listbox) via `aria-labelledby`. */
  id?: string;
  htmlFor?: string;
  labelText: string;
  onInfoClick: () => void;
  /** Glyphe Material Symbols (ligature) avant le libellé — docs/DECISIONS.md §Étape 2 (tableau icônes). */
  leadingIcon?: string;
  /** Infobulle au survol du glyphe — `lib/tae/icon-justifications.ts` / `docs/DECISIONS.md` (justifications icônes). */
  leadingIconTitle?: string;
  /** Par défaut `true` (champs obligatoires). */
  showAsterisk?: boolean;
};

export function LabelWithInfo({
  id,
  htmlFor,
  labelText,
  onInfoClick,
  leadingIcon,
  leadingIconTitle,
  showAsterisk = true,
}: Props) {
  const labelEl = (
    <label id={id} htmlFor={htmlFor} className="text-sm font-semibold text-deep">
      {labelText}
      {showAsterisk ? (
        <>
          {" "}
          <RequiredMark />
        </>
      ) : null}
    </label>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {leadingIcon ? (
        <div className="icon-text min-w-0 flex-1 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined shrink-0 text-accent"
            aria-hidden="true"
            title={leadingIconTitle}
          >
            {leadingIcon}
          </span>
          {labelEl}
        </div>
      ) : (
        labelEl
      )}
      <button
        type="button"
        onClick={onInfoClick}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-accent hover:bg-panel-alt"
        aria-label={ARIA_OPEN_FIELD_HELP}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          info
        </span>
      </button>
    </div>
  );
}
