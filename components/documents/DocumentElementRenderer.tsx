import Image from "next/image";
import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";
import { extractFootnotes } from "@/lib/documents/extract-footnotes";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { sanitize } from "@/lib/fiche/helpers";
import type { DocumentElement } from "@/lib/types/document-renderer";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";

type Props = {
  element: DocumentElement;
  /** Afficher l'auteur (perspectives). */
  showAuteur?: boolean;
  /** Afficher le repère temporel en en-tête (deux_temps). */
  showRepereTemporel?: boolean;
  /** Masquer la source (rendue séparément hors cadre en mode print). */
  hideSource?: boolean;
};

/**
 * Rendu d'un élément de document (textuel ou iconographique).
 * Sous-composant de `DocumentCard` — pas de logique de structure ici.
 */
export function DocumentElementRenderer({
  element,
  showAuteur,
  showRepereTemporel,
  hideSource,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col">
      {showRepereTemporel && element.repereTemporel ? (
        <p className="mb-1 text-xs font-bold" style={{ fontSize: "12pt" }}>
          {element.repereTemporel}
        </p>
      ) : null}
      {showRepereTemporel && element.sousTitre ? (
        <p className="mb-2 text-xs font-bold" style={{ fontSize: "12pt" }}>
          {element.sousTitre}
        </p>
      ) : null}

      {element.type === "iconographique" ? (
        <figure className={styles.documentFigure}>
          <Image
            src={element.imageUrl}
            alt={element.legende || ""}
            width={660}
            height={400}
            className={styles.documentFigureImg}
            unoptimized={element.imageUrl.startsWith("blob:")}
          />
          {element.legende && element.legendePosition ? (
            <DocumentImageLegendOverlay text={element.legende} position={element.legendePosition} />
          ) : null}
        </figure>
      ) : (
        <div
          className={`${styles.documentBody} ${styles.htmlFlow}`}
          dangerouslySetInnerHTML={{ __html: sanitize(element.contenu) }}
        />
      )}

      {showAuteur && element.auteur ? (
        <p className="mt-2 text-right italic" style={{ fontSize: "12pt" }}>
          {element.auteur}
        </p>
      ) : null}

      {element.type === "textuel" ? <FootnoteDefinitions html={element.contenu} /> : null}

      {!hideSource ? (
        <div
          className={`${styles.documentSource} ${styles.htmlFlow} ${styles.documentSourceValue}`}
          dangerouslySetInnerHTML={{
            __html: sourceCitationDisplayHtml(element.source),
          }}
        />
      ) : null}
    </div>
  );
}

/** Notes de bas de page extraites du HTML — rendu print/aperçu impression. */
function FootnoteDefinitions({ html }: { html: string }) {
  const notes = extractFootnotes(html);
  if (notes.length === 0) return null;
  return (
    <div className={styles.documentFootnotes}>
      {notes.map((n) => (
        <p key={n.noteId}>
          {n.noteId}. {n.definition}
        </p>
      ))}
    </div>
  );
}
