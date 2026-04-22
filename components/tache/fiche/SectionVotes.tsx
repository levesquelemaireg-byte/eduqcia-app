"use client";

import type { PeerVoteTally } from "@/lib/types/fiche";
import { FICHE_SECTION_BODY_INSET, FICHE_SECTION_TITLE_CLASS } from "@/lib/ui/fiche-layout";

type Props = {
  taeId: string;
  votes: PeerVoteTally | null;
  canVote?: boolean;
};

const AXES = [
  { label: "Rigueur historique", key: "rigueur" as const },
  { label: "Clarté de la consigne", key: "clarte" as const },
  { label: "Alignement ministériel", key: "alignement" as const },
];

function tallyFor(
  v: PeerVoteTally | null,
  key: "rigueur" | "clarte" | "alignement",
): { n1: number; n2: number; n3: number } {
  if (!v) return { n1: 0, n2: 0, n3: 0 };
  if (key === "rigueur") return { n1: v.rigueur_n1, n2: v.rigueur_n2, n3: v.rigueur_n3 };
  if (key === "clarte") return { n1: v.clarte_n1, n2: v.clarte_n2, n3: v.clarte_n3 };
  return { n1: v.alignement_n1, n2: v.alignement_n2, n3: v.alignement_n3 };
}

/** docs/FEATURES.md §8.3 — nombres bruts uniquement, jamais de moyenne publique. */
export function SectionVotes({ taeId, votes, canVote }: Props) {
  const total = votes?.total_votants ?? 0;

  return (
    <section data-tae-votes={taeId}>
      <h3 className={FICHE_SECTION_TITLE_CLASS}>
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          how_to_vote
        </span>
        Évaluation par les pairs
      </h3>

      <div className={FICHE_SECTION_BODY_INSET}>
        {AXES.map((axe) => {
          const t = tallyFor(votes, axe.key);
          return (
            <div key={axe.key} className="mt-3 first:mt-0">
              <p className="text-xs font-medium text-steel">{axe.label}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                <span>Niveau 1 : {t.n1}</span>
                <span>Niveau 2 : {t.n2}</span>
                <span>Niveau 3 : {t.n3}</span>
              </div>
            </div>
          );
        })}

        <p className="mt-3 text-xs text-muted">
          {total} vote{total !== 1 ? "s" : ""}
        </p>

        {canVote ? (
          <button type="button" className="mt-3 text-xs text-accent hover:underline">
            Voter sur cette tâche
          </button>
        ) : null}
      </div>
    </section>
  );
}
