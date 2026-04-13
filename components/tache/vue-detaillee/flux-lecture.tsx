"use client";

import { useMemo } from "react";
import type { TaeFicheData, PeerVoteTally } from "@/lib/types/fiche";
import { selectHero } from "@/lib/fiche/selectors/tache/hero";
import { selectDocuments } from "@/lib/fiche/selectors/tache/documents";
import { selectGuidage } from "@/lib/fiche/selectors/tache/guidage";
import { selectCorrige } from "@/lib/fiche/selectors/tache/corrige";
import { selectGrille } from "@/lib/fiche/selectors/tache/grille";
import { SectionHero } from "@/components/tache/vue-detaillee/sections/hero";
import { SectionDocuments } from "@/components/tache/vue-detaillee/sections/documents";
import { SectionGuidage } from "@/components/tache/vue-detaillee/sections/guidage";
import { SectionCorrige } from "@/components/tache/vue-detaillee/sections/corrige";
import { SectionGrille } from "@/components/tache/vue-detaillee/sections/grille";
import { SectionVotes } from "@/components/tae/fiche/SectionVotes";

type Props = {
  tae: TaeFicheData;
  votes: PeerVoteTally | null;
  peutVoter: boolean;
  /** Handler de clic sur une DocCard — ouvre la modale fiche document. Phase 6. */
  surClicDocument?: (docId: string) => void;
  /** Ref sur le h1 du hero — focus initial programmatique. Phase 8. */
  heroRef?: React.Ref<HTMLHeadingElement>;
};

/**
 * Flux principal de la vue détaillée tâche.
 * Itère les sections dans l'ordre de la spec avec ~48px de whitespace entre elles.
 * Pas de carte englobante, pas de hairlines — whitespace comme séparateur.
 */
export function FluxLecture({ tae, votes, peutVoter, surClicDocument, heroRef }: Props) {
  const hero = useMemo(() => selectHero(tae), [tae]);
  const documents = useMemo(() => selectDocuments(tae), [tae]);
  const guidage = useMemo(() => selectGuidage(tae), [tae]);
  const corrige = useMemo(() => selectCorrige(tae), [tae]);
  const grille = useMemo(() => selectGrille(tae), [tae]);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero — toujours rendu */}
      <SectionHero data={hero} heroRef={heroRef} />

      {/* Documents — conditionnel (null si 0 documents) */}
      {documents ? <SectionDocuments data={documents} surClicDocument={surClicDocument} /> : null}

      {/* Guidage — conditionnel (null si vide) */}
      {guidage ? <SectionGuidage data={guidage} /> : null}

      {/* Production attendue — conditionnel (null si vide) */}
      {corrige ? <SectionCorrige data={corrige} /> : null}

      {/* Grille d'évaluation — conditionnel (null si aucun outil) */}
      {grille ? <SectionGrille data={grille} /> : null}

      {/* Évaluation par les pairs — toujours rendu */}
      <SectionVotes taeId={tae.id} votes={votes} canVote={peutVoter} />
    </div>
  );
}
