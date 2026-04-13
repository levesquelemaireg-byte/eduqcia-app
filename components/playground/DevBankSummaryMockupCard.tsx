"use client";

import { useMemo, useState } from "react";
import {
  aspectLabelsForBankMockup,
  modeReponseLabelForBankMockup,
  truncatePlainForBankMockup,
} from "@/components/playground/dev-bank-mockup-shared";
import { resolveConsigneHtmlForDisplay } from "@/lib/tae/consigne-helpers";
import { sanitize } from "@/lib/fiche/helpers";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";
import { prepareNonRedactionConsigneForTeacherDisplay } from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import type { TaeFicheData } from "@/lib/types/fiche";
import { BANK_TASK_BY, BANK_TASK_LIST_BADGE_PUBLISHED } from "@/lib/ui/ui-copy";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import { cn } from "@/lib/utils/cn";
import { stripHtmlToPlainText } from "@/lib/utils/stripHtml";

type Props = {
  tae: TaeFicheData;
};

/** Maquette fiche sommaire banque — `TaeFicheData` (mocks + `public/data/oi.json`). DEV uniquement. */
export function DevBankSummaryMockupCard({ tae }: Props) {
  const [consigneExpanded, setConsigneExpanded] = useState(false);

  const consigneHtml = useMemo(
    () =>
      resolveConsigneHtmlForDisplay(
        prepareNonRedactionConsigneForTeacherDisplay(tae.consigne),
        tae.documents.length,
      ),
    [tae.consigne, tae.documents.length],
  );

  const guidagePlain = useMemo(() => stripHtmlToPlainText(tae.guidage ?? "").trim(), [tae.guidage]);

  const corrigePresent = hasFicheContent(tae.corrige);
  const aspectsShown = aspectLabelsForBankMockup(tae.aspects_societe);
  const firstConn = tae.connaissances[0];
  const cdLine = tae.cd ? `${tae.cd.competence} · ${tae.cd.composante} · ${tae.cd.critere}` : null;

  const auteursLine = tae.auteurs
    .map((a) => a.full_name.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-panel shadow-sm"
      aria-label="Maquette fiche sommaire banque"
    >
      <header className="border-b border-border bg-panel-alt px-5 py-4">
        <p className="text-base font-semibold text-deep">
          <span>{tae.niveau.label}</span>
          <span className="mx-2 text-muted" aria-hidden="true">
            ·
          </span>
          <span>{tae.discipline.label}</span>
        </p>
        <p className="mt-2 text-sm leading-snug text-deep">
          <span className="font-medium text-accent">{tae.oi.titre}</span>
          <span className="mx-1.5 text-muted" aria-hidden="true">
            —
          </span>
          <span>{truncatePlainForBankMockup(tae.comportement.enonce, 220)}</span>
        </p>
        {tae.outilEvaluation ? (
          <p className="mt-2 font-mono text-xs text-muted">Grille : {tae.outilEvaluation}</p>
        ) : null}
      </header>

      <section className="border-b border-border px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Indexation</p>
        {aspectsShown.length > 0 ? (
          <p className="mt-1.5 text-sm font-medium text-deep">{aspectsShown.join(" · ")}</p>
        ) : (
          <p className="mt-1.5 text-sm text-muted">Aucun aspect renseigné</p>
        )}
        {firstConn ? (
          <p className="mt-2 text-sm leading-relaxed text-steel">
            <span className="font-medium text-deep">{firstConn.realite_sociale}</span>
            {firstConn.enonce ? (
              <>
                <span className="text-muted"> — </span>
                {truncatePlainForBankMockup(firstConn.enonce, 160)}
              </>
            ) : null}
          </p>
        ) : null}
        {cdLine ? (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-accent underline-offset-2 hover:underline">
              Compétence disciplinaire
            </summary>
            <p className="mt-2 leading-relaxed text-steel">{cdLine}</p>
          </details>
        ) : null}
        {tae.connaissances.length > 1 ? (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-accent underline-offset-2 hover:underline">
              Toutes les connaissances ({tae.connaissances.length})
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-1 text-steel">
              {tae.connaissances.map((c, i) => (
                <li key={`${c.enonce}-${i}`}>
                  {c.realite_sociale} — {c.section}
                  {c.sous_section ? ` (${c.sous_section})` : null} :{" "}
                  {truncatePlainForBankMockup(c.enonce, 120)}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="border-b border-border px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[1.125rem] text-accent"
            aria-hidden="true"
          >
            quiz
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            Consigne (demande aux élèves)
          </span>
        </div>
        <div
          className={cn(
            "text-base font-semibold leading-relaxed tracking-tight text-deep md:text-lg [&_strong]:font-bold [&_em]:italic [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5",
            !consigneExpanded && "line-clamp-5",
          )}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: sanitize(consigneHtml) }}
        />
        <button
          type="button"
          className="mt-2 text-sm font-medium text-accent underline-offset-2 hover:underline"
          onClick={() => setConsigneExpanded((v) => !v)}
        >
          {consigneExpanded ? "Replier" : "Lire la suite"}
        </button>
        {guidagePlain ? (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-accent underline-offset-2 hover:underline">
              Guidage complémentaire
            </summary>
            <p className="mt-2 leading-relaxed text-steel">
              {truncatePlainForBankMockup(guidagePlain, 400)}
            </p>
          </details>
        ) : null}
      </section>

      <section className="border-b border-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Documents historiques
        </p>
        <p className="mt-1 text-sm font-medium text-deep">
          {tae.documents.length} document{tae.documents.length === 1 ? "" : "s"} ·{" "}
          {tae.documents.filter((d) => d.type === "textuel").length} textuel
          {tae.documents.filter((d) => d.type === "iconographique").length > 0
            ? ` · ${tae.documents.filter((d) => d.type === "iconographique").length} iconographique`
            : ""}
        </p>
        <ul className="mt-3 space-y-2">
          {tae.documents.map((doc) => (
            <li key={doc.letter} className="text-sm">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-border/50 font-mono text-xs font-semibold text-deep">
                {doc.letter}
              </span>
              <span className="font-medium text-deep">{doc.titre}</span>
              <span className="text-muted">
                {" "}
                — {doc.type === "textuel" ? "Textuel" : "Iconographique"}
              </span>
              <details className="ml-8 mt-1">
                <summary className="cursor-pointer text-xs text-accent underline-offset-2 hover:underline">
                  Source
                </summary>
                <p className="mt-1 text-xs leading-relaxed text-steel">{doc.source_citation}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-b border-border px-5 py-3">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="text-deep">
            <span className="font-medium">Corrigé : </span>
            {corrigePresent ? (
              <span className="text-success">Fourni (enseignant)</span>
            ) : (
              <span className="text-muted">Absent ou vide</span>
            )}
          </span>
          <span className="text-deep">
            <span className="font-medium">Réponse : </span>
            {modeReponseLabelForBankMockup(tae)}
          </span>
        </div>
        {corrigePresent ? (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-accent underline-offset-2 hover:underline">
              Aperçu corrigé
            </summary>
            <div
              className="mt-2 max-w-none text-sm leading-relaxed text-steel [&_strong]:font-semibold"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: sanitize(tae.corrige) }}
            />
          </details>
        ) : null}
      </section>

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-xs text-muted">
        {tae.is_published ? (
          <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 font-medium text-success">
            {BANK_TASK_LIST_BADGE_PUBLISHED}
          </span>
        ) : (
          <span className="rounded-full bg-border/60 px-2 py-0.5 font-medium text-steel">
            Non publiée
          </span>
        )}
        <span aria-hidden="true">·</span>
        <span>
          {BANK_TASK_BY} {auteursLine || "—"}
        </span>
        <span aria-hidden="true">·</span>
        <span>Créée le {formatDateFrCaMedium(tae.created_at)}</span>
        <span aria-hidden="true">·</span>
        <span>Mise à jour {formatDateFrCaMedium(tae.updated_at)}</span>
      </footer>

      <div className="border-t border-border bg-panel-alt px-5 py-3">
        <p className="text-center text-sm text-muted">
          Action fictive (mockup DEV) — branchement banque : voir / adapter la tâche
        </p>
      </div>
    </article>
  );
}
