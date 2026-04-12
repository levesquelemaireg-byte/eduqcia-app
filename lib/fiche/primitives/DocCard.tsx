"use client";

import Image from "next/image";
import type { DocumentFiche } from "@/lib/types/fiche";
import type { FicheMode } from "@/lib/fiche/types";
import { cn } from "@/lib/utils/cn";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";

type Props = {
  doc: DocumentFiche;
  mode: FicheMode;
  /** Numéro affiché dans une pastille (1-4). Vue détaillée uniquement. */
  numero?: number;
  /** Glyphe Material Symbols de la catégorie du document. Vue détaillée uniquement. */
  categorieGlyph?: string;
  /** Handler de clic — rend la card interactive. Vue détaillée uniquement. */
  onClick?: () => void;
};

/** Card document compacte — lettre + type + titre + aperçu + métadonnées enrichies. */
export function DocCard({ doc, mode, numero, categorieGlyph, onClick }: Props) {
  const hasTitle = doc.titre.trim().length > 0;
  const hasBody =
    doc.type === "textuel"
      ? hasFicheContent(doc.contenu)
      : Boolean(doc.image_url && doc.image_url.length > 0);
  const hasSource = htmlHasMeaningfulText(doc.source_citation);
  const complete = hasTitle && hasBody && hasSource;

  if (mode === "thumbnail") {
    return (
      <div className="rounded-lg border border-border bg-panel px-3 py-2">
        <p className="truncate text-xs font-semibold text-deep">
          Document {doc.letter}
          {hasTitle ? ` — ${doc.titre}` : ""}
        </p>
      </div>
    );
  }

  /* ── Mode vue détaillée (avec numéro + catégorie + cliquable) ── */
  if (numero != null) {
    const Wrapper = onClick ? "button" : "div";
    return (
      <Wrapper
        type={onClick ? "button" : undefined}
        className={cn(
          "flex items-start gap-3.5 rounded-lg border-[0.5px] border-border bg-panel px-4 py-3.5 text-left",
          onClick && "cursor-pointer hover:border-border-secondary transition-colors duration-150",
        )}
        onClick={onClick}
      >
        {/* Pastille numérotée */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panel-alt text-xs font-bold text-deep">
          {numero}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {categorieGlyph ? (
              <span
                className="material-symbols-outlined text-[16px] text-accent"
                aria-hidden="true"
              >
                {categorieGlyph}
              </span>
            ) : null}
            <p className="text-sm font-semibold text-deep">
              {doc.titre || `Document ${doc.letter}`}
            </p>
          </div>
          {/* Ligne source : catégorie · repère temporel · auteur */}
          <DocMetaLine doc={doc} />
          {/* Aperçu du contenu — 2 lignes max */}
          {doc.type === "textuel" && hasFicheContent(doc.contenu) ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-steel">{doc.contenu}</p>
          ) : null}
          {doc.type === "iconographique" && doc.image_url ? (
            <div className="relative mt-2 h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={doc.image_url}
                alt={doc.titre || `Document ${doc.letter}`}
                width={64}
                height={64}
                className="h-16 w-16 object-cover"
                unoptimized={doc.image_url.startsWith("blob:")}
              />
            </div>
          ) : null}
        </div>
      </Wrapper>
    );
  }

  /* ── Mode legacy (sommaire / lecture sans numero) ── */
  if (!complete) {
    return <DocCardSkeleton type={doc.type} />;
  }

  if (doc.type === "iconographique") {
    return (
      <div className="rounded-lg border border-border bg-panel p-4">
        <p className="text-sm font-semibold text-deep">
          Document {doc.letter} — {doc.titre}
        </p>
        <DocMetaChips doc={doc} />
        <div className="mt-3 flex gap-4">
          {doc.image_url ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={doc.image_url}
                alt={doc.titre || `Document ${doc.letter}`}
                width={80}
                height={80}
                className="h-20 w-20 object-cover"
                unoptimized={doc.image_url.startsWith("blob:")}
              />
            </div>
          ) : null}
          <SourceCitation html={doc.source_citation} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-sm font-semibold text-deep">
        Document {doc.letter} — {doc.titre}
      </p>
      <DocMetaChips doc={doc} />
      {mode === "lecture" ? (
        <p className="mt-2 text-sm leading-relaxed text-steel">{doc.contenu}</p>
      ) : null}
      <div className="mt-3">
        <SourceCitation html={doc.source_citation} />
      </div>
    </div>
  );
}

/** Ligne source compacte pour la vue détaillée — catégorie · repère temporel. */
function DocMetaLine({ doc }: { doc: DocumentFiche }) {
  const parts: string[] = [];
  if (doc.categorieLabel) parts.push(doc.categorieLabel);
  if (doc.repereTemporel?.trim()) parts.push(doc.repereTemporel.trim());
  if (doc.sourceType)
    parts.push(doc.sourceType === "primaire" ? "Source primaire" : "Source secondaire");

  if (parts.length === 0) return null;

  return <p className="mt-0.5 text-xs text-muted">{parts.join(" · ")}</p>;
}

/** Chips métadonnées enrichies — source type, repère temporel, catégorie. */
function DocMetaChips({ doc }: { doc: DocumentFiche }) {
  const chips: string[] = [];

  if (doc.sourceType) {
    chips.push(doc.sourceType === "primaire" ? "Primaire" : "Secondaire");
  }
  if (doc.repereTemporel?.trim()) {
    chips.push(doc.repereTemporel.trim());
  }
  if (doc.categorieLabel) {
    chips.push(doc.categorieLabel);
  }

  if (chips.length === 0) return null;

  return (
    <ChipBar className="mt-1.5 gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"
        >
          {chip}
        </span>
      ))}
    </ChipBar>
  );
}

function SourceCitation({ html }: { html: string }) {
  return (
    <div className="text-xs text-muted">
      <span className="font-medium">Source : </span>
      <span
        className="[&_em]:italic [&_p]:inline [&_strong]:font-semibold [&_u]:underline"
        dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(html) }}
      />
    </div>
  );
}

function DocCardSkeleton({ type }: { type: "textuel" | "iconographique" }) {
  if (type === "iconographique") {
    return (
      <div className="animate-pulse rounded-lg border border-border bg-panel p-4">
        <div className="flex gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface">
            <span className="material-symbols-outlined text-[2rem] text-muted" aria-hidden="true">
              image
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <div className="h-3.5 w-2/3 rounded bg-border" />
            <div className="h-3.5 w-full rounded bg-border" />
            <div className="h-3.5 w-4/5 rounded bg-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse rounded-lg border border-border bg-panel p-4">
      <div className="h-3.5 w-2/3 rounded bg-border" />
      <div className="mt-2 h-3.5 w-full rounded bg-border" />
      <div className="mt-2 h-3.5 w-4/5 rounded bg-border" />
    </div>
  );
}
