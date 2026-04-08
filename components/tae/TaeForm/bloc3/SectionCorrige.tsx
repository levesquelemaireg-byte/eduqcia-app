"use client";

import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onInfoClick: () => void;
};

export function SectionCorrige({ value, onChange, onInfoClick }: Props) {
  return (
    <section className="space-y-2 border-t border-border pt-5">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-accent text-[1em]"
            aria-hidden="true"
            title={materialIconTooltip(BLOC3_SECTION_ICON.corrige)}
          >
            {BLOC3_SECTION_ICON.corrige}
          </span>
          Corrigé (production attendue) <RequiredMark />
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
        Fournissez un exemple de réponse complète illustrant la production attendue.
      </p>
      <RichTextEditor
        id="corrige"
        instanceId="corrige"
        className="mt-2"
        value={value}
        onChange={onChange}
        autosaveKey="eduqcia-tae-corrige-new"
        minHeight={100}
      />
    </section>
  );
}
