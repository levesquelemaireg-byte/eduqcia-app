import styles from "@/components/tache/grilles/eval-grid.module.css";
import { cn } from "@/lib/utils/cn";

const ID = "CD2_INTERPRETATION";

/**
 * Grille CD2 — Interpréter une réalité historique (Section C).
 * Référence visuelle : `docs/imports/grille-cd2-section-c.png`.
 *
 * 7 colonnes (660 px) :
 *   label rangée | indiquer descripteur | indiquer points |
 *   appuyer manière | présente faits | appuyer points | sous-total /N
 *
 * Structure :
 * - 2 sections identiques (« Premier élément de réponse », « Deuxième élément
 *   de réponse »), chacune sur 3 lignes (2 pts / 1 pt / 0 pt) avec sous-total /4.
 * - 2 critères évalués en parallèle pour chaque élément :
 *     * « Indiquer les éléments de réponse » — descripteur + points par niveau.
 *     * « Appuyer les éléments de réponse par des faits » — descripteur de
 *       manière (appropriée / plus ou moins / inappropriée) + cellule
 *       « L'élève présente des faits » à rowspan variable
 *       (rowspan=2 « exacts et pertinents » couvrant 2 pts + 1 pt ;
 *        rowspan=1 « inexacts » pour 0 pt).
 * - Pied : Total /8.
 *
 * Composant standalone — non encore branché à un parcours wizard (Section C
 * non implémentée). Disponible dans le registry pour consommation future.
 */
