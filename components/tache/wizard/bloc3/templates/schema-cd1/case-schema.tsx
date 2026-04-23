"use client";

import {
  caseEstComplete,
  caseEstEnCours,
  type CaseSchemaCd1,
  type CleCase,
} from "@/lib/tache/schema-cd1/types";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import {
  statusTextClasses,
  statusBadgeClasses,
} from "@/components/tache/wizard/bloc4/documentSlotStatusStyles";
import { slotStatusLabel, type SlotUiStatus } from "@/lib/tache/document-helpers";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { aspectDeLaCase, titreCase } from "./helpers";
import { SECTION_B_SCHEMA_CASE_VIDE_PLACEHOLDER } from "@/lib/ui/ui-copy";

type Props = {
  cle: CleCase;
  donnees: CaseSchemaCd1;
  aspectA: AspectSocieteKey | null;
  aspectB: AspectSocieteKey | null;
  onOuvrir: (cle: CleCase) => void;
};

function statutDeLaCase(c: CaseSchemaCd1): SlotUiStatus {
  if (caseEstComplete(c)) return "complete";
  if (caseEstEnCours(c)) return "in_progress";
  return "empty";
}

export function CaseSchema({ cle, donnees, aspectA, aspectB, onOuvrir }: Props) {
  const statut = statutDeLaCase(donnees);
  const titre = titreCase(cle);
  const aspect = aspectDeLaCase(cle, aspectA, aspectB);
  const sousTitre = aspect ? `Aspect ${ASPECT_LABEL[aspect].toLowerCase()}` : null;
  const aUnGuidage = htmlHasMeaningfulText(donnees.guidage);

  return (
    <button
      type="button"
      onClick={() => onOuvrir(cle)}
      aria-label={`${titre}${sousTitre ? ` — ${sousTitre}` : ""}`}
      className="flex min-h-[7rem] w-full flex-col items-stretch overflow-hidden rounded-md bg-surface text-left shadow-sm ring-1 ring-inset ring-border/60 transition hover:ring-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="bg-deep px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-surface">
        {titre}
        {sousTitre ? (
          <span className="ml-1 font-normal normal-case text-surface/80">· {sousTitre}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {aUnGuidage ? (
          <div
            className="text-sm leading-snug text-deep [&>p]:m-0"
            dangerouslySetInnerHTML={{ __html: donnees.guidage }}
          />
        ) : (
          <p className="text-sm italic text-muted">{SECTION_B_SCHEMA_CASE_VIDE_PLACEHOLDER}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClasses(statut)}`}
          >
            <span
              className={`material-symbols-outlined text-[1em] leading-none ${statusTextClasses(statut)}`}
              aria-hidden="true"
            >
              {statut === "complete"
                ? "check_circle"
                : statut === "in_progress"
                  ? "radio_button_partial"
                  : "radio_button_unchecked"}
            </span>
            {slotStatusLabel(statut)}
          </span>
          <span className="text-[11px] font-medium text-accent">Modifier</span>
        </div>
      </div>
    </button>
  );
}
