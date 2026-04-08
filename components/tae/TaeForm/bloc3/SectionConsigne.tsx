"use client";

import { ConsigneTipTapEditor } from "@/components/tae/TaeForm/tiptap/ConsigneTipTapEditor";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import type { BlueprintSlice } from "@/components/tae/TaeForm/FormState";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";

type Props = {
  blueprint: BlueprintSlice;
  consigneHtml: string;
  onConsigneChange: (html: string) => void;
  onInfoClick: () => void;
  templateButton?: { label: string; onClick: () => void };
};

export function SectionConsigne({
  blueprint,
  consigneHtml,
  onConsigneChange,
  onInfoClick,
  templateButton,
}: Props) {
  const nb = blueprint.nbDocuments ?? 0;
  const slotIds = blueprint.documentSlots.map((s) => s.slotId) as DocumentSlotId[];
  const editorKey = `${blueprint.comportementId}-${nb}`;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-accent text-[1em]"
            aria-hidden="true"
            title={materialIconTooltip(BLOC3_SECTION_ICON.consigne)}
          >
            {BLOC3_SECTION_ICON.consigne}
          </span>
          Consigne <RequiredMark />
        </label>
        <button
          type="button"
          onClick={onInfoClick}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
          aria-label="Informations"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            info
          </span>
        </button>
      </div>
      <ConsigneTipTapEditor
        key={editorKey}
        value={consigneHtml}
        onChange={onConsigneChange}
        nbDocuments={nb}
        documentSlotIds={slotIds}
        templateButton={templateButton}
      />
    </section>
  );
}