export function GrilleCD2Interpretation() {
  const hHeaderIndiquer = `${ID}__header_indiquer`;
  const hHeaderAppuyer = `${ID}__header_appuyer`;
  const hElement1 = `${ID}__element1`;
  const hElement2 = `${ID}__element2`;

  const tdDescr = cn(styles.cell, styles.cellDetail);
  const tdPts = cn(styles.cell, styles.cellPoints);
  const tdLabel = cn(styles.cell, styles.cellRubrique, styles.cd2ElementLabel);
  const tdSubtotal = cn(styles.cell, styles.cellRubrique);

  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, styles.tableCd2Interpretation)} aria-label={`Outil ${ID}`}>
        <colgroup>
          <col className={styles.cd2ColLabel} />
          <col className={styles.cd2ColIndiquerDescr} />
          <col className={styles.cd2ColIndiquerPts} />
          <col className={styles.cd2ColAppuyerManiere} />
          <col className={styles.cd2ColAppuyerFaits} />
          <col className={styles.cd2ColAppuyerPts} />
          <col className={styles.cd2ColTotal} />
        </colgroup>
        <thead>
          <tr>
            <th className={cn(styles.cell, styles.cellRubrique)} aria-hidden="true" />
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              id={hHeaderIndiquer}
              colSpan={2}
              scope="colgroup"
            >
              Indiquer les éléments de réponse
            </th>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              id={hHeaderAppuyer}
              colSpan={3}
              scope="colgroup"
            >
              Appuyer les éléments de réponse par des faits
            </th>
            <th className={cn(styles.cell, styles.cellRubrique)} aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {/* ═══ Premier élément de réponse — 3 lignes ═══ */}
          <tr>
            <th className={tdLabel} id={hElement1} rowSpan={3} scope="rowgroup">
              Premier élément de réponse
            </th>
            <td className={tdDescr} headers={`${hHeaderIndiquer} ${hElement1}`}>
              L&rsquo;élève indique l&rsquo;élément de réponse correctement.
            </td>
            <td className={tdPts} headers={`${hHeaderIndiquer} ${hElement1}`}>
              2 points
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement1}`}>
              L&rsquo;élève appuie l&rsquo;élément de réponse de manière appropriée.
            </td>
            <td className={tdDescr} rowSpan={2} headers={`${hHeaderAppuyer} ${hElement1}`}>
              L&rsquo;élève présente des faits exacts et pertinents.
            </td>
            <td className={tdPts} headers={`${hHeaderAppuyer} ${hElement1}`}>
              2 points
            </td>
            <td
              className={tdSubtotal}
              rowSpan={3}
              scope="col"
              aria-label="Sous-total premier élément de réponse"
            >
              / 4
            </td>
          </tr>
          <tr>
            <td className={tdDescr} headers={`${hHeaderIndiquer} ${hElement1}`}>
              L&rsquo;élève indique l&rsquo;élément de réponse plus ou moins correctement.
            </td>
            <td className={tdPts} headers={`${hHeaderIndiquer} ${hElement1}`}>
              1 point
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement1}`}>
              L&rsquo;élève appuie l&rsquo;élément de réponse de manière plus ou moins appropriée.
            </td>
            <td className={tdPts} headers={`${hHeaderAppuyer} ${hElement1}`}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDescr} headers={`${hHeaderIndiquer} ${hElement1}`}>
              L&rsquo;élève indique incorrectement ou n&rsquo;indique pas l&rsquo;élément de
              réponse.
            </td>
            <td className={tdPts} headers={`${hHeaderIndiquer} ${hElement1}`}>
              0 point
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement1}`}>
              L&rsquo;élève appuie l&rsquo;élément de réponse de manière inappropriée.
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement1}`}>
              L&rsquo;élève présente des faits inexacts.
            </td>
            <td className={tdPts} headers={`${hHeaderAppuyer} ${hElement1}`}>
              0 point
            </td>
          </tr>

          {/* ═══ Deuxième élément de réponse — 3 lignes (séparation épaisse en haut) ═══ */}
          <tr className={styles.doubleSepTop}>
            <th className={tdLabel} id={hElement2} rowSpan={3} scope="rowgroup">
              Deuxième élément de réponse
            </th>
            <td className={tdDescr} headers={`${hHeaderIndiquer} ${hElement2}`}>
              L&rsquo;élève indique l&rsquo;élément de réponse correctement.
            </td>
            <td className={tdPts} headers={`${hHeaderIndiquer} ${hElement2}`}>
              2 points
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement2}`}>
              L&rsquo;élève appuie l&rsquo;élément de réponse de manière appropriée.
            </td>
            <td className={tdDescr} rowSpan={2} headers={`${hHeaderAppuyer} ${hElement2}`}>
              L&rsquo;élève présente des faits exacts et pertinents.
            </td>
            <td className={tdPts} headers={`${hHeaderAppuyer} ${hElement2}`}>
              2 points
            </td>
            <td
              className={tdSubtotal}
              rowSpan={3}
              scope="col"
              aria-label="Sous-total deuxième élément de réponse"
            >
              / 4
            </td>
          </tr>
          <tr>
            <td className={tdDescr} headers={`${hHeaderIndiquer} ${hElement2}`}>
              L&rsquo;élève indique l&rsquo;élément de réponse plus ou moins correctement.
            </td>
            <td className={tdPts} headers={`${hHeaderIndiquer} ${hElement2}`}>
              1 point
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement2}`}>
              L&rsquo;élève appuie l&rsquo;élément de réponse de manière plus ou moins appropriée.
            </td>
            <td className={tdPts} headers={`${hHeaderAppuyer} ${hElement2}`}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={tdDescr} headers={`${hHeaderIndiquer} ${hElement2}`}>
              L&rsquo;élève indique incorrectement ou n&rsquo;indique pas l&rsquo;élément de
              réponse.
            </td>
            <td className={tdPts} headers={`${hHeaderIndiquer} ${hElement2}`}>
              0 point
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement2}`}>
              L&rsquo;élève appuie l&rsquo;élément de réponse de manière inappropriée.
            </td>
            <td className={tdDescr} headers={`${hHeaderAppuyer} ${hElement2}`}>
              L&rsquo;élève présente des faits inexacts.
            </td>
            <td className={tdPts} headers={`${hHeaderAppuyer} ${hElement2}`}>
              0 point
            </td>
          </tr>

          {/* ═══ Total /8 ═══ */}
          <tr className={styles.cd2TotalRow}>
            <td className={cn(styles.cell, styles.cellDetail)} colSpan={6}>
              Total
            </td>
            <td className={cn(styles.cell, styles.cellPoints)}>/ 8</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
