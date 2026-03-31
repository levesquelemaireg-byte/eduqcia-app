"use client";

import { ARIA_OPEN_FIELD_HELP } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  onClick: () => void;
  className?: string;
};

/** Bouton (i) — ouvre une modale d’aide ; gabarit aligné sur `LabelWithInfo` (`docs/DESIGN-SYSTEM.md`). */
export function FieldHelpModalButton({ onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-accent hover:bg-panel-alt",
        className,
      )}
      aria-label={ARIA_OPEN_FIELD_HELP}
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        info
      </span>
    </button>
  );
}
