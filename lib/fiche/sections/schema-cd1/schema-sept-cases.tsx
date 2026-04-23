"use client";

import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import type { FicheMode } from "@/lib/fiche/types";
import type {
  CaseSommaire,
  SchemaSeptCasesData,
} from "@/lib/fiche/selectors/tache/schema-sept-cases";
import { SECTION_B_SCHEMA_COMPTEUR } from "@/lib/ui/ui-copy";

type Props = { data: SchemaSeptCasesData; mode: FicheMode };

function CaseLecture({ c }: { c: CaseSommaire }) {
  const aVide = c.guidage.trim().length === 0 && c.reponse.trim().length === 0;
  return (
    <div className="overflow-hidden rounded-md bg-surface shadow-sm ring-1 ring-inset ring-border/60">
      <div className="bg-deep px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-surface">
        {c.titre}
        {c.sousTitre ? (
          <span className="ml-1 font-normal normal-case text-surface/80">· {c.sousTitre}</span>
        ) : null}
      </div>
      <div className="space-y-2 p-3 text-sm text-deep">
        {aVide ? (
          <p className="italic text-muted">—</p>
        ) : (
          <>
            {c.guidage.trim() ? (
              <div
                className="leading-snug [&>p]:m-0"
                dangerouslySetInnerHTML={{ __html: c.guidage }}
              />
            ) : null}
            {c.reponse.trim() ? (
              <div className="rounded bg-panel-alt/60 px-2 py-1 text-xs text-muted">
                <span className="font-semibold text-deep">Réponse : </span>
                {c.reponse}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function SectionSchemaSeptCases({ data, mode: _mode }: Props) {
  const { cases, compteur } = data;
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="schema">Schéma de caractérisation</SectionLabel>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {SECTION_B_SCHEMA_COMPTEUR(compteur)}
      </p>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <CaseLecture c={cases["objet"]} />
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-panel p-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <CaseLecture c={cases["blocA.pivot"]} />
              <CaseLecture c={cases["blocA.precision1"]} />
              <CaseLecture c={cases["blocA.precision2"]} />
            </div>
          </div>
          <div className="rounded-md border border-border bg-panel p-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <CaseLecture c={cases["blocB.pivot"]} />
              <CaseLecture c={cases["blocB.precision1"]} />
              <CaseLecture c={cases["blocB.precision2"]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
