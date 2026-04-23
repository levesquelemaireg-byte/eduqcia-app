"use client";

import { useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import {
  SECTION_B_DEMARCHE_ETAPES,
  SECTION_B_DEMARCHE_LABEL,
  SECTION_B_DEMARCHE_TOOLTIP,
} from "@/lib/ui/ui-copy";

export function DemarcheInvariable() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <section className="space-y-2">
      <LabelWithInfo
        labelText={SECTION_B_DEMARCHE_LABEL}
        onInfoClick={() => setHelpOpen(true)}
        leadingIcon="tooltip_2"
        leadingIconTitle={SECTION_B_DEMARCHE_LABEL}
        showAsterisk={false}
      />
      <ol className="list-decimal space-y-1 pl-5 text-sm italic leading-relaxed text-muted">
        {SECTION_B_DEMARCHE_ETAPES.map((etape, i) => (
          <li key={i}>{etape}</li>
        ))}
      </ol>
      <SimpleModal
        open={helpOpen}
        title={SECTION_B_DEMARCHE_LABEL}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{SECTION_B_DEMARCHE_TOOLTIP}</p>
      </SimpleModal>
    </section>
  );
}
