import { DocumentCard } from "@/components/documents/DocumentCard";
import { documentFicheVersRenderer } from "@/lib/documents/document-fiche-vers-renderer";
import type { DocumentFiche } from "@/lib/types/fiche";
import { FICHE_SECTION_BODY_INSET, FICHE_SECTION_TITLE_CLASS } from "@/lib/ui/fiche-layout";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";

type Props = {
  documents: DocumentFiche[];
};

export function SectionDocuments({ documents }: Props) {
  const title = ficheDocumentsSectionTitle(documents.length);

  return (
    <section>
      <h3 className={FICHE_SECTION_TITLE_CLASS}>
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          docs
        </span>
        {title}
      </h3>
      {documents.length === 0 ? (
        <div
          className={`${FICHE_SECTION_BODY_INSET} flex flex-col gap-3`}
          aria-label="Emplacements documents textuel et iconographique"
        >
          <DocumentPlaceholder type="textuel" />
          <DocumentPlaceholder type="iconographique" />
        </div>
      ) : (
        <div className={`${FICHE_SECTION_BODY_INSET} flex flex-col gap-3`}>
          {documents.map((doc) => (
            <div key={doc.letter} className="rounded-lg border border-border bg-panel p-4">
              <DocumentCard document={documentFicheVersRenderer(doc)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Placeholder skeleton pour un emplacement document vide. */
function DocumentPlaceholder({ type }: { type: "textuel" | "iconographique" }) {
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
