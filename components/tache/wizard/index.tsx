"use client";

import type { ComponentType, ReactNode } from "react";
import { createElement } from "react";
import { Bloc1AuteursTache } from "@/components/tache/wizard/Bloc1AuteursTache";
import { Bloc2ParametresTache } from "@/components/tache/wizard/Bloc2ParametresTache";
import { Bloc3ConsigneProduction } from "@/components/tache/wizard/Bloc3ConsigneProduction";
import { Bloc4DocumentsHistoriques } from "@/components/tache/wizard/Bloc4DocumentsHistoriques";
import { Bloc6CompetenceDisciplinaire } from "@/components/tache/wizard/Bloc6CompetenceDisciplinaire";
import { Bloc7AspectsConnaissances } from "@/components/tache/wizard/Bloc7AspectsConnaissances";
import { Bloc5 } from "@/components/tache/wizard/bloc5/Bloc5";
import { ApercuImprimeLiveTache } from "@/components/partagees/apercu-imprime-live";
import { FicheSommaireColumn } from "@/components/tache/wizard/sommaire";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { PreviewMode } from "@/components/preview/types";
import { Stepper } from "@/components/tache/wizard/Stepper";
import { StepHeader } from "@/components/tache/wizard/StepHeader";
import { StepperNavFooter } from "@/components/tache/wizard/StepperNavFooter";
import { WizardDraftBanners } from "@/components/tache/wizard/WizardDraftBanners";
import { WizardDraftIndicator } from "@/components/tache/wizard/WizardDraftIndicator";
import { WizardDraftObsoleteToast } from "@/components/tache/wizard/WizardDraftObsoleteToast";
import { WizardSessionProvider } from "@/components/tache/wizard/WizardSessionContext";
import {
  InjectDocumentController,
  type PendingInjection,
} from "@/components/tache/wizard/InjectDocumentController";
import {
  TacheFormProvider,
  useTacheForm,
  TACHE_BLUEPRINT_STEP_INDEX,
  TACHE_DOCUMENTS_STEP_INDEX,
  TACHE_REDACTION_STEP_INDEX,
  type TacheFormState,
} from "@/components/tache/wizard/FormState";
import { TACHE_FORM_STEPS } from "@/components/tache/wizard/step-meta";
import { resolveWizardBlocComponent } from "@/components/tache/wizard/wizardBlocResolver";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import type { WizardFichePreviewMeta } from "@/lib/tache/fiche-helpers";
import type { TacheVersionSnapshot } from "@/lib/tache/publish-tache-types";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tache/non-redaction/wizard-variant";
import {
  NR_AVANT_APRES_STEP4_DESCRIPTION,
  NR_AVANT_APRES_STEP4_TITLE,
  NR_LIGNE_TEMPS_STEP4_DESCRIPTION,
  NR_LIGNE_TEMPS_STEP4_TITLE,
  NR_ORDRE_STEP4_DESCRIPTION,
  NR_ORDRE_STEP4_TITLE,
  PREVIEW_PANEL_PRINT_CORRIGE_LABEL,
  PREVIEW_PANEL_PRINT_FORMATIF_LABEL,
  PREVIEW_PANEL_PRINT_LABEL,
  PREVIEW_PANEL_PRINT_SOMMATIF_STANDARD_LABEL,
  PREVIEW_PANEL_SUMMARY_LABEL,
  TACHE_BLUEPRINT_STEP_INFO_BUTTON_ARIA,
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

type TacheFormInnerProps = {
  pageHeader?: ReactNode;
  savedServerDraft: TacheFormState | null;
  serverDraftObsolete: boolean;
  wizardPreviewMeta: WizardFichePreviewMeta;
  showDraftBanners: boolean;
  pendingInjection: PendingInjection | null;
  injectionError: "not_found" | null;
};

function TacheFormInner({
  pageHeader,
  savedServerDraft,
  serverDraftObsolete,
  wizardPreviewMeta,
  showDraftBanners,
  pendingInjection,
  injectionError,
}: TacheFormInnerProps) {
  const { state } = useTacheForm();
  const stepBase = TACHE_FORM_STEPS[state.currentStep];
  const step =
    isActiveOrdreChronologiqueVariant(state) && state.currentStep === TACHE_DOCUMENTS_STEP_INDEX
      ? {
          ...stepBase,
          label: NR_ORDRE_STEP4_TITLE,
          description: NR_ORDRE_STEP4_DESCRIPTION,
        }
      : isActiveLigneDuTempsVariant(state) && state.currentStep === TACHE_DOCUMENTS_STEP_INDEX
        ? {
            ...stepBase,
            label: NR_LIGNE_TEMPS_STEP4_TITLE,
            description: NR_LIGNE_TEMPS_STEP4_DESCRIPTION,
          }
        : isActiveAvantApresVariant(state) && state.currentStep === TACHE_DOCUMENTS_STEP_INDEX
          ? {
              ...stepBase,
              label: NR_AVANT_APRES_STEP4_TITLE,
              description: NR_AVANT_APRES_STEP4_DESCRIPTION,
            }
          : stepBase;
  const blocType: ComponentType =
    state.currentStep === TACHE_REDACTION_STEP_INDEX ||
    state.currentStep === TACHE_DOCUMENTS_STEP_INDEX
      ? (resolveWizardBlocComponent(state.currentStep, state) ?? BLOC_COMPONENTS[state.currentStep])
      : BLOC_COMPONENTS[state.currentStep];
  const TACHE_PREVIEW_MODES: PreviewMode[] = [
    { id: "sommaire", label: PREVIEW_PANEL_SUMMARY_LABEL, icon: "topic" },
    {
      id: "impression",
      label: PREVIEW_PANEL_PRINT_LABEL,
      icon: "print",
      subModes: [
        { id: "formatif", label: PREVIEW_PANEL_PRINT_FORMATIF_LABEL, icon: "exercise" },
        {
          id: "sommatif-standard",
          label: PREVIEW_PANEL_PRINT_SOMMATIF_STANDARD_LABEL,
          icon: "two_pager",
        },
        { id: "corrige", label: PREVIEW_PANEL_PRINT_CORRIGE_LABEL, icon: ICONES_METIER.corrige },
      ],
    },
  ];

  return (
    <>
      <WizardDraftObsoleteToast show={serverDraftObsolete} />
      <InjectDocumentController
        pendingInjection={pendingInjection}
        injectionError={injectionError}
      />
      <div className="tache-wizard-split-root flex min-h-0 w-full flex-col xl:h-[calc(100dvh-3rem)] xl:max-h-[calc(100dvh-3rem)] xl:flex-row xl:overflow-hidden">
        {/* Colonne édition — fond blanc (token panel), pas de carte ; scroll interne sur xl */}
        <div className="tache-wizard-editor-column min-w-0 bg-(--color-panel) px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 xl:w-[42%] xl:max-w-none xl:shrink-0 xl:overflow-y-auto xl:overscroll-y-contain">
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
            {state.currentStep === TACHE_BLUEPRINT_STEP_INDEX ? (
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="tache-step-heading"
                  className="text-xl font-semibold tracking-tight text-deep"
                  aria-describedby="tache-blueprint-step-longdesc"
                >
                  {step.label}
                </h2>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
                  aria-label={TACHE_BLUEPRINT_STEP_INFO_BUTTON_ARIA}
                  title={step.description}
                >
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    info
                  </span>
                </button>
                <p id="tache-blueprint-step-longdesc" className="sr-only">
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

        {/* Colonne aperçu */}
        <div className="tache-wizard-preview-canvas relative flex min-h-[min(70vh,36rem)] min-w-0 flex-1 flex-col xl:min-h-0 xl:overflow-hidden">
          <PreviewPanel
            modes={TACHE_PREVIEW_MODES}
            defaultModeId="sommaire"
            topBarClassName="sticky top-0 z-10"
            className="relative min-h-0 flex-1"
          >
            {(modeId, subModeId) => {
              const isImpressionMode = modeId === "impression";
              const varianteActive = subModeId ?? "formatif";
              const estCorrige = varianteActive === "corrige";
              const modeImpression: ModeImpression =
                varianteActive === "formatif" ? "formatif" : "sommatif-standard";

              if (isImpressionMode) {
                return (
                  <ApercuImprimeLiveTache
                    previewMeta={wizardPreviewMeta}
                    mode={modeImpression}
                    estCorrige={estCorrige}
                  />
                );
              }

              return (
                <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-y-auto overscroll-y-contain p-4 sm:p-6 xl:p-20 xl:pt-16">
                  <aside className="min-w-0 w-full max-w-(--tache-print-sheet-width)">
                    <FicheSommaireColumn previewMeta={wizardPreviewMeta} />
                  </aside>
                </div>
              );
            }}
          </PreviewPanel>
        </div>
      </div>
    </>
  );
}

type TacheFormProps = {
  /** Brouillon serveur — reprise via bannière (`docs/DECISIONS.md` § brouillons). */
  savedServerDraft?: TacheFormState | null;
  /** Brouillon illisible (format antérieur sans `bloc1`) — toast erreur, pas de reprise. */
  serverDraftObsolete?: boolean;
  /** Hydratation serveur pour `/questions/[id]/edit` (exclusif du flux « Créer » vide). */
  serverInitialState?: TacheFormState | null;
  /** Si défini, enregistrement via `update_tache_transaction`. */
  editingTacheId?: string | null;
  /** Snapshot des champs majeurs — détection version avant soumission (`/questions/[id]/edit`). */
  versionSnapshot?: TacheVersionSnapshot | null;
  /** `auth.users.id` — recherche collaborateurs Bloc 1. */
  currentUserId?: string | null;
  /** En-tête page (titre, intro) — rendu en tête de colonne édition. */
  children?: ReactNode;
  /** Pied de fiche sommaire : nom réel + date d’ouverture (serveur, stable SSR/hydratation). */
  wizardPreviewMeta: WizardFichePreviewMeta;
  /** Deep-link banque → wizard tâche — document à injecter (SPEC §4). */
  pendingInjection?: PendingInjection | null;
  /** Deep-link banque — document introuvable ou inaccessible (toast erreur). */
  injectionError?: "not_found" | null;
};

export function TacheForm({
  savedServerDraft = null,
  serverDraftObsolete = false,
  serverInitialState = null,
  editingTacheId = null,
  versionSnapshot = null,
  currentUserId = null,
  children,
  wizardPreviewMeta,
  pendingInjection = null,
  injectionError = null,
}: TacheFormProps) {
  const persistSessionDraft = !editingTacheId;
  const showDraftBanners = persistSessionDraft;

  return (
    <WizardSessionProvider
      value={{
        editingTacheId: editingTacheId ?? null,
        persistSessionDraft,
        currentUserId: currentUserId ?? null,
        versionSnapshot: versionSnapshot ?? null,
      }}
    >
      <TacheFormProvider
        serverInitialState={serverInitialState}
        persistSessionDraft={persistSessionDraft}
      >
        <TacheFormInner
          pageHeader={children}
          savedServerDraft={savedServerDraft}
          serverDraftObsolete={serverDraftObsolete}
          wizardPreviewMeta={wizardPreviewMeta}
          showDraftBanners={showDraftBanners}
          pendingInjection={pendingInjection}
          injectionError={injectionError}
        />
      </TacheFormProvider>
    </WizardSessionProvider>
  );
}
