import type { PageDossier } from "@/lib/impression/layout-dossier-documentaire";
import type { RendererDocument } from "@/lib/types/document-renderer";
import { DossierCellule } from "./cellule";
import styles from "./cellule.module.css";

type Props = {
  /** Une page produite par `placerDocuments` (structure logique du layout). */
  page: PageDossier;
  /**
   * Map {id → document source}. Chaque cellule de `page` référence un document
   * par son id ; la source complète est résolue via cette map. Construit par
   * le pipeline en amont (lot C).
   */
  sources: Map<string, RendererDocument>;
  /** En mode sommatif (épreuves ministérielles), `false` masque tous les titres. */
  titresVisibles: boolean;
};

/**
 * Rendu CSS Grid d'une page du dossier documentaire.
 *
 * La structure de placement (rangées × cellules, span 1 ou 2) est décidée
 * par `placerDocuments`. Ce composant ne fait que traduire cette structure
 * en `grid-template-columns: 1fr 1fr` avec `grid-column: span 2` sur les
 * cellules pleine largeur.
 *
 * Les rangées sont aplaties via `display: contents` : la grille voit
 * directement les cellules, ce qui évite une imbrication grid-dans-grid
 * tout en conservant la lisibilité de la structure JSX.
 */
export function DossierGrille({ page, sources, titresVisibles }: Props) {
  return (
    <div className={styles.grille}>
      {page.rangees.map((rangee, rIdx) => (
        <div key={rIdx} className={styles.rangee}>
          {rangee.cellules.map((cellule) => {
            const source = sources.get(cellule.document.id);
            if (!source) return null;
            return (
              <DossierCellule
                key={cellule.document.id}
                document={source}
                numero={cellule.document.numero}
                span={cellule.span}
                titreVisible={titresVisibles}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
