"use client";

/**
 * Monte le vrai composant bloc résolu dans un TaeFormProvider avec state mocké.
 * Même logique que index.tsx — resolveWizardBlocComponent + fallback BLOC_COMPONENTS.
 */
import { type ComponentType, useMemo } from "react";
import { TaeFormProvider } from "@/components/tache/wizard/FormState";
import { Bloc3ConsigneProduction } from "@/components/tache/wizard/bloc3/Bloc3ConsigneProduction";
import Bloc3ModeleSouple from "@/components/tache/wizard/bloc3/templates/Bloc3ModeleSouple";
import Bloc3TemplateStructure from "@/components/tache/wizard/bloc3/templates/Bloc3TemplateStructure";
import Bloc3TemplatePur from "@/components/tache/wizard/bloc3/templates/Bloc3TemplatePur";
import { Bloc4DocumentsHistoriques } from "@/components/tache/wizard/Bloc4DocumentsHistoriques";
import Bloc4Perspectives from "@/components/tache/wizard/bloc4/Bloc4Perspectives";
import Bloc4Moments from "@/components/tache/wizard/bloc4/Bloc4Moments";
import { Bloc5 } from "@/components/tache/wizard/bloc5/Bloc5";
import { FicheSommaireColumn } from "@/components/tache/wizard/sommaire";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import {
  initialTaeFormState,
  TAE_REDACTION_STEP_INDEX,
  TAE_DOCUMENTS_STEP_INDEX,
  TAE_BLOC5_STEP_INDEX,
  type TaeFormState,
} from "@/lib/tache/tae-form-state-types";
import { documentSlotsFromCount } from "@/lib/tache/blueprint-helpers";
import { emptyPerspectives, emptyMoments } from "@/lib/tache/oi-perspectives/perspectives-helpers";
import type { OiEntryJson } from "@/lib/types/oi";

// NR Bloc3/Bloc4 — imports statiques (même composants que wizardBlocResolver)
import { Bloc3OrdreChronologique } from "@/components/tache/non-redaction/ordre-chronologique/Bloc3OrdreChronologique";
import { Bloc4OrdreChronologique } from "@/components/tache/non-redaction/ordre-chronologique/Bloc4OrdreChronologique";
import { Bloc3LigneDuTemps } from "@/components/tache/non-redaction/ligne-du-temps/Bloc3LigneDuTemps";
import { Bloc4LigneDuTemps } from "@/components/tache/non-redaction/ligne-du-temps/Bloc4LigneDuTemps";
import { Bloc3AvantApres } from "@/components/tache/non-redaction/avant-apres/Bloc3AvantApres";
import { Bloc4AvantApres } from "@/components/tache/non-redaction/avant-apres/Bloc4AvantApres";

// ---------------------------------------------------------------------------
// Résolution du composant — même logique que wizardBlocResolver mais statique
// ---------------------------------------------------------------------------

const NR_BLOCS: Record<string, { Bloc3: ComponentType; Bloc4: ComponentType }> = {
  "ordre-chronologique": { Bloc3: Bloc3OrdreChronologique, Bloc4: Bloc4OrdreChronologique },
  "ligne-du-temps": { Bloc3: Bloc3LigneDuTemps, Bloc4: Bloc4LigneDuTemps },
  "avant-apres": { Bloc3: Bloc3AvantApres, Bloc4: Bloc4AvantApres },
};

