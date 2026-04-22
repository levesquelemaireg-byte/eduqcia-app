import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
import type { RendererDocument } from "@/lib/types/document-renderer";
import styles from "@/components/tache/wizard/preview/printable-fiche-preview.module.css";

type Props = {
  document: RendererDocument;
  /** Numéro affiché dans le bandeau (1, 2, 3…). */
  numero?: number;
};

/**
 * Composant central de rendu d'un document historique.
 *
 * Gère les trois structures (simple, perspectives, deux_temps) avec un
 * branchement interne. Les wrappers spécialisés (Print, Sommaire, Reader,
 * Thumbnail) consomment ce composant.
 *
 * Réutilise les styles de `printable-fiche-preview.module.css` pour
 * l'alignement pixel-perfect avec le rendu print existant.
 */
export function DocumentCard({ document: doc, numero }: Props) {
  const titre = doc.titre.trim();

  return (
    <div className={styles.documentCell} data-doc-structure={doc.structure}>
      {/* En-tête : numéro + titre */}
      <p className={styles.documentHeaderLine}>
        {numero != null ? `Document ${numero} — ` : ""}
        {titre || "Sans titre"}
      </p>

      {/* Contenu selon la structure */}
      {doc.structure === "simple" ? (
        <SimpleLayout element={doc.elements[0]} />
      ) : doc.structure === "perspectives" ? (
        <ColumnsLayout elements={doc.elements} showAuteur />
      ) : (
        <ColumnsLayout elements={doc.elements} showRepereTemporel />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layouts internes
// ---------------------------------------------------------------------------

function SimpleLayout({ element }: { element: RendererDocument["elements"][number] }) {
  if (!element) return null;
  return (
    <div className="mt-2">
      <DocumentElementRenderer element={element} showAuteur={Boolean(element.auteur)} />
    </div>
  );
}

function ColumnsLayout({
  elements,
  showAuteur,
  showRepereTemporel,
}: {
  elements: RendererDocument["elements"];
  showAuteur?: boolean;
  showRepereTemporel?: boolean;
}) {
  const colCount = elements.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${colCount}, 1fr)`,
        /* Stretch séparateurs bord à bord du cadre */
        margin: "-0.4rem -0.5rem",
      }}
      className="mt-2"
    >
      {elements.map((el) => (
        <div key={el.id} className="border-l border-l-border px-2 py-[0.4rem] first:border-l-0">
          <DocumentElementRenderer
            element={el}
            showAuteur={showAuteur}
            showRepereTemporel={showRepereTemporel}
          />
        </div>
      ))}
    </div>
  );
}
