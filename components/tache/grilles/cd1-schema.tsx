import styles from "@/components/tache/grilles/eval-grid.module.css";
import { cn } from "@/lib/utils/cn";

const ID = "CD1_SCHEMA";

/**
 * Grille CD1 — Schéma de caractérisation (Section B).
 * Référence visuelle : docs/image/GRILLE-SCHEMA-CD1-SECTION-B.png.
 * Total : 8 points (objet 2 + 1ʳᵉ mise en relation 3 + 2ᵉ mise en relation 3).
 */
export function GrilleCD1Schema() {
  const hObjet = `${ID}__objet`;
  const hMise1 = `${ID}__mise1`;
  const hMise2 = `${ID}__mise2`;

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-label={`Outil ${ID}`}>
        <tbody>
          {/* Section 1 — Objet de la description */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellRubrique)}
              id={hObjet}
              colSpan={3}
              scope="colgroup"
            >
              Indiquer l&rsquo;objet de la description
            </th>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hObjet}>
              L&rsquo;élève indique correctement l&rsquo;objet de la description.
            </td>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hObjet}>
              L&rsquo;élève indique plus ou moins correctement ou n&rsquo;indique pas l&rsquo;objet
              de la description.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hObjet}>
              2 points / 1 point / 0 point
            </td>
          </tr>

          {/* Section 2 — Préciser les éléments mis en relation */}
          <tr>
            <th className={cn(styles.cell, styles.cellRubrique)} colSpan={3} scope="colgroup">
              Préciser les éléments mis en relation
            </th>
          </tr>

          {/* Première mise en relation */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hMise1}
              rowSpan={7}
              scope="rowgroup"
            >
              Première mise en relation
            </th>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              L&rsquo;élève précise correctement l&rsquo;élément central et précise correctement les
              deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              3 points
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              et précise plus ou moins correctement les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              mais précise un des deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              mais ne précise pas les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              0 point
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              L&rsquo;élève précise plus ou moins correctement l&rsquo;élément central et précise
              correctement les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              et précise plus ou moins correctement les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise1}>
              mais précise un des deux autres éléments ou n&rsquo;en précise aucun.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise1}>
              0 point
            </td>
          </tr>

          {/* Deuxième mise en relation */}
          <tr>
            <th
              className={cn(styles.cell, styles.cellCond)}
              id={hMise2}
              rowSpan={7}
              scope="rowgroup"
            >
              Deuxième mise en relation
            </th>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              L&rsquo;élève précise correctement l&rsquo;élément central et précise correctement les
              deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              3 points
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              et précise plus ou moins correctement les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              mais précise un des deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              mais ne précise pas les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              0 point
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              L&rsquo;élève précise plus ou moins correctement l&rsquo;élément central et précise
              correctement les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              2 points
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              et précise plus ou moins correctement les deux autres éléments.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              1 point
            </td>
          </tr>
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} headers={hMise2}>
              mais précise un des deux autres éléments ou n&rsquo;en précise aucun.
            </td>
            <td className={cn(styles.cell, styles.cellPoints)} headers={hMise2}>
              0 point
            </td>
          </tr>

          {/* Total */}
          <tr>
            <td className={cn(styles.cell, styles.cellDetail)} colSpan={2}>
              Total
            </td>
            <td className={cn(styles.cell, styles.cellPoints)}>/ 8</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
