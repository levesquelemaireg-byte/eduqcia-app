import { LEGAL_NOTICE_MATERIAL_ICON, materialIconTooltip } from "@/lib/tae/icon-justifications";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

/** Glyphe Material `gavel` — documentation légale ; registre `docs/DECISIONS.md` §7, `docs/DESIGN-SYSTEM.md`. */
export function LegalNoticeIcon({ className }: Props) {
  const title = materialIconTooltip(LEGAL_NOTICE_MATERIAL_ICON);
  return (
    <span
      className={cn("material-symbols-outlined shrink-0 text-[1em] text-accent", className)}
      aria-hidden="true"
      title={title}
    >
      {LEGAL_NOTICE_MATERIAL_ICON}
    </span>
  );
}
