"use client";

import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import { BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT } from "@/lib/ui/ui-copy";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onInfoClick: () => void;
};

export function SectionGuidage({ value, onChange, onInfoClick }: Props) {
  return (
    <section className="space-y-2 border-t border-border pt-5">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-accent text-[1em]"
            aria-hidden="true"
            title={materialIconTooltip(BLOC3_SECTION_ICON.guidage)}
          >
            {BLOC3_SECTION_ICON.guidage}
          </span>
          Guidage complémentaire
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
      <p className="text-xs text-muted">
        Ajoutez, au besoin, des indications supplémentaires pour soutenir l&apos;élève dans la
        compréhension de la tâche.
      </p>
      <RichTextEditor
        id="guidage"
        instanceId="guidage"
        className="mt-2"
        value={value}
        onChange={onChange}
        autosaveKey="eduqcia-tae-guidage-new"
        minHeight={88}
      />
      <p className="text-xs italic text-muted">{BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT}</p>
    </section>
  );
}
