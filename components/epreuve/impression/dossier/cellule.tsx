import { cn } from "@/lib/utils/cn";
import { DocumentElementRenderer } from "@/components/document/renderer/element-renderer";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import previewStyles from "@/components/document/renderer/printable-fiche-preview.module.css";
import type { RendererDocument } from "@/lib/types/document-renderer";
import type { Span } from "@/lib/impression/layout-dossier-documentaire";
import styles from "./cellule.module.css";

type Props = {
  document: RendererDocument;
  /** Numéro global 1-based affiché dans le badge noir. */
  numero: number;
  /** Largeur occupée dans la grille (1 = demi-colonne, 2 = pleine largeur). */
  span: Span;
  /** Affiche le titre + badge si `true`. En mode sommatif, passer `false` :
   *  toute la ligne titre est omise et l'espace est récupéré. */
  titreVisible: boolean;
};

/**
 * Cellule unique de la grille dossier documentaire.
 *
 * Trois zones empilées :
 * 1. Ligne titre (badge numéro + titre) — omise si `titreVisible = false`
 *    ou titre vide.
 * 2. Cadre bordé : contenu (simple ou multi-colonnes pour perspectives /
 *    deux_temps), auteur, notes de bas de page.
 * 3. Source (HTML riche), hors cadre.
 *
 * La hauteur max de l'image est pilotée par la variable CSS
 * `--tache-print-document-figure-max-height`, définie par la classe de
 * cellule selon le span. Le renderer d'élément lit cette variable via la
 * feuille de styles partagée.
 */
export function DossierCellule({ document: doc, numero, span, titreVisible }: Props) {
  const titre = doc.titre.trim();
  const afficherTitre = titreVisible && titre.length > 0;
  const isSingle = doc.structure === "simple";
  const showAuteur = doc.structure === "perspectives";
  const showRepereTemporel = doc.structure === "deux_temps";

  return (
    <div className={cn(styles.cellule, span === 2 && styles.celluleSpan2)}>
      {/* Wrapper interne `width: fit-content` — titre, cadre et source y
          sont enfants directs. Combiné à `overflow-wrap: anywhere` sur la
          source, le wrapper prend la largeur du cadre quand le titre est
          court, ou la largeur de la cellule quand le titre est long
          (titre wrappé). */}
      <div className={styles.celluleInner}>
        {afficherTitre ? (
          <div className={styles.ligneTitre}>
            <span className={styles.numero} aria-label={`Document ${numero}`}>
              {numero}
            </span>
            <p className={styles.titre}>{titre}</p>
          </div>
        ) : null}

        <div className={styles.cadre}>
          {isSingle ? (
            doc.elements[0] ? (
              <DocumentElementRenderer
                element={doc.elements[0]}
                showAuteur={Boolean(doc.elements[0].auteur)}
                hideSource
              />
            ) : null
          ) : (
            <div
              className={styles.multicolonne}
              style={{ gridTemplateColumns: `repeat(${doc.elements.length}, 1fr)` }}
            >
              {doc.elements.map((el) => (
                <div key={el.id} className={styles.multicolonneColonne}>
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

        {isSingle ? (
          <SourceBloc source={doc.elements[0]?.source ?? ""} />
        ) : (
          <div
            className={styles.sourceMulticolonne}
            style={{ gridTemplateColumns: `repeat(${doc.elements.length}, 1fr)` }}
          >
            {doc.elements.map((el) => (
              <SourceBloc key={el.id} source={el.source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceBloc({ source }: { source: string }) {
  if (!htmlHasMeaningfulText(source)) {
    return <p className={previewStyles.documentSource}>—</p>;
  }
  return (
    <div
      className={cn(
        previewStyles.documentSource,
        previewStyles.htmlFlow,
        previewStyles.documentSourceValue,
      )}
      dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(source) }}
    />
  );
}
