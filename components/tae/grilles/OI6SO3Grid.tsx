import styles from "@/components/tae/grilles/oi6-so3-grid.module.css";

const ID = "OI6_SO3";

/** Texte ministériel par défaut si `bareme.note` est absent (aligné `grilles-evaluation.json`). */
const DEFAULT_FOOTNOTE =
  "L’élève présente un repère de temps plus ou moins exact ou inexact, ou n’en présente pas.";

export type OI6SO3GridProps = {
  /** Donnée `bareme.note` ; sinon `DEFAULT_FOOTNOTE`. */
  note?: string;
};

/**
 * Barème OI6_SO3 — tableau HTML explicite (`table-layout: fixed`, somme colonnes = 660px).
 * Pas de rendu générique, pas de dépendance à `GenericEchelleGrid` / `eval-grid`.
 */
export default function OI6SO3Grid({ note }: OI6SO3GridProps = {}) {
  const footText = note?.trim() ? note.trim() : DEFAULT_FOOTNOTE;
  const footId = `${ID}__footnote`;
  const hRub = `${ID}__rubrique`;
  const hC1 = `${ID}__c1`;
  const hC2 = `${ID}__c2`;

  return (
    <div className={styles.root}>
      <table className={styles.table} aria-label={`Outil ${ID}`} aria-describedby={footId}>
        <colgroup>
          <col style={{ width: "115px" }} />
          <col style={{ width: "110px" }} />
          <col style={{ width: "295px" }} />
          <col style={{ width: "140px" }} />
        </colgroup>
        <tbody>
          <tr>
            <th className={styles.thRub} id={hRub} rowSpan={6} scope="row">
              Déterminer des
              <br />
              changements et
              <br />
              des continuités
            </th>
            <th className={styles.thCond} id={hC1} rowSpan={3} scope="row">
              L’élève indique
              <br />
              s’il y a
              <br />
              changement ou
              <br />
              continuité
            </th>
            <td className={styles.tdDesc} headers={`${hRub} ${hC1}`}>
              et présente des faits qui le montrent correctement.
            </td>
            <td className={styles.tdScore} headers={`${hRub} ${hC1}`}>
              <span className={styles.nowrapParen}>
                3 points (ou 2 points
                <span className={styles.star} aria-hidden>
                  *
                </span>
                )
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.tdDesc} headers={`${hRub} ${hC1}`}>
              et présente des faits qui le montrent plus ou moins correctement.
            </td>
            <td className={styles.tdScore} headers={`${hRub} ${hC1}`}>
              <span className={styles.nowrapParen}>
                2 points (ou 1 point
                <span className={styles.star} aria-hidden>
                  *
                </span>
                )
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.tdDesc} headers={`${hRub} ${hC1}`}>
              et présente des faits qui le montrent incorrectement ou n’en présente pas.
            </td>
            <td className={styles.tdScore} headers={`${hRub} ${hC1}`}>
              0 point
            </td>
          </tr>
          <tr className={styles.rowGroup2}>
            <th className={styles.thCond} id={hC2} rowSpan={3} scope="row">
              L’élève
              <br />
              n’indique pas
              <br />
              s’il y a
              <br />
              changement ou
              <br />
              continuité
            </th>
            <td className={styles.tdDesc} headers={`${hRub} ${hC2}`}>
              mais présente des faits exacts.
            </td>
            <td className={styles.tdScore} headers={`${hRub} ${hC2}`}>
              <span className={styles.nowrapParen}>
                2 points (ou 1 point
                <span className={styles.star} aria-hidden>
                  *
                </span>
                )
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.tdDesc} headers={`${hRub} ${hC2}`}>
              mais présente des faits plus ou moins exacts.
            </td>
            <td className={styles.tdScore} headers={`${hRub} ${hC2}`}>
              <span className={styles.nowrapParen}>
                1 point (ou 0 point
                <span className={styles.star} aria-hidden>
                  *
                </span>
                )
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.tdDesc} headers={`${hRub} ${hC2}`}>
              et présente des faits inexacts ou n’en présente pas.
            </td>
            <td className={styles.tdScore} headers={`${hRub} ${hC2}`}>
              0 point
            </td>
          </tr>
        </tbody>
      </table>
      <p className={styles.footnote} id={footId}>
        <span className={styles.footnoteMark} aria-hidden>
          *
        </span>{" "}
        {footText}
      </p>
    </div>
  );
}
