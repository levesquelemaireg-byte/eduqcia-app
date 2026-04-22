"use client";

type Props = {
  onClick: () => void;
};

/** Sommaire / fiche brouillon — `docs/DECISIONS.md` · Retirer cette connaissance */
export function ConnaissanceRemoveButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="connaissance-remove-trigger group inline-flex size-8 shrink-0 items-center justify-center rounded-md text-steel transition-colors hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label="Retirer cette connaissance"
    >
      <span
        className="material-symbols-outlined text-[1rem] leading-none text-inherit"
        aria-hidden="true"
      >
        remove_selection
      </span>
    </button>
  );
}
