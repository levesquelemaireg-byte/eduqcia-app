import styles from "@/components/tache/grilles/eval-grid.module.css";
import { grilleTextWithLockedParenGroups } from "@/components/tache/grilles/grille-text-nodes";
import {
  OI3_SO5_CONDITION_LINES,
  OI3_SO5_FOOTER_LINES,
  OI3_SO5_ROW_DETAIL_1,
  OI3_SO5_ROW_DETAIL_2,
  OI3_SO5_ROW_DETAIL_4,
  Oi3So5Lines,
  Oi3So5RowDetail3Content,
} from "@/components/tache/grilles/oi3-so5-lines";
import { cn } from "@/lib/utils/cn";

const ID = "OI3_SO5";

/**
 * Barème « comparer des points de vue » — **4 colonnes** : rubrique | condition | libellé | points
 * (fusion visuelle cond|libellé et libellé|points via `noBorderRight` / `noBorderLeft` ; pied : **colSpan 2** sur cond+libellé).
 */
export function GrilleOI3SO5() {
  const hRub = `${ID}__rubrique`;
  const hCond = `${ID}__cond`;
  const hdr = `${hRub} ${hCond}`;

  const tdDetail = cn(styles.cell, styles.noBorderLeft, styles.noBorderRight, styles.oi3CellDetail);
  const tdPts = cn(styles.cell, styles.noBorderLeft, styles.oi3CellPts);

  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, styles.tableOi3So5)} aria-label={`Outil ${ID}`}>
        <colgroup>
          <col className={styles.oi3ColRub} />
          <col className={styles.oi3ColCond} />
          <col className={styles.oi3ColDetailText} />
          <col className={styles.oi3ColPts} />
        </colgroup>
        <tbody>
          <tr>
            <th className={cn(styles.cell, styles.cellRubrique)} id={hRub} rowSpan={5} scope="row">
              Dégager des
              <br />
              différences et
              <br />
              des similitudes
            </th>
            <th
              className={cn(styles.cell, styles.cellCond, styles.noBorderRight)}
              id={hCond}
              rowSpan={4}
              scope="row"
            >
              <Oi3So5Lines lines={OI3_SO5_CONDITION_LINES} />
            </th>
            <td className={tdDetail} headers={hdr}>
              {grilleTextWithLockedParenGroups(OI3_SO5_ROW_DETAIL_1)}
            </td>
            <td className={tdPts} headers={hdr}>
              3 points
            </td>
          </tr>
          <tr>
            <td className={tdDetail} headers={hdr}>
              {grilleTextWithLockedParenGroups(OI3_SO5_ROW_DETAIL_2)}
            </td>
            <td className={tdPts} headers={hdr}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={tdDetail} headers={hdr}>
              <Oi3So5RowDetail3Content />
            </td>
            <td className={tdPts} headers={hdr}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDetail} headers={hdr}>
              {grilleTextWithLockedParenGroups(OI3_SO5_ROW_DETAIL_4)}
            </td>
            <td className={tdPts} headers={hdr}>
              0 point
            </td>
          </tr>
          <tr className={styles.doubleSepTop}>
            <td
              className={cn(styles.cell, styles.oi3FooterTextCell, styles.noBorderRight)}
              colSpan={2}
              headers={hdr}
            >
              {grilleTextWithLockedParenGroups(OI3_SO5_FOOTER_LINES)}
            </td>
            <td className={tdPts} headers={hdr}>
              0 point
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
