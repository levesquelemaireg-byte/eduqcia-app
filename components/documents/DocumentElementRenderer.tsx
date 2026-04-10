import Image from "next/image";
import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import type { DocumentElement } from "@/lib/types/document-renderer";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";

type Props = {
  element: DocumentElement;
  /** Afficher l'auteur (perspectives). */
  showAuteur?: boolean;
  /** Afficher le repère temporel en en-tête (deux_temps). */
  showRepereTemporel?: boolean;
};

/**
 * Rendu d'un élément de document (textuel ou iconographique).
 * Sous-composant de `DocumentCard` — pas de logique de structure ici.
 */
export function DocumentElementRenderer({ element, showAuteur, showRepereTemporel }: Props) {
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
          dangerouslySetInnerHTML={{ __html: element.contenu }}
        />
      )}

      {showAuteur && element.auteur ? (
        <p className="mt-2 text-right italic" style={{ fontSize: "12pt" }}>
          {element.auteur}
        </p>
      ) : null}

      <div className={styles.documentSource}>
        <div className={styles.documentSourceRow}>
          <span className={styles.documentSourceLabel}>Source : </span>
          <span
            className={`${styles.documentSourceValue} ${styles.htmlFlow}`}
            dangerouslySetInnerHTML={{
              __html: sourceCitationDisplayHtml(element.source),
            }}
          />
        </div>
      </div>
    </div>
  );
}
