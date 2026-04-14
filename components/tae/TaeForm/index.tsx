"use client";

import type { ComponentType, ReactNode } from "react";
import { createElement } from "react";
import { Bloc1AuteursTache } from "@/components/tae/TaeForm/Bloc1AuteursTache";
import { Bloc2ParametresTache } from "@/components/tae/TaeForm/Bloc2ParametresTache";
import { Bloc3ConsigneProduction } from "@/components/tae/TaeForm/Bloc3ConsigneProduction";
import { Bloc4DocumentsHistoriques } from "@/components/tae/TaeForm/Bloc4DocumentsHistoriques";
import { Bloc6CompetenceDisciplinaire } from "@/components/tae/TaeForm/Bloc6CompetenceDisciplinaire";
import { Bloc7AspectsConnaissances } from "@/components/tae/TaeForm/Bloc7AspectsConnaissances";
import { Bloc5 } from "@/components/tae/TaeForm/bloc5/Bloc5";
import { PrintableFichePreview } from "@/components/tae/TaeForm/preview/PrintableFichePreview";
import { FicheSommaireColumn } from "@/components/tae/TaeForm/sommaire";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { PreviewMode } from "@/components/preview/types";
import { Stepper } from "@/components/tae/TaeForm/Stepper";
import { StepHeader } from "@/components/tae/TaeForm/StepHeader";
import { StepperNavFooter } from "@/components/tae/TaeForm/StepperNavFooter";
import { WizardDraftBanners } from "@/components/tae/TaeForm/WizardDraftBanners";
import { WizardDraftIndicator } from "@/components/tae/TaeForm/WizardDraftIndicator";
import { WizardDraftObsoleteToast } from "@/components/tae/TaeForm/WizardDraftObsoleteToast";
import { WizardSessionProvider } from "@/components/tae/TaeForm/WizardSessionContext";
import {
  TaeFormProvider,
  useTaeForm,
  TAE_BLUEPRINT_STEP_INDEX,
  TAE_DOCUMENTS_STEP_INDEX,
  TAE_REDACTION_STEP_INDEX,
  type TaeFormState,
} from "@/components/tae/TaeForm/FormState";
import { TAE_FORM_STEPS } from "@/components/tae/TaeForm/step-meta";
import { resolveWizardBlocComponent } from "@/components/tae/TaeForm/wizardBlocResolver";
import type { WizardFichePreviewMeta } from "@/lib/tae/fiche-helpers";
import type { TaeVersionSnapshot } from "@/lib/tae/publish-tae-types";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import {
  NR_AVANT_APRES_STEP4_DESCRIPTION,
  NR_AVANT_APRES_STEP4_TITLE,
  NR_LIGNE_TEMPS_STEP4_DESCRIPTION,
  NR_LIGNE_TEMPS_STEP4_TITLE,
  NR_ORDRE_STEP4_DESCRIPTION,
  NR_ORDRE_STEP4_TITLE,
  TAE_BLUEPRINT_STEP_INFO_BUTTON_ARIA,
} from "@/lib/ui/ui-copy";

const BLOC_COMPONENTS = [
  Bloc1AuteursTache,
  Bloc2ParametresTache,
  Bloc3ConsigneProduction,
  Bloc4DocumentsHistoriques,
  Bloc5,
  Bloc6CompetenceDisciplinaire,
  Bloc7AspectsConnaissances,
] as const satisfies readonly ComponentType[];

type TaeFormInnerProps = {
  pageHeader?: ReactNode;
  savedServerDraft: TaeFormState | null;
  serverDraftObsolete: boolean;
  wizardPreviewMeta: WizardFichePreviewMeta;
  showDraftBanners: boolean;
};

