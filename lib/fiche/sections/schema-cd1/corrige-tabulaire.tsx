"use client";

import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";
import type { FicheMode } from "@/lib/fiche/types";
import type { CorrigeTabulaireData } from "@/lib/fiche/selectors/tache/corrige-tabulaire";
import {
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
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: CorrigeTabulaireData; mode: FicheMode };

export function SectionCorrigeTabulaire({ data, mode: _mode }: Props) {
  const { corrige, notesCorrecteurHtml } = data;
  return (
    <section className="space-y-4 px-5 pt-4 pb-4">
      <div>
        <SectionLabel icon={ICONES_METIER.corrige}>Corrigé du schéma</SectionLabel>
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead className="bg-panel text-[11px] font-semibold uppercase tracking-wide text-deep">
              <tr>
                <th className="border-b border-border px-2 py-1.5">{SECTION_B_CORRIGE_COL_CASE}</th>
                <th className="border-b border-border px-2 py-1.5">
                  {SECTION_B_CORRIGE_COL_GUIDAGE}
                </th>
                <th className="border-b border-border px-2 py-1.5">
                  {SECTION_B_CORRIGE_COL_REPONSE}
                </th>
                <th className="border-b border-border px-2 py-1.5 text-right">
                  {SECTION_B_CORRIGE_COL_POINTS}
                </th>
                <th className="border-b border-border px-2 py-1.5">
                  {SECTION_B_CORRIGE_COL_DOCUMENTS}
                </th>
              </tr>
            </thead>
            <tbody>
              {corrige.lignes.map((l) => (
                <tr key={l.cleCase} className="align-top">
                  <td className="border-b border-border/60 px-2 py-1.5 text-[11px] font-semibold text-deep">
                    {l.libelleComplet}
                  </td>
                  <td className="border-b border-border/60 px-2 py-1.5">
                    {l.guidageHtml.trim() ? (
                      <div
                        className="leading-snug [&>p]:m-0"
                        dangerouslySetInnerHTML={{ __html: l.guidageHtml }}
                      />
                    ) : (
                      <span className="italic text-muted">—</span>
                    )}
                  </td>
                  <td className="border-b border-border/60 px-2 py-1.5 text-deep">
                    {l.reponse.trim() || <span className="italic text-muted">—</span>}
                  </td>
                  <td className="border-b border-border/60 px-2 py-1.5 text-right font-mono text-[11px] text-muted">
                    /{l.points}
                  </td>
                  <td className="border-b border-border/60 px-2 py-1.5">
                    {l.documentsNumeros.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {l.documentsNumeros.map((numero) => (
                          <span
                            key={numero}
                            className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent/10 px-1.5 text-[10px] font-semibold text-accent ring-1 ring-inset ring-accent/20"
                          >
                            {numero}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="bg-panel-alt/60">
                <td
                  className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-deep"
                  colSpan={3}
                >
                  {SECTION_B_CORRIGE_TOTAL_LABEL}
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-[11px] font-bold text-deep">
                  /{corrige.total}
                </td>
                <td className="px-2 py-1.5" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-border bg-panel p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-deep">
          {SECTION_B_CORRIGE_LEURRES_TITRE}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {SECTION_B_CORRIGE_LEURRES_CORPS(corrige.leurresNumeros.join(", "))}
        </p>
      </div>

      {notesCorrecteurHtml ? (
        <div>
          <SectionLabel icon="edit_note">{BLOC5_NOTES_CORRECTEUR_LABEL}</SectionLabel>
          <ContentBlock html={notesCorrecteurHtml} className="text-xs leading-relaxed text-steel" />
        </div>
      ) : null}
    </section>
  );
}
