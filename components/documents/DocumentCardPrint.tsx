import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import type { RendererDocument } from "@/lib/types/document-renderer";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import { cn } from "@/lib/utils/cn";

type Props = {
  document: RendererDocument;
  /** Numéro affiché dans le bandeau noir (1, 2, 3…). */
  numero?: number;
};

/**
 * Rendu pixel-perfect d'un document pour impression / export PDF.
 *
 * 3 zones empilées : ligne titre (badge + titre) au-dessus du cadre,
 * cadre bordé (contenu + auteur), source en dessous hors cadre.
 *
 * Spec : `docs/specs/document-renderer.md` §4.1, §5.3.
 */
export function DocumentCardPrint({ document: doc, numero }: Props) {
  const titre = doc.titre.trim();
  const isSingle = doc.structure === "simple";
  const showAuteur = doc.structure === "perspectives";
  const showRepereTemporel = doc.structure === "deux_temps";
  const hasNumero = numero != null;

  return (
    <div className={styles.paper}>
      <div className={styles.documentWrapper}>
        {/* Zone 1 : ligne titre (badge numéro + titre) — hors cadre */}
        <div className={styles.documentHeader}>
          {hasNumero ? (
            <div className={styles.documentNumero} aria-label={`Document ${numero}`}>
              {numero}
            </div>
          ) : null}
          <p className={styles.documentHeaderLine}>{titre || "Sans titre"}</p>
        </div>

        {/* Zone 2 : cadre bordé — contenu + auteur uniquement */}
        <div className={styles.documentCell} data-doc-structure={doc.structure}>
          {isSingle ? (
            <div>
              {doc.elements[0] ? (
                <DocumentElementRenderer
                  element={doc.elements[0]}
                  showAuteur={Boolean(doc.elements[0].auteur)}
                  hideSource
                />
              ) : null}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${doc.elements.length}, 1fr)`,
                /* Stretch séparateurs bord à bord du cadre */
                margin: "-0.4rem -0.5rem",
              }}
            >
              {doc.elements.map((el) => (
                <div
                  key={el.id}
                  className="border-l border-l-[#333] px-2 py-[0.4rem] first:border-l-0"
                >
                  <DocumentElementRenderer
                    element={el}
                    showAuteur={showAuteur}
                    showRepereTemporel={showRepereTemporel}
                    hideSource
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zone 3 : source — hors cadre, sous le cadre bordé */}
        {doc.elements.length === 1 ? (
          <PrintSource source={doc.elements[0].source} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${doc.elements.length}, 1fr)`,
            }}
          >
            {doc.elements.map((el) => (
              <PrintSource key={el.id} source={el.source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrintSource({ source }: { source: string }) {
  if (!htmlHasMeaningfulText(source)) {
    return <p className={styles.documentSource}>—</p>;
  }
  return (
    <div
      className={cn(styles.documentSource, styles.htmlFlow, styles.documentSourceValue)}
      dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(source) }}
    />
  );
}