function TaeFormInner({
  pageHeader,
  savedServerDraft,
  serverDraftObsolete,
  wizardPreviewMeta,
  showDraftBanners,
}: TaeFormInnerProps) {
  const { state } = useTaeForm();
  const stepBase = TAE_FORM_STEPS[state.currentStep];
  const step =
    isActiveOrdreChronologiqueVariant(state) && state.currentStep === TAE_DOCUMENTS_STEP_INDEX
      ? {
          ...stepBase,
          label: NR_ORDRE_STEP4_TITLE,
          description: NR_ORDRE_STEP4_DESCRIPTION,
        }
      : isActiveLigneDuTempsVariant(state) && state.currentStep === TAE_DOCUMENTS_STEP_INDEX
        ? {
            ...stepBase,
            label: NR_LIGNE_TEMPS_STEP4_TITLE,
            description: NR_LIGNE_TEMPS_STEP4_DESCRIPTION,
          }
        : isActiveAvantApresVariant(state) && state.currentStep === TAE_DOCUMENTS_STEP_INDEX
          ? {
              ...stepBase,
              label: NR_AVANT_APRES_STEP4_TITLE,
              description: NR_AVANT_APRES_STEP4_DESCRIPTION,
            }
          : stepBase;
  const blocType: ComponentType =
    state.currentStep === TAE_REDACTION_STEP_INDEX || state.currentStep === TAE_DOCUMENTS_STEP_INDEX
      ? (resolveWizardBlocComponent(state.currentStep, state) ?? BLOC_COMPONENTS[state.currentStep])
      : BLOC_COMPONENTS[state.currentStep];
  const TAE_PREVIEW_MODES: PreviewMode[] = [
    { id: "sommaire", label: "Sommaire", icon: "topic" },
    {
      id: "impression",
      label: "Aperçu impression",
      icon: "picture_as_pdf",
      subModes: [
        { id: "dossier", label: "Dossier documentaire", icon: "description" },
        { id: "questionnaire", label: "Questionnaire", icon: "quiz" },
      ],
    },
  ];

  return (
    <>
      <WizardDraftObsoleteToast show={serverDraftObsolete} />
      <div className="tae-wizard-split-root flex min-h-0 w-full flex-col xl:h-[calc(100dvh-3rem)] xl:max-h-[calc(100dvh-3rem)] xl:flex-row xl:overflow-hidden">
        {/* Colonne édition — fond blanc (token panel), pas de carte ; scroll interne sur xl */}
        <div className="tae-wizard-editor-column min-w-0 bg-[var(--color-panel)] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 xl:w-[42%] xl:max-w-none xl:shrink-0 xl:overflow-y-auto xl:overscroll-y-contain">
          {pageHeader ? (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">{pageHeader}</div>
              <div className="shrink-0 pt-2">
                <WizardDraftIndicator />
              </div>
            </div>
          ) : null}
          <div className={pageHeader ? "mt-6" : "mt-0"}>
            {showDraftBanners ? <WizardDraftBanners savedServerDraft={savedServerDraft} /> : null}
          </div>

          <div className="mt-6 border-b border-border pb-5 md:mt-8 md:pb-6">
            <Stepper className="px-0 pb-0 pt-0" />
          </div>

          <div className="pt-6 md:pt-8">
            {state.currentStep === TAE_BLUEPRINT_STEP_INDEX ? (
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="tae-step-heading"
                  className="text-xl font-semibold tracking-tight text-deep"
                  aria-describedby="tae-blueprint-step-longdesc"
                >
                  {step.label}
                </h2>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
                  aria-label={TAE_BLUEPRINT_STEP_INFO_BUTTON_ARIA}
                  title={step.description}
                >
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    info
                  </span>
                </button>
                <p id="tae-blueprint-step-longdesc" className="sr-only">
                  {step.description}
                </p>
              </div>
            ) : (
              <StepHeader
                stepLabel={step.label}
                stepIndex={state.currentStep}
                comportementId={state.bloc2.comportementId || null}
                defaultDescription={step.description}
              />
            )}

            <div className="mt-6">{createElement(blocType)}</div>

            <StepperNavFooter />
          </div>
        </div>

        {/* Colonne aperçu — toggle flottant Sommaire / Impression */}
        <div className="tae-wizard-preview-canvas relative flex min-h-[min(70vh,36rem)] min-w-0 flex-1 flex-col xl:min-h-0 xl:overflow-hidden">
          <PreviewPanel
            modes={TAE_PREVIEW_MODES}
            defaultModeId="sommaire"
            switcherClassName="pointer-events-auto absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg bg-panel/80 px-1 py-1 shadow-md backdrop-blur-sm"
            className="relative min-h-0 flex-1"
          >
            {(modeId, subModeId) => (
              <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-y-auto overscroll-y-contain p-[80px] pt-16">
                <aside className="min-w-0 w-full max-w-(--tae-print-sheet-width)">
                  {modeId === "impression" ? (
                    <PrintableFichePreview
                      previewMeta={wizardPreviewMeta}
                      feuillet={(subModeId as "dossier" | "questionnaire") ?? "dossier"}
                    />
                  ) : (
                    <FicheSommaireColumn previewMeta={wizardPreviewMeta} />
                  )}
                </aside>
              </div>
            )}
          </PreviewPanel>
        </div>
      </div>
    </>
  );
}

type TaeFormProps = {
  /** Brouillon serveur — reprise via bannière (`docs/DECISIONS.md` § brouillons). */
  savedServerDraft?: TaeFormState | null;
  /** Brouillon illisible (format antérieur sans `bloc1`) — toast erreur, pas de reprise. */
  serverDraftObsolete?: boolean;
  /** Hydratation serveur pour `/questions/[id]/edit` (exclusif du flux « Créer » vide). */
  serverInitialState?: TaeFormState | null;
  /** Si défini, enregistrement via `update_tae_transaction`. */
  editingTaeId?: string | null;
  /** Snapshot des champs majeurs — détection version avant soumission (`/questions/[id]/edit`). */
  versionSnapshot?: TaeVersionSnapshot | null;
  /** `auth.users.id` — recherche collaborateurs Bloc 1. */
  currentUserId?: string | null;
  /** En-tête page (titre, intro) — rendu en tête de colonne édition. */
  children?: ReactNode;
  /** Pied de fiche sommaire : nom réel + date d’ouverture (serveur, stable SSR/hydratation). */
  wizardPreviewMeta: WizardFichePreviewMeta;
};

export function TaeForm({
  savedServerDraft = null,
  serverDraftObsolete = false,
  serverInitialState = null,
  editingTaeId = null,
  versionSnapshot = null,
  currentUserId = null,
  children,
  wizardPreviewMeta,
}: TaeFormProps) {
  const persistSessionDraft = !editingTaeId;
  const showDraftBanners = persistSessionDraft;

  return (
    <WizardSessionProvider
      value={{
        editingTaeId: editingTaeId ?? null,
        persistSessionDraft,
        currentUserId: currentUserId ?? null,
        versionSnapshot: versionSnapshot ?? null,
      }}
    >
      <TaeFormProvider
        serverInitialState={serverInitialState}
        persistSessionDraft={persistSessionDraft}
      >
        <TaeFormInner
          pageHeader={children}
          savedServerDraft={savedServerDraft}
          serverDraftObsolete={serverDraftObsolete}
          wizardPreviewMeta={wizardPreviewMeta}
          showDraftBanners={showDraftBanners}
        />
      </TaeFormProvider>
    </WizardSessionProvider>
  );
}
