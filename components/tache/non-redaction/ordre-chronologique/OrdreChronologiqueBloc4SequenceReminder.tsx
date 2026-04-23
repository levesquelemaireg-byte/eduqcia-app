"use client";

import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { numeroAffiche } from "@/lib/tache/document-helpers";
import {
  ordreChronologiqueCorrectPermutation,
  type OrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import { formatOrdreOptionRowDisplay } from "@/lib/tache/non-redaction/ordre-chronologique-permutations";
import {
  NR_ORDRE_BLOC4_REMINDER_TITLE,
  formatNrOrdreBloc4ReminderDigitDocLine,
  formatNrOrdreBloc4ReminderLead,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  payload: OrdreChronologiquePayload;
  orderedSlotIds: DocumentSlotId[];
};

/**
 * Rappel enseignant — étape 4 : suite correcte, lettre d’option questionnaire, lien chiffres ↔ documents.
 */
export function OrdreChronologiqueBloc4SequenceReminder({ payload, orderedSlotIds }: Props) {
  const perm = ordreChronologiqueCorrectPermutation(payload);
  const letter = payload.correctLetter;
  if (!perm || (letter !== "A" && letter !== "B" && letter !== "C" && letter !== "D")) {
    return null;
  }

  const suiteDisplay = formatOrdreOptionRowDisplay(perm);
  const lead = formatNrOrdreBloc4ReminderLead(suiteDisplay, letter);

  return (
    <div
      className={cn(
        "icon-lead rounded-xl border border-accent/25 bg-accent/[0.06] py-3.5 pl-4 pr-4 text-sm text-steel shadow-sm ring-1 ring-border/35",
      )}
    >
      <span
        className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-accent"
        aria-hidden="true"
      >
        reorder
      </span>
      <div className="min-w-0 space-y-2 leading-relaxed">
        <p className="font-semibold text-deep">{NR_ORDRE_BLOC4_REMINDER_TITLE}</p>
        <p>{lead}</p>
        <ul className="list-inside list-disc space-y-0.5 pl-0.5">
          {orderedSlotIds.map((slotId, index) => (
            <li key={slotId}>
              {formatNrOrdreBloc4ReminderDigitDocLine(index + 1, numeroAffiche(slotId))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
