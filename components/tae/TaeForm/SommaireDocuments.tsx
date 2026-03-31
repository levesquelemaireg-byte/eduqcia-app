"use client";

import Image from "next/image";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import {
  computeSlotStatus,
  getSlotData,
  slotLetter,
  type DocumentSlotData,
} from "@/lib/tae/document-helpers";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import {
  sourceCitationDisplayHtml,
  stripHtmlToPlainText,
} from "@/lib/documents/source-citation-html";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";

function TextCard({ slotId, slot }: { slotId: DocumentSlotId; slot: DocumentSlotData }) {
  const letter = slotLetter(slotId);
  const titre = slot.titre.trim();
  const contenu = slot.contenu.trim();
  const hasSource = htmlHasMeaningfulText(slot.source_citation);

  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-sm font-semibold text-deep">
        Document {letter} — {titre ? titre : <span className="italic text-muted">Sans titre</span>}
      </p>
      {contenu ? (
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-steel">{contenu}</p>
      ) : null}
      {hasSource ? (
        <div className="mt-3 text-xs text-muted">
          <span className="font-medium">Source : </span>
          <span
            className="[&_em]:italic [&_p]:inline [&_strong]:font-semibold [&_u]:underline"
            dangerouslySetInnerHTML={{
              __html: sourceCitationDisplayHtml(slot.source_citation),
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ImageCard({ slotId, slot }: { slotId: DocumentSlotId; slot: DocumentSlotData }) {
  const letter = slotLetter(slotId);
  const titre = slot.titre.trim();
  const hasSource = htmlHasMeaningfulText(slot.source_citation);

  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-sm font-semibold text-deep">
        Document {letter} — {titre ? titre : <span className="italic text-muted">Sans titre</span>}
      </p>
      <div className="mt-2">
        {slot.imageUrl ? (
          <div className="relative h-48 w-full">
            <Image
              src={slot.imageUrl}
              alt={titre || `Document ${letter}`}
              fill
              className="rounded-lg border border-border object-contain"
              sizes="(max-width: 768px) 100vw, 42rem"
              unoptimized={slot.imageUrl.startsWith("blob:")}
            />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-surface">
            <span className="material-symbols-outlined text-[2em] text-muted" aria-hidden="true">
              image
            </span>
          </div>
        )}
      </div>
      {hasSource ? (
        <div className="mt-3 text-xs text-muted">
          <span className="font-medium">Source : </span>
          <span
            className="[&_em]:italic [&_p]:inline [&_strong]:font-semibold [&_u]:underline"
            dangerouslySetInnerHTML={{
              __html: sourceCitationDisplayHtml(slot.source_citation),
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function IncompleteCard({ slotId }: { slotId: DocumentSlotId }) {
  const letter = slotLetter(slotId);
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-4 text-center">
      <p className="text-sm italic text-muted">Document {letter} — à compléter</p>
    </div>
  );
}

type SommaireDocumentsProps = {
  /** Si fourni (ex. sommaire global déjà debouncé), évite un second debounce. */
  debouncedDocuments?: Partial<Record<DocumentSlotId, DocumentSlotData>>;
};

export function SommaireDocuments({ debouncedDocuments }: SommaireDocumentsProps = {}) {
  const { state } = useTaeForm();
  const internalDebounced = useDebouncedValue(state.bloc4.documents, 300);
  const debouncedDocs = debouncedDocuments ?? internalDebounced;
  const slots = state.bloc2.documentSlots;

  if (slots.length === 0) return null;

  return (
    <section aria-labelledby="sommaire-documents" className="mt-6 border-t border-border pt-6">
      <h4
        id="sommaire-documents"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span
          className="material-symbols-outlined text-[1em]"
          aria-hidden="true"
          title={materialIconTooltip("docs")}
        >
          docs
        </span>
        {ficheDocumentsSectionTitle(slots.length)}
      </h4>
      <div className="mt-3 space-y-3">
        {slots.map(({ slotId }) => {
          const slot = getSlotData(debouncedDocs, slotId);
          const st = computeSlotStatus(slot);
          if (st !== "complete") {
            return <IncompleteCard key={slotId} slotId={slotId} />;
          }
          if (slot.mode === "reuse") {
            return (
              <div key={slotId} className="rounded-lg border border-border bg-panel p-4">
                <p className="text-sm font-semibold text-deep">{slot.titre}</p>
                <p className="mt-1 text-xs text-muted">
                  {slot.reuse_author} · {stripHtmlToPlainText(slot.reuse_source_citation)}
                </p>
              </div>
            );
          }
          if (slot.type === "iconographique") {
            return <ImageCard key={slotId} slotId={slotId} slot={slot} />;
          }
          return <TextCard key={slotId} slotId={slotId} slot={slot} />;
        })}
      </div>
    </section>
  );
}
