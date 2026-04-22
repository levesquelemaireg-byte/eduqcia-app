"use client";

import { Button } from "@/components/ui/Button";
import { SimpleModal } from "@/components/ui/SimpleModal";
import {
  INJECT_DOC_MODAL_ACTION_FIRST_EMPTY,
  INJECT_DOC_MODAL_ACTION_FIRST_EMPTY_HINT,
  INJECT_DOC_MODAL_ACTION_FIRST_EMPTY_NONE,
  INJECT_DOC_MODAL_ACTION_REPLACE_A,
  INJECT_DOC_MODAL_ACTION_REPLACE_A_HINT,
  INJECT_DOC_MODAL_ACTION_RESET,
  INJECT_DOC_MODAL_ACTION_RESET_HINT,
  INJECT_DOC_MODAL_CANCEL,
  INJECT_DOC_MODAL_DRAFT_LABEL,
  INJECT_DOC_MODAL_DRAFT_UNTITLED,
  INJECT_DOC_MODAL_INTRO,
  INJECT_DOC_MODAL_SLOTS_EMPTY,
  INJECT_DOC_MODAL_SLOTS_FILLED,
  INJECT_DOC_MODAL_TITLE,
} from "@/lib/ui/copy/document";
import { cn } from "@/lib/utils/cn";

export type InjectAction = "replace" | "first-empty" | "reset";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (action: InjectAction) => void;
  draftTitle: string | null;
  filledSlots: number;
  totalSlots: number;
  hasFreeSlot: boolean;
};

type ActionRowProps = {
  label: string;
  hint: string;
  disabled?: boolean;
  onClick: () => void;
};

function ActionRow({ label, hint, disabled, onClick }: ActionRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      className={cn(
        "flex w-full flex-col items-start gap-1 rounded-md border border-border px-4 py-3 text-left transition-colors",
        disabled
          ? "cursor-not-allowed bg-panel-alt/40 opacity-60"
          : "cursor-pointer bg-panel hover:border-accent hover:bg-panel-alt",
      )}
    >
      <span className="text-sm font-semibold text-deep">{label}</span>
      <span className="text-xs leading-snug text-muted">{hint}</span>
    </button>
  );
}

export function InjectDocumentModal({
  open,
  onClose,
  onSelect,
  draftTitle,
  filledSlots,
  totalSlots,
  hasFreeSlot,
}: Props) {
  const slotsLine =
    totalSlots > 0
      ? INJECT_DOC_MODAL_SLOTS_FILLED(filledSlots, totalSlots)
      : INJECT_DOC_MODAL_SLOTS_EMPTY;
  const titleLine =
    draftTitle && draftTitle.trim() !== "" ? draftTitle : INJECT_DOC_MODAL_DRAFT_UNTITLED;

  return (
    <SimpleModal
      open={open}
      title={INJECT_DOC_MODAL_TITLE}
      onClose={onClose}
      panelClassName="max-w-xl"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" className="min-h-11" onClick={onClose}>
            {INJECT_DOC_MODAL_CANCEL}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-deep">{INJECT_DOC_MODAL_INTRO}</p>

      <div className="mt-4 rounded-md border border-border bg-panel-alt px-3 py-2 text-xs text-muted">
        <p>
          <span className="font-semibold text-deep">{INJECT_DOC_MODAL_DRAFT_LABEL} : </span>
          <span className="text-deep">{titleLine}</span>
        </p>
        <p className="mt-0.5">{slotsLine}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <ActionRow
          label={INJECT_DOC_MODAL_ACTION_REPLACE_A}
          hint={INJECT_DOC_MODAL_ACTION_REPLACE_A_HINT}
          onClick={() => onSelect("replace")}
        />
        <ActionRow
          label={INJECT_DOC_MODAL_ACTION_FIRST_EMPTY}
          hint={
            hasFreeSlot
              ? INJECT_DOC_MODAL_ACTION_FIRST_EMPTY_HINT
              : INJECT_DOC_MODAL_ACTION_FIRST_EMPTY_NONE
          }
          disabled={!hasFreeSlot}
          onClick={() => onSelect("first-empty")}
        />
        <ActionRow
          label={INJECT_DOC_MODAL_ACTION_RESET}
          hint={INJECT_DOC_MODAL_ACTION_RESET_HINT}
          onClick={() => onSelect("reset")}
        />
      </div>
    </SimpleModal>
  );
}
