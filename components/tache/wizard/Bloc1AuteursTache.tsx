"use client";

/**
 * Étape 1 — Bloc 1 — Auteur(s) de la tâche.
 * Textes : `docs/DECISIONS.md` (registre copy) — Étape 1 — Auteur(s) de la tâche.
 */
import { useCallback, useId, useMemo } from "react";
import { CollaborateurSearchField } from "@/components/tache/wizard/CollaborateurSearchField";
import { BLOC1_STEPPER_ICONS } from "@/components/tache/wizard/bloc1-stepper-icons";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { RequiredMark } from "@/components/ui/RequiredMark";
import type { CollaborateurProfileSearchRow } from "@/lib/queries/collaborateur-profile-search";

export function Bloc1AuteursTache() {
  const { state, dispatch } = useTaeForm();
  const { modeConception, collaborateurs } = state.bloc1;
  const collabInputId = useId();

  const setMode = useCallback(
    (mode: "seul" | "equipe") => {
      dispatch({ type: "SET_MODE_CONCEPTION", mode });
    },
    [dispatch],
  );

  const excludeIds = useMemo(() => new Set(collaborateurs.map((c) => c.id)), [collaborateurs]);

  const onPickCollaborateur = useCallback(
    (row: CollaborateurProfileSearchRow) => {
      dispatch({
        type: "ADD_COLLABORATEUR",
        id: row.id,
        displayName: `${row.first_name} ${row.last_name}`.trim() || "—",
      });
    },
    [dispatch],
  );

  return (
    <div className="space-y-8">
      <RadioCardGroup
        name="modeConception"
        label="Mode de conception"
        required
        options={[
          {
            value: "seul",
            label: "Seul",
            icon: "person",
            description: "Vous êtes l'unique auteur de cette tâche.",
          },
          {
            value: "equipe",
            label: "En équipe",
            icon: BLOC1_STEPPER_ICONS[1],
            description:
              "Vous avez conçu cette tâche avec un ou plusieurs collègues. Ajoutez leurs noms ci-dessous pour les inclure comme collaborateurs.",
          },
        ]}
        value={modeConception || ""}
        onChange={(v) => setMode(v as "seul" | "equipe")}
      />

      {modeConception === "equipe" ? (
        <div className="space-y-4 rounded-xl border border-border bg-panel-alt/50 p-4 shadow-sm sm:p-5">
          <div className="icon-text flex-wrap">
            <span
              className="material-symbols-outlined shrink-0 text-[1.35rem] text-accent"
              aria-hidden="true"
            >
              {BLOC1_STEPPER_ICONS[1]}
            </span>
            <p className="text-sm font-semibold text-deep">
              Collaborateurs <RequiredMark />
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Les noms de famille seront affichés sur la fiche par ordre alphabétique.
          </p>
          <div className="space-y-3">
            <label htmlFor={collabInputId} className="icon-text text-sm font-semibold text-deep">
              <span
                className="material-symbols-outlined text-[20px] text-accent"
                aria-hidden="true"
              >
                search
              </span>
              Rechercher un collaborateur
            </label>
            <CollaborateurSearchField
              fieldId={collabInputId}
              excludeIds={excludeIds}
              onPick={onPickCollaborateur}
            />
            <p className="text-xs leading-relaxed text-muted sm:text-sm">
              Seules les personnes inscrites sur la plateforme peuvent être ajoutées.
            </p>
          </div>
          {collaborateurs.length > 0 ? (
            <ul className="flex flex-wrap gap-2 pt-1">
              {collaborateurs.map((c) => (
                <li
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-deep shadow-sm"
                >
                  {c.displayName}
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted hover:text-deep"
                    aria-label={`Retirer ${c.displayName}`}
                    onClick={() => dispatch({ type: "REMOVE_COLLABORATEUR", id: c.id })}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      close
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
