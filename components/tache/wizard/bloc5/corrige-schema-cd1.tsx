"use client";

import { useCallback, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import { ChecklistPublicationCd1 } from "@/components/tache/wizard/bloc5/checklist-publication-cd1";
import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";
import {
  BLOC5_NOTES_CORRECTEUR_HELP,
  BLOC5_NOTES_CORRECTEUR_LABEL,
  SECTION_B_CORRIGE_COL_CASE,
  SECTION_B_CORRIGE_COL_DOCUMENTS,
  SECTION_B_CORRIGE_COL_GUIDAGE,
  SECTION_B_CORRIGE_COL_POINTS,
  SECTION_B_CORRIGE_COL_REPONSE,
  SECTION_B_CORRIGE_LEURRES_CORPS,
  SECTION_B_CORRIGE_LEURRES_TITRE,
  SECTION_B_CORRIGE_TOTAL_LABEL,
} from "@/lib/ui/ui-copy";
import { construireCorrigeTabulaire } from "@/lib/tache/schema-cd1/corrige-tabulaire";

function CellGuidage({ html }: { html: string }) {
  if (!html.trim()) {
    return <span className="italic text-muted">—</span>;
  }
  return (
    <div className="text-sm leading-snug [&>p]:m-0" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function CellReponse({ texte }: { texte: string }) {
  if (!texte.trim()) {
    return <span className="italic text-muted">—</span>;
  }
  return <span className="text-sm leading-snug text-deep">{texte}</span>;
}

function CellDocuments({ numeros }: { numeros: number[] }) {
  if (numeros.length === 0) {
    return <span className="italic text-muted">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {numeros.map((n) => (
        <span
          key={n}
          className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-accent/10 px-2 text-[11px] font-semibold text-accent ring-1 ring-inset ring-accent/20"
        >
          {n}
        </span>
      ))}
    </div>
  );
}

export default function CorrigeSchemaCd1({ state, dispatch }: Bloc5Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const setNotesCorrecteur = useCallback(
    (html: string) => dispatch({ type: "SET_NOTES_CORRECTEUR", value: html }),
    [dispatch],
  );

  const corrige = useMemo(() => {
    const schema = state.bloc3.schemaCd1;
    if (!schema) return null;
    return construireCorrigeTabulaire({
      schema,
      aspectA: state.bloc2.aspectA,
      aspectB: state.bloc2.aspectB,
      documentSlots: state.bloc2.documentSlots,
      documents: state.bloc4.documents,
    });
  }, [
    state.bloc3.schemaCd1,
    state.bloc2.aspectA,
    state.bloc2.aspectB,
    state.bloc2.documentSlots,
    state.bloc4.documents,
  ]);

  if (!corrige) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Complétez la consigne de caractérisation (étape 3) pour voir le corrigé.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="border-b border-border pb-2 text-base font-semibold uppercase tracking-wide text-deep">
          Corrigé du schéma
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-panel text-xs font-semibold uppercase tracking-wide text-deep">
              <tr>
                <th className="border-b border-border px-3 py-2">{SECTION_B_CORRIGE_COL_CASE}</th>
                <th className="border-b border-border px-3 py-2">
                  {SECTION_B_CORRIGE_COL_GUIDAGE}
                </th>
                <th className="border-b border-border px-3 py-2">
                  {SECTION_B_CORRIGE_COL_REPONSE}
                </th>
                <th className="border-b border-border px-3 py-2 text-right">
                  {SECTION_B_CORRIGE_COL_POINTS}
                </th>
                <th className="border-b border-border px-3 py-2">
                  {SECTION_B_CORRIGE_COL_DOCUMENTS}
                </th>
              </tr>
            </thead>
            <tbody>
              {corrige.lignes.map((ligne) => (
                <tr key={ligne.cleCase} className="align-top">
                  <td className="border-b border-border/60 px-3 py-2 text-xs font-semibold text-deep">
                    {ligne.libelleComplet}
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <CellGuidage html={ligne.guidageHtml} />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <CellReponse texte={ligne.reponse} />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2 text-right font-mono text-xs text-muted">
                    /{ligne.points}
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <CellDocuments numeros={ligne.documentsNumeros} />
                  </td>
                </tr>
              ))}
              <tr className="bg-panel-alt/60">
                <td
                  className="px-3 py-2 text-sm font-bold uppercase tracking-wide text-deep"
                  colSpan={3}
                >
                  {SECTION_B_CORRIGE_TOTAL_LABEL}
                </td>
                <td className="px-3 py-2 text-right font-mono text-sm font-bold text-deep">
                  /{corrige.total}
                </td>
                <td className="px-3 py-2" />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2 rounded-md border border-border bg-panel p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-deep">
          {SECTION_B_CORRIGE_LEURRES_TITRE}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {SECTION_B_CORRIGE_LEURRES_CORPS(corrige.leurresNumeros.join(", "))}
        </p>
      </section>

      <section className="space-y-2 border-t border-border pt-5">
        <LabelWithInfo
          labelText={BLOC5_NOTES_CORRECTEUR_LABEL}
          onInfoClick={() => setHelpOpen(true)}
          leadingIcon="edit_note"
          leadingIconTitle={BLOC5_NOTES_CORRECTEUR_LABEL}
          showAsterisk={false}
        />
        <p className="text-xs text-muted">{BLOC5_NOTES_CORRECTEUR_HELP}</p>
        <RichTextEditor
          id="notes-correcteur-cd1"
          instanceId="notes-correcteur-cd1"
          className="mt-2"
          value={state.bloc5.notesCorrecteur}
          onChange={setNotesCorrecteur}
          autosaveKey="eduqcia-tache-notes-correcteur-cd1-new"
          minHeight={80}
        />
      </section>

      <ChecklistPublicationCd1 />

      <SimpleModal
        open={helpOpen}
        title={BLOC5_NOTES_CORRECTEUR_LABEL}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC5_NOTES_CORRECTEUR_HELP}</p>
      </SimpleModal>
    </div>
  );
}
