"use client";

import { useState } from "react";
import type { CdCompetenceNode, CdSelectionWithIds } from "@/lib/tae/cd-helpers";
import { MILLER_CHOICE_BTN_WRAP, MILLER_COLUMN_LIST_CLASSNAME } from "@/lib/ui/miller-columns";
import { cn } from "@/lib/utils/cn";

type Props = {
  competences: CdCompetenceNode[];
  selection: CdSelectionWithIds | null;
  onSelectCritere: (sel: CdSelectionWithIds) => void;
};

function colHead(label: string) {
  return (
    <div className="bg-accent px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white">
      {label}
    </div>
  );
}

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
    <div className="tae-miller-host w-full min-w-0">
      <div className="tae-miller-grid tae-miller-grid--3 overflow-hidden rounded-xl ring-1 ring-border/50">
        <div className="tae-miller-col">
          {colHead("Compétence")}
          <ul
            className={MILLER_COLUMN_LIST_CLASSNAME}
            role="listbox"
            aria-label="Compétences disciplinaires"
          >
            {competences.map((c) => {
              const selected = activeCompetenceId === c.id;
              return (
                <li key={c.id} className="mb-1">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setActiveCompetenceId(c.id);
                      setActiveComposanteId(null);
                    }}
                    className={cn(
                      MILLER_CHOICE_BTN_WRAP,
                      "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      selected
                        ? "bg-accent/12 font-semibold text-deep"
                        : "text-steel hover:bg-surface",
                    )}
                  >
                    {c.titre}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="tae-miller-col">
          {colHead("Composante")}
          <ul className={MILLER_COLUMN_LIST_CLASSNAME} role="listbox" aria-label="Composantes">
            {competence ? (
              competence.composantes.map((co) => {
                const selected = activeComposanteId === co.id;
                return (
                  <li key={co.id} className="mb-1">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setActiveComposanteId(co.id)}
                      className={cn(
                        MILLER_CHOICE_BTN_WRAP,
                        "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        selected
                          ? "bg-accent/12 font-semibold text-deep"
                          : "text-steel hover:bg-surface",
                      )}
                    >
                      {co.titre}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-left text-sm text-muted">—</li>
            )}
          </ul>
        </div>

        <div className="tae-miller-col">
          {colHead("Critère")}
          <ul className={MILLER_COLUMN_LIST_CLASSNAME} role="listbox" aria-label="Critères">
            {composante ? (
              composante.criteres.map((cr) => {
                const isChosen = selection?.critereId === cr.id;
                return (
                  <li key={cr.id} className="mb-1">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isChosen}
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
                      className={cn(
                        MILLER_CHOICE_BTN_WRAP,
                        "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        isChosen
                          ? "bg-success/15 font-medium text-deep ring-1 ring-inset ring-success/30"
                          : "text-steel hover:bg-surface",
                      )}
                    >
                      {cr.texte}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-left text-sm text-muted">—</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
