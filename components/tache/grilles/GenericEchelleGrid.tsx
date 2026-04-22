import type { GrilleEntry } from "@/components/tache/wizard/bloc2/types";
import { grilleTextWithLockedParenGroups } from "@/components/tache/grilles/grille-text-nodes";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/tache/grilles/eval-grid.module.css";

function safeDomId(grilleId: string): string {
  return grilleId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

type Props = {
  entry: GrilleEntry;
};

/**
 * Grille standard : rubrique (rowspan 2) + une colonne par palier de points (données triées décroissant).
 */
export function GenericEchelleGrid({ entry }: Props) {
  const base = safeDomId(entry.id);
  const rubriqueId = `${base}__rubrique`;
  const sorted = [...entry.bareme.echelle].sort((a, b) => b.points - a.points);
  const colIds = sorted.map((_, i) => `${base}__col_${i}`);

  const ariaLabel = `Outil ${entry.id}`;

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-label={ariaLabel}>
        <colgroup>
          <col className={styles.colRubriqueNarrow} />
          {sorted.map((_, i) => (
            <col key={colIds[i]} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              id={rubriqueId}
              rowSpan={2}
              scope="row"
            >
              {grilleTextWithLockedParenGroups(entry.operation)}
            </th>
            {sorted.map((row, i) => (
              <th
                key={colIds[i]}
                className={cn(styles.cell, styles.cellPoints)}
                id={colIds[i]}
                scope="col"
              >
                {grilleTextWithLockedParenGroups(row.label)}
              </th>
            ))}
          </tr>
          <tr>
            {sorted.map((row, i) => (
              <td key={colIds[i]} className={styles.cell} headers={`${rubriqueId} ${colIds[i]}`}>
                {grilleTextWithLockedParenGroups(row.description)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
