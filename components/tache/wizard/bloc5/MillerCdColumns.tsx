"use client";

import { useState } from "react";
import type { CdCompetenceNode, CdSelectionWithIds } from "@/lib/tache/cd-helpers";
import { MillerColumnsLayout } from "@/components/ui/MillerColumnsLayout";

type Props = {
  competences: CdCompetenceNode[];
  selection: CdSelectionWithIds | null;
  onSelectCritere: (sel: CdSelectionWithIds) => void;
};

export function MillerCdColumns({ competences, selection, onSelectCritere }: Props) {
  const [activeCompetenceId, setActiveCompetenceId] = useState<string | null>(
    selection?.competenceId ?? null,
  );
  const [activeComposanteId, setActiveComposanteId] = useState<string | null>(
    selection?.composanteId ?? null,
  );

  const competence = competences.find((c) => c.id === activeCompetenceId);
  const composante = competence?.composantes.find((c) => c.id === activeComposanteId);

  return (
    <MillerColumnsLayout columnCount={3}>
      <MillerColumnsLayout.Column label="Compétence" ariaLabel="Compétences disciplinaires">
        {competences.map((c) => (
          <MillerColumnsLayout.NavItem
            key={c.id}
            active={activeCompetenceId === c.id}
            onClick={() => {
              setActiveCompetenceId(c.id);
              setActiveComposanteId(null);
            }}
          >
            {c.titre}
          </MillerColumnsLayout.NavItem>
        ))}
      </MillerColumnsLayout.Column>

      <MillerColumnsLayout.Column label="Composante">
        {competence ? (
          competence.composantes.map((co) => (
            <MillerColumnsLayout.NavItem
              key={co.id}
              active={activeComposanteId === co.id}
              onClick={() => setActiveComposanteId(co.id)}
            >
              {co.titre}
            </MillerColumnsLayout.NavItem>
          ))
        ) : (
          <MillerColumnsLayout.EmptyState message="Sélectionnez une compétence" />
        )}
      </MillerColumnsLayout.Column>

      <MillerColumnsLayout.Column label="Critère">
        {composante ? (
          composante.criteres.map((cr) => (
            <MillerColumnsLayout.RadioItem
              key={cr.id}
              selected={selection?.critereId === cr.id}
              onClick={() => {
                if (!competence || !composante) return;
                onSelectCritere({
                  competence: competence.titre,
                  composante: composante.titre,
                  critere: cr.texte,
                  competenceId: competence.id,
                  composanteId: composante.id,
                  critereId: cr.id,
                });
              }}
            >
              {cr.texte}
            </MillerColumnsLayout.RadioItem>
          ))
        ) : (
          <MillerColumnsLayout.EmptyState message="Sélectionnez une composante" />
        )}
      </MillerColumnsLayout.Column>
    </MillerColumnsLayout>
  );
}