function resolveBloc(comportementId: string, bloc: 3 | 4 | 5): ComponentType {
  // Bloc 5 — toujours Bloc5 (son routing interne gère intrus/redactionnel)
  if (bloc === 5) return Bloc5;

  const stepIndex = bloc === 3 ? TAE_REDACTION_STEP_INDEX : TAE_DOCUMENTS_STEP_INDEX;

  // Passe 1 — NR par variant_slug
  const slug = getVariantSlugForComportementId(comportementId);
  if (slug) {
    const pair = NR_BLOCS[slug];
    if (pair) return stepIndex === TAE_REDACTION_STEP_INDEX ? pair.Bloc3 : pair.Bloc4;
  }

  // Passe 2 — WizardBlocConfig
  const config = getWizardBlocConfig(comportementId);
  if (!config) {
    return bloc === 3 ? Bloc3ConsigneProduction : Bloc4DocumentsHistoriques;
  }

  if (bloc === 3) {
    switch (config.bloc3.type) {
      case "modele_souple":
        return Bloc3ModeleSouple;
      case "structure":
        return Bloc3TemplateStructure;
      case "pur":
        return Bloc3TemplatePur;
    }
  }

  // bloc === 4
  if (config.bloc4.type === "perspectives") return Bloc4Perspectives;
  if (config.bloc4.type === "moments") return Bloc4Moments;
  return Bloc4DocumentsHistoriques;
}

// ---------------------------------------------------------------------------
// State mocké
// ---------------------------------------------------------------------------

function buildMockedState(
  comportementId: string,
  bloc: 3 | 4 | 5,
  oiList: OiEntryJson[],
): TaeFormState {
  const oi = oiList.find((o) => o.comportements_attendus.some((c) => c.id === comportementId));
  const comp = oi?.comportements_attendus.find((c) => c.id === comportementId);
  const nb = comp?.nb_documents ?? 1;
  const config = getWizardBlocConfig(comportementId);

  const stepIndex =
    bloc === 3
      ? TAE_REDACTION_STEP_INDEX
      : bloc === 4
        ? TAE_DOCUMENTS_STEP_INDEX
        : TAE_BLOC5_STEP_INDEX;

  return {
    ...initialTaeFormState,
    currentStep: stepIndex,
    bloc2: {
      ...initialTaeFormState.bloc2,
      niveau: "sec3",
      discipline: "hqc",
      comportementId,
      oiId: oi?.id ?? "",
      blueprintLocked: true,
      nbDocuments: nb,
      nbLignes: comp?.nb_lignes ?? 0,
      outilEvaluation: comp?.outil_evaluation ?? null,
      documentSlots: documentSlotsFromCount(nb),
    },
    bloc3: {
      ...initialTaeFormState.bloc3,
      consigne: "<p>Consigne de test — wizard lab.</p>",
      perspectivesMode:
        config?.bloc4.type === "perspectives" || config?.bloc4.type === "moments" ? "groupe" : null,
    },
    bloc4: {
      ...initialTaeFormState.bloc4,
      perspectives:
        config?.bloc4.type === "perspectives" ? emptyPerspectives(config.bloc4.count) : null,
      moments: config?.bloc4.type === "moments" ? emptyMoments(2) : null,
    },
  };
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

type Props = {
  comportementId: string;
  bloc: 3 | 4 | 5;
  showSommaire: boolean;
  oiList: OiEntryJson[];
};

const PREVIEW_META = { authorFullName: "Dev Lab", draftStartedAtIso: new Date().toISOString() };

export function LabBlocViewer({ comportementId, bloc, showSommaire, oiList }: Props) {
  const mockedState = buildMockedState(comportementId, bloc, oiList);
  const Comp = useMemo(() => resolveBloc(comportementId, bloc), [comportementId, bloc]);

  return (
    <TaeFormProvider
      key={`${comportementId}-${bloc}`}
      serverInitialState={mockedState}
      persistSessionDraft={false}
    >
      <div className="flex min-h-[60vh] rounded-lg border border-border">
        {/* Colonne édition */}
        <div
          className={`min-w-0 bg-[var(--color-panel)] p-6 ${showSommaire ? "w-[42%] shrink-0" : "flex-1"}`}
        >
          {/* eslint-disable-next-line react-hooks/static-components -- résolution dynamique intentionnelle (dev lab) */}
          <Comp />
        </div>
        {/* Colonne sommaire */}
        {showSommaire ? (
          <div className="min-w-0 flex-1 overflow-y-auto border-l border-border bg-[var(--color-bg)] p-10">
            <FicheSommaireColumn previewMeta={PREVIEW_META} />
          </div>
        ) : null}
      </div>
    </TaeFormProvider>
  );
}
