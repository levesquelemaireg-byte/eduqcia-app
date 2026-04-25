/**
 * ApercuImpression — composant unique de rendu des pages paginées.
 *
 * Consomme `RenduImprimable` et rend les pages via `SectionPage`.
 * Dispatche chaque bloc vers le composant de section approprié
 * selon `bloc.kind` et le contenu.
 *
 * Invariant §0.5 : un seul composant de rendu, identique pour
 * wizard, route SSR et Puppeteer.
 */

import type { Page, BlocMesure } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";
import type {
  ContenuQuadruplet,
  ContenuCorrige,
} from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { ContenuDossierPage } from "@/lib/impression/builders/blocs-dossier-pages";
import { SectionPage } from "./section-page";
import { DossierGrille } from "./dossier/grille";
import { SectionQuadruplet } from "./sections/quadruplet";
import { SectionCorrige } from "./sections/corrige";

export type ApercuImpressionProps = {
  rendu: RenduImprimable & { ok: true };
};

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
    case "dossier-page": {
      const content = bloc.content as ContenuDossierPage;
      return (
        <DossierGrille
          page={content.page}
          sources={content.sources}
          titresVisibles={content.titresVisibles}
        />
      );
    }

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

export function ApercuImpression({ rendu }: ApercuImpressionProps) {
  return (
    <>
      {rendu.pages.map((page: Page, i: number) => (
        <SectionPage
          key={i}
          enTete={rendu.enTete}
          numeroPage={page.numeroPage}
          totalPages={page.totalPages}
        >
          {page.blocs.map((bloc) => (
            <RenduBloc key={bloc.id} bloc={bloc} />
          ))}
        </SectionPage>
      ))}
    </>
  );
}
