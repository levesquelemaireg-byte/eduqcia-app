import styles from "@/components/tache/grilles/eval-grid.module.css";
import { cn } from "@/lib/utils/cn";

const ID = "CD1_SCHEMA";

/**
 * Grille CD1 — Schéma de caractérisation (Section B).
 * Référence visuelle : docs/image/GRILLE-SCHEMA-CD1-SECTION-B.png.
 *
 * 5 colonnes (660 px) : label mise en relation | élément central | détail | points | /N section.
 *
 * Structure :
 * - Section objet (/2) : en-tête + 1 ligne body imbriquant 3 sous-cellules égales (2 pts / 1 pt / 0 pt).
 * - Bandeau « Préciser les éléments mis en relation ».
 * - Première mise en relation (/3) — 8 lignes : 3 niveaux d'élément central (rowspan 3, 3, 2).
 * - Deuxième mise en relation (/3) — même structure.
 * - Pied : Total /8.
 */
export function GrilleCD1Schema() {
  const hObjet = `${ID}__objet`;
  const hMEH = `${ID}__mise_header`;
  const hM1 = `${ID}__mise1`;
  const hM2 = `${ID}__mise2`;
  const hM1_N1 = `${ID}__m1_n1`;
  const hM1_N2 = `${ID}__m1_n2`;
  const hM1_N3 = `${ID}__m1_n3`;
  const hM2_N1 = `${ID}__m2_n1`;
  const hM2_N2 = `${ID}__m2_n2`;
  const hM2_N3 = `${ID}__m2_n3`;

  const tdDetail = cn(styles.cell, styles.cellDetail);
  const tdPts = cn(styles.cell, styles.cellPoints);
  /** Sous-rangée de continuation à l'intérieur d'un groupe d'élément central — pas de bordure supérieure. */
  const tdDetailCont = cn(styles.cell, styles.cellDetail, styles.noBorderTop);
  const tdPtsCont = cn(styles.cell, styles.cellPoints, styles.noBorderTop);

  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, styles.tableCd1Schema)} aria-label={`Outil ${ID}`}>
        <colgroup>
          <col className={styles.cd1ColLabel} />
          <col className={styles.cd1ColCentral} />
          <col className={styles.cd1ColDetail} />
          <col className={styles.cd1ColPoints} />
          <col className={styles.cd1ColTotal} />
        </colgroup>
        <tbody>
          {/* ═══ Section objet — en-tête + body 3 sous-cellules égales ═══ */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              id={hObjet}
              colSpan={4}
              scope="colgroup"
            >
              Indiquer l&rsquo;objet de la description
            </th>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              rowSpan={2}
              scope="col"
              aria-label="Sous-total section objet"
            >
              / 2
            </th>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cd1ObjetBodyCell)} colSpan={4} headers={hObjet}>
              <table className={styles.cd1NestedTable}>
                <tbody>
                  <tr>
                    <td
                      className={cn(styles.cd1ObjetSubCell, styles.cd1ObjetSubCellFirst)}
                      headers={hObjet}
                    >
                      <div>L&rsquo;élève indique correctement l&rsquo;objet de la description.</div>
                      <div className={styles.cd1ObjetSubPts}>2 points</div>
                    </td>
                    <td className={styles.cd1ObjetSubCell} headers={hObjet}>
                      <div>
                        L&rsquo;élève indique plus ou moins correctement l&rsquo;objet de la
                        description.
                      </div>
                      <div className={styles.cd1ObjetSubPts}>1 point</div>
                    </td>
                    <td className={styles.cd1ObjetSubCell} headers={hObjet}>
                      <div>
                        L&rsquo;élève indique incorrectement ou n&rsquo;indique pas l&rsquo;objet de
                        la description.
                      </div>
                      <div className={styles.cd1ObjetSubPts}>0 point</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* ═══ Bandeau « Préciser les éléments mis en relation » ═══ */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              id={hMEH}
              colSpan={5}
              scope="colgroup"
            >
              Préciser les éléments mis en relation
            </th>
          </tr>

          {/* ═══ Première mise en relation — 8 lignes ═══ */}
          {/* Élément central « correctement » (rowspan=3) */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellRubrique, styles.cd1MiseLabel)}
              id={hM1}
              rowSpan={8}
              scope="rowgroup"
            >
              Première mise en relation
            </th>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hM1_N1}
              rowSpan={3}
              scope="rowgroup"
            >
              L&rsquo;élève précise correctement l&rsquo;élément central
            </th>
            <td className={tdDetail} headers={`${hM1} ${hM1_N1}`}>
              et précise les deux autres éléments.
            </td>
            <td className={tdPts} headers={`${hM1} ${hM1_N1}`}>
              3 points
            </td>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              rowSpan={8}
              scope="col"
              aria-label="Sous-total première mise en relation"
            >
              / 3
            </th>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM1} ${hM1_N1}`}>
              et précise l&rsquo;un des deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM1} ${hM1_N1}`}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM1} ${hM1_N1}`}>
              mais ne précise pas les deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM1} ${hM1_N1}`}>
              1 point
            </td>
          </tr>

          {/* Élément central « plus ou moins correctement » (rowspan=3) */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hM1_N2}
              rowSpan={3}
              scope="rowgroup"
            >
              L&rsquo;élève précise plus ou moins correctement l&rsquo;élément central
            </th>
            <td className={tdDetail} headers={`${hM1} ${hM1_N2}`}>
              et précise les deux autres éléments.
            </td>
            <td className={tdPts} headers={`${hM1} ${hM1_N2}`}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM1} ${hM1_N2}`}>
              et précise l&rsquo;un des deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM1} ${hM1_N2}`}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM1} ${hM1_N2}`}>
              mais ne précise pas les deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM1} ${hM1_N2}`}>
              0 point
            </td>
          </tr>

          {/* Élément central « incorrectement ou ne précise pas » (rowspan=2) */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hM1_N3}
              rowSpan={2}
              scope="rowgroup"
            >
              L&rsquo;élève précise incorrectement ou ne précise pas l&rsquo;élément central
            </th>
            <td className={tdDetail} headers={`${hM1} ${hM1_N3}`}>
              mais précise les deux autres éléments.
            </td>
            <td className={tdPts} headers={`${hM1} ${hM1_N3}`}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM1} ${hM1_N3}`}>
              mais précise l&rsquo;un des deux autres éléments ou n&rsquo;en précise aucun.
            </td>
            <td className={tdPtsCont} headers={`${hM1} ${hM1_N3}`}>
              0 point
            </td>
          </tr>

          {/* ═══ Deuxième mise en relation — 8 lignes, structure identique ═══ */}
          {/* Séparation épaisse entre première et deuxième mise en relation. */}
          <tr className={styles.doubleSepTop}>
            <th
              className={cn(styles.cell, styles.cellRubrique, styles.cd1MiseLabel)}
              id={hM2}
              rowSpan={8}
              scope="rowgroup"
            >
              Deuxième mise en relation
            </th>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hM2_N1}
              rowSpan={3}
              scope="rowgroup"
            >
              L&rsquo;élève précise correctement l&rsquo;élément central
            </th>
            <td className={tdDetail} headers={`${hM2} ${hM2_N1}`}>
              et précise les deux autres éléments.
            </td>
            <td className={tdPts} headers={`${hM2} ${hM2_N1}`}>
              3 points
            </td>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              rowSpan={8}
              scope="col"
              aria-label="Sous-total deuxième mise en relation"
            >
              / 3
            </th>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM2} ${hM2_N1}`}>
              et précise l&rsquo;un des deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM2} ${hM2_N1}`}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM2} ${hM2_N1}`}>
              mais ne précise pas les deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM2} ${hM2_N1}`}>
              1 point
            </td>
          </tr>

          <tr>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hM2_N2}
              rowSpan={3}
              scope="rowgroup"
            >
              L&rsquo;élève précise plus ou moins correctement l&rsquo;élément central
            </th>
            <td className={tdDetail} headers={`${hM2} ${hM2_N2}`}>
              et précise les deux autres éléments.
            </td>
            <td className={tdPts} headers={`${hM2} ${hM2_N2}`}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM2} ${hM2_N2}`}>
              et précise l&rsquo;un des deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM2} ${hM2_N2}`}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM2} ${hM2_N2}`}>
              mais ne précise pas les deux autres éléments.
            </td>
            <td className={tdPtsCont} headers={`${hM2} ${hM2_N2}`}>
              0 point
            </td>
          </tr>

          <tr>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hM2_N3}
              rowSpan={2}
              scope="rowgroup"
            >
              L&rsquo;élève précise incorrectement ou ne précise pas l&rsquo;élément central
            </th>
            <td className={tdDetail} headers={`${hM2} ${hM2_N3}`}>
              mais précise les deux autres éléments.
            </td>
            <td className={tdPts} headers={`${hM2} ${hM2_N3}`}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDetailCont} headers={`${hM2} ${hM2_N3}`}>
              mais précise l&rsquo;un des deux autres éléments ou n&rsquo;en précise aucun.
            </td>
            <td className={tdPtsCont} headers={`${hM2} ${hM2_N3}`}>
              0 point
            </td>
          </tr>

          {/* ═══ Total /8 ═══ */}
          <tr className={styles.cd1TotalRow}>
            <td className={cn(styles.cell, styles.cellDetail)} colSpan={4}>
              Total
            </td>
            <td className={cn(styles.cell, styles.cellPoints)}>/ 8</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
