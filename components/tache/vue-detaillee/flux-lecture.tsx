"use client";

import { useMemo } from "react";
import type { TacheFicheData, PeerVoteTally } from "@/lib/types/fiche";
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

type Props = {
  tache: TacheFicheData;
  votes: PeerVoteTally | null;
  peutVoter: boolean;
  /** Handler de clic sur un document — ouvre la modale fiche document. Phase 6. */
  surClicDocument?: (docId: string) => void;
  /** Ref sur le h1 du hero — focus initial programmatique. Phase 8. */
  heroRef?: React.Ref<HTMLHeadingElement>;
};

/**
 * Flux principal de la vue détaillée tâche.
 * Itère les sections dans l'ordre de la spec avec ~48px de whitespace entre elles.
 * Pas de carte englobante, pas de hairlines — whitespace comme séparateur.
 */
export function FluxLecture({
  tache,
  votes: _votes,
  peutVoter: _peutVoter,
  surClicDocument,
  heroRef,
}: Props) {
  const hero = useMemo(() => selectHero(tache), [tache]);
  const documents = useMemo(() => selectDocuments(tache), [tache]);
  const guidage = useMemo(() => selectGuidage(tache), [tache]);
  const corrige = useMemo(() => selectCorrige(tache), [tache]);
  const grille = useMemo(() => selectGrille(tache), [tache]);

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

      {/* PROVISOIRE — Évaluation par les pairs masquée (fonctionnalité en développement) */}
      {/* <SectionVotes tacheId={tache.id} votes={votes} canVote={peutVoter} /> */}
    </div>
  );
}
