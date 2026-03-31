import Image from "next/image";
import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import type { DocumentFiche } from "@/lib/types/fiche";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";

type Props = {
  doc: DocumentFiche;
};

export function DocumentCard({ doc }: Props) {
  const hasTitle = doc.titre.trim().length > 0;
  const hasBody =
    doc.type === "textuel"
      ? hasFicheContent(doc.contenu)
      : Boolean(doc.image_url && doc.image_url.length > 0);
  const hasSource = htmlHasMeaningfulText(doc.source_citation);
  const hasAny = hasTitle && hasBody && hasSource;

  if (!hasAny) {
    if (doc.type === "iconographique") {
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

  if (doc.type === "iconographique") {
    return (
      <div className="rounded-lg border border-border bg-panel p-4">
        <p className="text-sm font-semibold text-deep">
          Document {doc.letter} — {hasTitle ? doc.titre : ""}
        </p>
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
              {doc.imageLegende && doc.imageLegendePosition ? (
                <DocumentImageLegendOverlay
                  text={doc.imageLegende}
                  position={doc.imageLegendePosition}
                  compact
                />
              ) : null}
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface">
              <span
                className="material-symbols-outlined text-[1.5em] text-muted"
                aria-hidden="true"
              >
                image
              </span>
            </div>
          )}
          <div className="text-xs text-muted">
            <span className="font-medium">Source : </span>
            <span
              className="[&_em]:italic [&_p]:inline [&_strong]:font-semibold [&_u]:underline"
              dangerouslySetInnerHTML={{
                __html: sourceCitationDisplayHtml(doc.source_citation),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-sm font-semibold text-deep">
        Document {doc.letter} — {doc.titre}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-steel">{doc.contenu}</p>
      <div className="mt-3 text-xs text-muted">
        <span className="font-medium">Source : </span>
        <span
          className="[&_em]:italic [&_p]:inline [&_strong]:font-semibold [&_u]:underline"
          dangerouslySetInnerHTML={{
            __html: sourceCitationDisplayHtml(doc.source_citation),
          }}
        />
      </div>
    </div>
  );
}
