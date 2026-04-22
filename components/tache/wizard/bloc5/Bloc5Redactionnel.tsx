"use client";

import { useCallback, useState } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { RequiredMark } from "@/components/ui/RequiredMark";
import type { Bloc5Props } from "@/lib/tache/tae-form-state-types";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  BLOC5_NOTES_CORRECTEUR_HELP,
  BLOC5_NOTES_CORRECTEUR_LABEL,
  BLOC5_REDACTIONNEL_HELP,
  BLOC5_REDACTIONNEL_LABEL,
  BLOC5_REDACTIONNEL_PLACEHOLDER,
} from "@/lib/ui/ui-copy";

export default function Bloc5Redactionnel({ state, dispatch }: Bloc5Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const setCorrige = useCallback(
    (html: string) => dispatch({ type: "SET_CORRIGE", value: html }),
    [dispatch],
  );
  const setNotesCorrecteur = useCallback(
    (html: string) => dispatch({ type: "SET_NOTES_CORRECTEUR", value: html }),
    [dispatch],
  );

  return (
    <div className="space-y-6">
      <SimpleModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={BLOC5_REDACTIONNEL_LABEL}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC5_REDACTIONNEL_HELP}</p>
      </SimpleModal>

      <section className="space-y-2 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-deep">
            <span
              className="material-symbols-outlined text-[1em] text-accent"
              aria-hidden="true"
              title={materialIconTooltip(BLOC3_SECTION_ICON.corrige) ?? undefined}
            >
              {BLOC3_SECTION_ICON.corrige}
            </span>
            {BLOC5_REDACTIONNEL_LABEL} <RequiredMark />
          </label>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
            aria-label={BLOC5_REDACTIONNEL_LABEL}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              info
            </span>
          </button>
        </div>
        <p className="text-xs text-muted">{BLOC5_REDACTIONNEL_HELP}</p>
        <p className="text-xs italic text-muted">{BLOC5_REDACTIONNEL_PLACEHOLDER}</p>
        <RichTextEditor
          id="corrige-bloc5"
          instanceId="corrige-bloc5"
          className="mt-2"
          value={state.bloc5.corrige}
          onChange={setCorrige}
          autosaveKey="eduqcia-tae-corrige-new"
          minHeight={100}
        />
      </section>

      <section className="space-y-2 border-t border-border pt-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-[1em] text-accent"
            aria-hidden="true"
            title={materialIconTooltip("edit_note") ?? undefined}
          >
            edit_note
          </span>
          {BLOC5_NOTES_CORRECTEUR_LABEL}
        </label>
        <p className="text-xs text-muted">{BLOC5_NOTES_CORRECTEUR_HELP}</p>
        <RichTextEditor
          id="notes-correcteur-bloc5"
          instanceId="notes-correcteur-bloc5"
          className="mt-2"
          value={state.bloc5.notesCorrecteur}
          onChange={setNotesCorrecteur}
          autosaveKey="eduqcia-tae-notes-correcteur-new"
          minHeight={80}
        />
      </section>
    </div>
  );
}
