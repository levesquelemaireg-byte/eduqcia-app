"use client";

import { useCallback, useMemo, useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import {
  CASES_BLOC_A,
  CASES_BLOC_B,
  titreCase,
} from "@/components/tache/wizard/bloc3/templates/schema-cd1/helpers";
import type { CleCase } from "@/lib/tache/schema-cd1/types";
import {
  SECTION_B_DOC_ASSOCIATIONS_LABEL,
  SECTION_B_DOC_PERTINENT_TOOLTIP,
} from "@/lib/ui/ui-copy";

type Props = { slotId: DocumentSlotId };

function GroupeCheckboxes({
  titre,
  cles,
  selection,
  onToggle,
}: {
  titre: string;
  cles: readonly CleCase[];
  selection: Set<CleCase>;
  onToggle: (cle: CleCase) => void;
}) {
  return (
    <fieldset className="space-y-2 rounded-md border border-border bg-panel p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {titre}
      </legend>
      <div className="space-y-1.5">
        {cles.map((cle) => (
          <label
            key={cle}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-deep hover:bg-panel-alt"
          >
            <input
              type="checkbox"
              checked={selection.has(cle)}
              onChange={() => onToggle(cle)}
              className="shrink-0"
            />
            <span>{titreCase(cle)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AssociationsCases({ slotId }: Props) {
  const { state, dispatch } = useTacheForm();
  const slot = state.bloc4.documents[slotId];
  const [helpOpen, setHelpOpen] = useState(false);

  const casesAssociees = slot?.casesAssociees;
  const selection = useMemo(() => new Set(casesAssociees ?? []), [casesAssociees]);

  const toggle = useCallback(
    (cle: CleCase) => {
      const next = new Set(selection);
      if (next.has(cle)) {
        next.delete(cle);
      } else {
        next.add(cle);
      }
      dispatch({
        type: "SET_DOCUMENT_CASES_ASSOCIEES",
        slotId,
        value: Array.from(next),
      });
    },
    [dispatch, selection, slotId],
  );

  const aspectA = state.bloc2.aspectA;
  const aspectB = state.bloc2.aspectB;

  return (
    <section className="space-y-3">
      <LabelWithInfo
        labelText={SECTION_B_DOC_ASSOCIATIONS_LABEL}
        onInfoClick={() => setHelpOpen(true)}
        showAsterisk={false}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <GroupeCheckboxes titre="Objet" cles={["objet"]} selection={selection} onToggle={toggle} />
        <GroupeCheckboxes
          titre={aspectA ? `Aspect ${ASPECT_LABEL[aspectA].toLowerCase()}` : "Aspect A"}
          cles={CASES_BLOC_A}
          selection={selection}
          onToggle={toggle}
        />
        <GroupeCheckboxes
          titre={aspectB ? `Aspect ${ASPECT_LABEL[aspectB].toLowerCase()}` : "Aspect B"}
          cles={CASES_BLOC_B}
          selection={selection}
          onToggle={toggle}
        />
      </div>

      <SimpleModal
        open={helpOpen}
        title={SECTION_B_DOC_ASSOCIATIONS_LABEL}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{SECTION_B_DOC_PERTINENT_TOOLTIP}</p>
      </SimpleModal>
    </section>
  );
}
