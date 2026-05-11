/**
 * ApercuImpression — composant unique de rendu des pages paginées.
 *
 * Consomme `RenduImprimable` et rend les pages via `SectionPage`.
 * Dispatche chaque bloc vers le composant de section approprié selon
 * `bloc.kind` et le contenu :
 * - `dossier-page` → grille du dossier documentaire
 * - `quadruplet` → quadruplet standard ou cahier-réponses (type guard sur
 *   `consigne` vs `espaceProduction + outilEvaluation`)
 * - `annexe-corrige` → titre / question d'annexe « Notes du correcteur »
 *
 * Phase 5 lot 3 : le bloc corrigé séparé (legacy) a été supprimé — le
 * corrigé simple est désormais un overlay intégré aux fragments du
 * quadruplet (spec §3.5), et le corrigé détaillé y ajoute des blocs
 * `annexe-corrige` paginés en fin de feuillet questionnaire.
 *
 * Invariant §0.5 : un seul composant de rendu, identique pour wizard,
 * route SSR et Puppeteer.
 */

import type { Page, BlocMesure } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";
import type {
  ContenuQuadruplet,
  ContenuCahierReponses,
} from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { ContenuDossierPage } from "@/lib/impression/builders/blocs-dossier-pages";
import { SectionPage } from "./section-page";
import { DossierGrille } from "./dossier/grille";
import { SectionQuadruplet } from "./sections/quadruplet";
import { SectionCahierReponses } from "./sections/cahier-reponses";
import { SectionAnnexeCorrige, type ContenuAnnexeCorrige } from "./sections/annexe-corrige";

export type ApercuImpressionProps = {
  rendu: RenduImprimable & { ok: true };
};

/**
 * Type guard : contenu cahier-réponses (possède `espaceProduction` et
 * `outilEvaluation`, mais pas `consigne`). Spec §7.4.
 */
function estContenuCahierReponses(content: unknown): content is ContenuCahierReponses {
  return (
    typeof content === "object" &&
    content !== null &&
    "espaceProduction" in content &&
    "outilEvaluation" in content &&
    !("consigne" in content)
  );
}

/** Type guard : contenu quadruplet (possède `consigne`). */
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
      if (estContenuCahierReponses(bloc.content)) {
        return <SectionCahierReponses contenu={bloc.content} />;
      }
      if (estContenuQuadruplet(bloc.content)) {
        return <SectionQuadruplet contenu={bloc.content} />;
      }
      return null;

    case "annexe-corrige":
      return <SectionAnnexeCorrige contenu={bloc.content as ContenuAnnexeCorrige} />;

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
