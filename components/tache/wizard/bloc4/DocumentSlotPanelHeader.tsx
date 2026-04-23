import { slotStatusLabel, type SlotUiStatus } from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  documentSlotLetterBadgeClass,
  statusTextClasses,
} from "@/components/tache/wizard/bloc4/documentSlotStatusStyles";
import { SECTION_B_DOC_LEURRE_BADGE } from "@/lib/ui/ui-copy";

type Props = {
  slotId: DocumentSlotId;
  numero: number;
  status: SlotUiStatus;
  open: boolean;
  onToggle: (slotId: DocumentSlotId) => void;
  /** Section B uniquement — information de pertinence. Absent en Section A. */
  pertinence?: { type: "leurre" } | { type: "pertinent"; nbCases: number } | null;
};

function BadgePertinence({ pertinence }: { pertinence: NonNullable<Props["pertinence"]> }) {
  if (pertinence.type === "leurre") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning ring-1 ring-inset ring-warning/30">
        <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
          block
        </span>
        {SECTION_B_DOC_LEURRE_BADGE}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-semibold text-success ring-1 ring-inset ring-success/25">
      <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
        link
      </span>
      Pertinent · {pertinence.nbCases} {pertinence.nbCases <= 1 ? "case" : "cases"}
    </span>
  );
}

export function DocumentSlotPanelHeader({
  slotId,
  numero,
  status,
  open,
  onToggle,
  pertinence = null,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(slotId)}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-3 bg-panel-alt/70 px-4 py-3.5 text-left transition-colors hover:bg-panel-alt"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={documentSlotLetterBadgeClass(status)}>{numero}</span>
        <span className="truncate text-sm font-semibold text-deep">Document {numero}</span>
        {pertinence ? <BadgePertinence pertinence={pertinence} /> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className={`text-xs font-medium ${statusTextClasses(status)}`}>
          {slotStatusLabel(status)}
        </span>
        <span
          className="material-symbols-outlined shrink-0 text-[1em] text-muted"
          aria-hidden="true"
        >
          {open ? "expand_less" : "expand_more"}
        </span>
      </div>
    </button>
  );
}
