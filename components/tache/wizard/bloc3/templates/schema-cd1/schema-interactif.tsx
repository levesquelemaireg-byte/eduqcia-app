"use client";

import { useState } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import { compterCasesCompletes, obtenirCase, type CleCase } from "@/lib/tache/schema-cd1/types";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import { SECTION_B_SCHEMA_COMPTEUR } from "@/lib/ui/ui-copy";
import { CASES_BLOC_A, CASES_BLOC_B } from "./helpers";
import { CaseSchema } from "./case-schema";
import { ModaleEditionCase } from "./modale-edition-case";

function LibelleAspect({ aspect }: { aspect: AspectSocieteKey | null }) {
  if (!aspect) {
    return <span className="italic text-muted">Aspect à définir à l&apos;étape 2</span>;
  }
  return <span className="text-deep">Aspect {ASPECT_LABEL[aspect].toLowerCase()}</span>;
}

export function SchemaInteractif() {
  const { state } = useTacheForm();
  const schema = state.bloc3.schemaCd1;
  const [caseOuverte, setCaseOuverte] = useState<CleCase | null>(null);

  if (!schema) return null;

  const cases = compterCasesCompletes(schema);
  const aspectA = state.bloc2.aspectA;
  const aspectB = state.bloc2.aspectB;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {SECTION_B_SCHEMA_COMPTEUR(cases)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        {/* Colonne gauche : case Objet (s'étend verticalement en desktop) */}
        <div className="md:sticky md:top-4 md:self-start">
          <CaseSchema
            cle="objet"
            donnees={obtenirCase(schema, "objet")}
            aspectA={aspectA}
            aspectB={aspectB}
            onOuvrir={setCaseOuverte}
          />
        </div>

        {/* Colonne droite : deux blocs de mise en relation empilés */}
        <div className="space-y-4">
          {/* Bloc A */}
          <div className="rounded-lg border border-border bg-panel p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Mise en relation — <LibelleAspect aspect={aspectA} />
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CASES_BLOC_A.map((cle) => (
                <CaseSchema
                  key={cle}
                  cle={cle}
                  donnees={obtenirCase(schema, cle)}
                  aspectA={aspectA}
                  aspectB={aspectB}
                  onOuvrir={setCaseOuverte}
                />
              ))}
            </div>
          </div>

          {/* Bloc B */}
          <div className="rounded-lg border border-border bg-panel p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Mise en relation — <LibelleAspect aspect={aspectB} />
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CASES_BLOC_B.map((cle) => (
                <CaseSchema
                  key={cle}
                  cle={cle}
                  donnees={obtenirCase(schema, cle)}
                  aspectA={aspectA}
                  aspectB={aspectB}
                  onOuvrir={setCaseOuverte}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ModaleEditionCase cle={caseOuverte} onClose={() => setCaseOuverte(null)} />
    </section>
  );
}
