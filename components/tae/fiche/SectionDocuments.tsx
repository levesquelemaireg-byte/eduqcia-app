import type { DocumentFiche } from "@/lib/types/fiche";
import { DocumentCardCompact } from "@/components/tae/fiche/DocumentCardCompact";
import { FICHE_SECTION_BODY_INSET, FICHE_SECTION_TITLE_CLASS } from "@/lib/ui/fiche-layout";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";

const EMPTY_DOC_TEXTUEL: DocumentFiche = {
  letter: "A",
  titre: "",
  contenu: "",
  source_citation: "",
  type: "textuel",
  image_url: null,
  imagePixelWidth: null,
  imagePixelHeight: null,
  printImpressionScale: 1,
  imageLegende: null,
  imageLegendePosition: null,
};

const EMPTY_DOC_ICONO: DocumentFiche = {
  letter: "B",
  titre: "",
  contenu: "",
  source_citation: "",
  type: "iconographique",
  image_url: null,
  imagePixelWidth: null,
  imagePixelHeight: null,
  printImpressionScale: 1,
  imageLegende: null,
  imageLegendePosition: null,
};

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
          <DocumentCardCompact doc={EMPTY_DOC_TEXTUEL} />
          <DocumentCardCompact doc={EMPTY_DOC_ICONO} />
        </div>
      ) : (
        <div className={`${FICHE_SECTION_BODY_INSET} flex flex-col gap-3`}>
          {documents.map((doc) => (
            <DocumentCardCompact key={doc.letter} doc={doc} />
          ))}
        </div>
      )}
    </section>
  );
}
