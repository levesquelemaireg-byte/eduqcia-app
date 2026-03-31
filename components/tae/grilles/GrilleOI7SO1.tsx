import styles from "@/components/tae/grilles/eval-grid.module.css";
import { cn } from "@/lib/utils/cn";

const ID = "OI7_SO1";

/** Barème enchaînement logique / liens de causalité (OI7_SO1) — validée pixel-perfect (mars 2026) : 660px, contour 1px, graisse normale, col. 3 centrée sauf pied fusionné (gauche), fusion visuelle col. 3|points. */
export function GrilleOI7SO1() {
  const hRub = `${ID}__rubrique`;
  const hC1 = `${ID}__c1`;
  const hC2 = `${ID}__c2`;

  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, styles.tableOi7)} aria-label={`Outil ${ID}`}>
        <colgroup>
          <col className={styles.oi7ColRub} />
          <col className={styles.oi7ColCond} />
          <col className={styles.oi7ColDesc} />
          <col className={styles.oi7ColPts} />
        </colgroup>
        <tbody>
          <tr>
            <th className={cn(styles.cell, styles.cellRubrique)} id={hRub} rowSpan={6} scope="row">
              Établir des liens de causalité
            </th>
            <th
              className={cn(
                styles.cell,
                styles.cellCond,
                styles.noBorderRight,
                styles.doubleBottom,
              )}
              id={hC1}
              rowSpan={3}
              scope="row"
            >
              L’élève précise les trois éléments
            </th>
            <td
              className={cn(
                styles.cell,
                styles.cellDetail,
                styles.noBorderLeft,
                styles.noBorderRight,
              )}
              headers={`${hRub} ${hC1}`}
            >
              et établit correctement deux liens de causalité.
            </td>
            <td
              className={cn(styles.cell, styles.cellPoints, styles.noBorderLeft)}
              headers={`${hRub} ${hC1}`}
            >
              3 points
            </td>
          </tr>
          <tr>
            <td
              className={cn(
                styles.cell,
                styles.cellDetail,
                styles.noBorderLeft,
                styles.noBorderRight,
              )}
              headers={`${hRub} ${hC1}`}
            >
              et établit correctement un lien de causalité.
            </td>
            <td
              className={cn(styles.cell, styles.cellPoints, styles.noBorderLeft)}
              headers={`${hRub} ${hC1}`}
            >
              2 points
            </td>
          </tr>
          <tr>
            <td
              className={cn(
                styles.cell,
                styles.cellDetail,
                styles.noBorderLeft,
                styles.noBorderRight,
                styles.doubleBottom,
              )}
              headers={`${hRub} ${hC1}`}
            >
              mais n’établit correctement aucun lien de causalité.
            </td>
            <td
              className={cn(
                styles.cell,
                styles.cellPoints,
                styles.noBorderLeft,
                styles.doubleBottom,
              )}
              headers={`${hRub} ${hC1}`}
            >
              1 point
            </td>
          </tr>
          <tr>
            <th
              className={cn(
                styles.cell,
                styles.cellCond,
                styles.noBorderRight,
                styles.noBorderTop,
                styles.doubleBottom,
              )}
              id={hC2}
              rowSpan={2}
              scope="row"
            >
              L’élève précise deux éléments
            </th>
            <td
              className={cn(
                styles.cell,
                styles.cellDetail,
                styles.noBorderLeft,
                styles.noBorderRight,
                styles.noBorderTop,
              )}
              headers={`${hRub} ${hC2}`}
            >
              et établit correctement un lien de causalité.
            </td>
            <td
              className={cn(
                styles.cell,
                styles.cellPoints,
                styles.noBorderLeft,
                styles.noBorderTop,
              )}
              headers={`${hRub} ${hC2}`}
            >
              2 points
            </td>
          </tr>
          <tr>
            <td
              className={cn(
                styles.cell,
                styles.cellDetail,
                styles.noBorderLeft,
                styles.noBorderRight,
                styles.doubleBottom,
              )}
              headers={`${hRub} ${hC2}`}
            >
              mais n’établit correctement aucun lien de causalité.
            </td>
            <td
              className={cn(
                styles.cell,
                styles.cellPoints,
                styles.noBorderLeft,
                styles.doubleBottom,
              )}
              headers={`${hRub} ${hC2}`}
            >
              1 point
            </td>
          </tr>
          <tr>
            <td
              className={cn(
                styles.cell,
                styles.cellDetail,
                styles.oi7FooterMergedCell,
                styles.noBorderRight,
              )}
              colSpan={2}
              headers={hRub}
            >
              L’élève précise un seul élément ou n’en précise pas.
            </td>
            <td className={cn(styles.cell, styles.cellPoints, styles.noBorderLeft)} headers={hRub}>
              0 point
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
