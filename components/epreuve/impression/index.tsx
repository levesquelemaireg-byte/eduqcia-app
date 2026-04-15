/**
 * ApercuImpression — composant unique de rendu des pages paginées.
 *
 * Consomme `EpreuvePaginee` et rend les pages via `SectionPage`.
 * Placeholder minimal pour D1 — les sections de contenu (document,
 * quadruplet, corrigé, etc.) seront implémentées dans un lot ultérieur.
 */

import type { EpreuvePaginee, TypeFeuillet, Page } from "@/lib/epreuve/pagination/types";
import { SectionPage } from "./section-page";

export type ApercuImpressionProps = {
  paginee: EpreuvePaginee & { ok: true };
};

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

export function ApercuImpression({ paginee }: ApercuImpressionProps) {
  const totalPages = ORDRE_FEUILLETS.reduce((sum, f) => sum + paginee.feuillets[f].length, 0);

  let pageIndex = 0;

  return (
    <>
      {ORDRE_FEUILLETS.map((feuillet) =>
        paginee.feuillets[feuillet].map((page: Page, i: number) => {
          pageIndex++;
          return (
            <SectionPage
              key={`${feuillet}-${i}`}
              enTete={paginee.enTete}
              numeroPage={pageIndex}
              totalPages={totalPages}
            >
              {/* PROVISOIRE — placeholder blocs, implémenté en lot composants de rendu */}
              {page.blocs.map((bloc) => (
                <div
                  key={bloc.id}
                  className={`bloc-${bloc.kind}`}
                  style={{ minHeight: `${bloc.hauteurPx}px` }}
                >
                  <p style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#666" }}>
                    [{bloc.kind}] {bloc.id}
                  </p>
                </div>
              ))}
            </SectionPage>
          );
        }),
      )}
    </>
  );
}
