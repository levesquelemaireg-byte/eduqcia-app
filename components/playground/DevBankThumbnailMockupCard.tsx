"use client";

import {
  aspectLabelsForBankMockup,
  modeReponseLabelForBankMockup,
  truncatePlainForBankMockup,
} from "@/components/playground/dev-bank-mockup-shared";
import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";
import { plainConsigneForMiniature } from "@/lib/tae/consigne-helpers";
import type { TaeFicheData } from "@/lib/types/fiche";
import { BANK_TASK_BY, BANK_TASK_LIST_BADGE_PUBLISHED } from "@/lib/ui/ui-copy";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";

type Props = {
  tae: TaeFicheData;
};

/**
 * Maquette **miniature banque** — mêmes champs que la fiche sommaire complète, ordre optimisé pour le scan en liste.
 * Aligné conceptuellement sur `TaeCard`, avec signaux supplémentaires (documents, corrigé, mode de réponse, grille).
 * DEV uniquement (`/dev/summary-mockup`).
 */
export function DevBankThumbnailMockupCard({ tae }: Props) {
  const previewSnippet = plainConsigneForMiniature(tae.consigne, tae.documents.length);
  const corrigePresent = hasFicheContent(tae.corrige);
  const aspectsLine = aspectLabelsForBankMockup(tae.aspects_societe).join(" · ");
  const modeLine = modeReponseLabelForBankMockup(tae);
  const letters = tae.documents.map((d) => d.letter).join(", ");
  const titresJoined = tae.documents.map((d) => d.titre).join(" · ");
  const titresShort = truncatePlainForBankMockup(titresJoined, 64);
  const auteursLine = tae.auteurs.map((a) => a.full_name.trim()).filter(Boolean).join(", ");

  return (
    <article
      className="mx-auto max-w-lg rounded-2xl border border-border bg-panel p-4 shadow-sm transition-shadow hover:shadow-md"
      aria-label="Maquette miniature banque"
    >
      {/* 1 — Public (même priorité que fiche complète zone 1, tête de liste) */}
      <p className="text-xs font-semibold leading-snug text-deep">
        {tae.niveau.label}
        <span className="mx-1.5 font-normal text-muted" aria-hidden="true">
          ·
        </span>
        {tae.discipline.label}
      </p>

      {/* 2 — OI + comportement */}
      <div className="mt-2 flex gap-3">
        <div className="shrink-0 pt-0.5">
          <MaterialSymbolOiGlyph
            glyph={tae.oi.icone}
            className="text-accent"
            style={{ fontSize: "1.375rem" }}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-accent">{tae.oi.titre}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-steel">
            {tae.comportement.enonce}
          </p>
        </div>
      </div>

      {/* 3 — Consigne (vedette lecture rapide) */}
      <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-deep">{previewSnippet}</p>

      {/* 4 — Documents */}
      <p className="mt-2 text-[11px] leading-snug text-muted">
        <span className="font-medium text-steel">
          {tae.documents.length} document{tae.documents.length === 1 ? "" : "s"}
        </span>
        <span aria-hidden="true"> · </span>
        <span className="font-mono">{letters}</span>
        {titresShort ? (
          <>
            <span aria-hidden="true"> — </span>
            <span className="text-steel">{titresShort}</span>
          </>
        ) : null}
      </p>

      {/* 5 — Indexation + charge pédagogique (ligne compacte) */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-steel">
        {aspectsLine ? (
          <span className="max-w-full truncate" title={aspectsLine}>
            {aspectsLine}
          </span>
        ) : null}
        {aspectsLine ? <span className="text-muted" aria-hidden="true">·</span> : null}
        <span className="shrink-0">{modeLine}</span>
        <span className="text-muted" aria-hidden="true">
          ·
        </span>
        <span className={corrigePresent ? "font-medium text-success" : "text-muted"}>
          {corrigePresent ? "Corrigé fourni" : "Sans corrigé"}
        </span>
        {tae.outilEvaluation ? (
          <>
            <span className="text-muted" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-[10px] text-muted">{tae.outilEvaluation}</span>
          </>
        ) : null}
      </div>

      {/* 6 — Méta collaborative */}
      <footer className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-[11px] text-muted">
        {tae.is_published ? (
          <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 font-medium text-success">
            {BANK_TASK_LIST_BADGE_PUBLISHED}
          </span>
        ) : (
          <span className="rounded-full bg-border/60 px-2 py-0.5 font-medium text-steel">Non publiée</span>
        )}
        <span aria-hidden="true">·</span>
        <span className="min-w-0 truncate">
          {BANK_TASK_BY} {auteursLine || "—"}
        </span>
        <span aria-hidden="true">·</span>
        <span className="shrink-0">{formatDateFrCaMedium(tae.updated_at)}</span>
      </footer>
    </article>
  );
}
