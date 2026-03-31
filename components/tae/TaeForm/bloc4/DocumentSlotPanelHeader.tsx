import { slotStatusLabel, type SlotUiStatus } from "@/lib/tae/document-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import {
  documentSlotLetterBadgeClass,
  statusTextClasses,
} from "@/components/tae/TaeForm/bloc4/documentSlotStatusStyles";

type Props = {
  slotId: DocumentSlotId;
  letter: string;
  status: SlotUiStatus;
  open: boolean;
  onToggle: (slotId: DocumentSlotId) => void;
};

export function DocumentSlotPanelHeader({ slotId, letter, status, open, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(slotId)}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-3 bg-panel-alt/70 px-4 py-3.5 text-left transition-colors hover:bg-panel-alt"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={documentSlotLetterBadgeClass(status)}>{letter}</span>
        <span className="truncate text-sm font-semibold text-deep">Document {letter}</span>
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
