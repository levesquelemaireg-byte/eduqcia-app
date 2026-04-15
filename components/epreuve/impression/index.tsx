/**
 * ApercuImpression — composant unique de rendu des pages paginées.
 *
 * Consomme `EpreuvePaginee` et rend les pages via `SectionPage`.
 * Dispatche chaque bloc vers le composant de section approprié
 * selon `bloc.kind` et le contenu.
 *
 * Invariant §0.5 : un seul composant de rendu, identique pour
 * wizard, route SSR et Puppeteer.
 */

import type {
  EpreuvePaginee,
  TypeFeuillet,
  Page,
  BlocMesure,
} from "@/lib/epreuve/pagination/types";
import type {
  ContenuQuadruplet,
  ContenuCorrige,
} from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { SectionPage } from "./section-page";
import { SectionDocument } from "./sections/document";
import type { ContenuDocument } from "./sections/document";
import { SectionQuadruplet } from "./sections/quadruplet";
import { SectionCorrige } from "./sections/corrige";

export type ApercuImpressionProps = {
  paginee: EpreuvePaginee & { ok: true };
};

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

/** Type guard : le contenu est un corrigé (possède `corrige` et pas de `consigne`). */
function estContenuCorrige(content: unknown): content is ContenuCorrige {
  return (
    typeof content === "object" &&
    content !== null &&
    "corrige" in content &&
    !("consigne" in content)
  );
}

/** Type guard : le contenu est un quadruplet (possède `consigne`). */
function estContenuQuadruplet(content: unknown): content is ContenuQuadruplet {
  return typeof content === "object" && content !== null && "consigne" in content;
}

/** Rend un bloc selon son kind et son contenu. */
function RenduBloc({ bloc }: { bloc: BlocMesure }) {
  switch (bloc.kind) {
    case "document":
      return <SectionDocument contenu={bloc.content as ContenuDocument} />;

    case "quadruplet":
      if (estContenuCorrige(bloc.content)) {
        return <SectionCorrige contenu={bloc.content} />;
      }
      if (estContenuQuadruplet(bloc.content)) {
        return <SectionQuadruplet contenu={bloc.content} />;
      }
      return null;

    case "entete-section":
      return null;

    default:
      return null;
  }
}

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
              {page.blocs.map((bloc) => (
                <RenduBloc key={bloc.id} bloc={bloc} />
              ))}
            </SectionPage>
          );
        }),
      )}
    </>
  );
}
