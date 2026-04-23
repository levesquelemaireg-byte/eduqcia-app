"use client";

import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  BLOC3_GATE_BLUEPRINT,
  SECTION_B_ETAPE3_SOUS_BLOC_CONSIGNE,
  SECTION_B_ETAPE3_SOUS_BLOC_PREPARER,
  SECTION_B_ETAPE3_SOUS_BLOC_SCHEMA,
} from "@/lib/ui/ui-copy";
import { EditeurPreambule } from "./editeur-preambule";
import { ChampsChapeau } from "./champs-chapeau";
import { ApercuChapeau } from "./apercu-chapeau";
import { DemarcheInvariable } from "./demarche-invariable";
import { SchemaInteractif } from "./schema-interactif";

function SousBlocTitre({ titre }: { titre: string }) {
  return (
    <h3 className="border-b border-border pb-2 text-base font-semibold uppercase tracking-wide text-deep">
      {titre}
    </h3>
  );
}

export default function Bloc3SchemaCd1() {
  const { state } = useTacheForm();
  const b = state.bloc2;
  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC3_GATE_BLUEPRINT}</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SousBlocTitre titre={SECTION_B_ETAPE3_SOUS_BLOC_PREPARER} />
        <EditeurPreambule />
      </section>

      <section className="space-y-4">
        <SousBlocTitre titre={SECTION_B_ETAPE3_SOUS_BLOC_CONSIGNE} />
        <ChampsChapeau />
        <ApercuChapeau />
        <DemarcheInvariable />
      </section>

      <section className="space-y-4">
        <SousBlocTitre titre={SECTION_B_ETAPE3_SOUS_BLOC_SCHEMA} />
        <SchemaInteractif />
      </section>
    </div>
  );
}
