import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
};

/** Chip multi-sélection avec aria-pressed — niveaux, disciplines (§5.5). */
export function ToggleChip({ label, icon, selected, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors",
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-deep hover:bg-surface",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {icon && (
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
