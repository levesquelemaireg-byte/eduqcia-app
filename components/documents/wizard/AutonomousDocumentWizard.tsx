"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { createAutonomousDocumentAction } from "@/lib/actions/create-autonomous-document";
import { updateAutonomousDocumentAction } from "@/lib/actions/update-autonomous-document";
import {
  DOCUMENT_WIZARD_STEP_METAS,
  DOCUMENT_WIZARD_STEPS_FOR_STEPPER,
  DOCUMENT_WIZARD_STEP_COUNT,
  type DocumentWizardStepIndex,
} from "@/components/documents/document-wizard-step-meta";
import { ActiveFieldProvider } from "@/components/documents/wizard/active-field-context";
import { DocumentWizardNavFooter } from "@/components/documents/wizard/DocumentWizardNavFooter";
import { DocumentWizardPreview } from "@/components/documents/wizard/DocumentWizardPreview";
import { DocumentWizardPrintPreview } from "@/components/documents/wizard/DocumentWizardPrintPreview";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { PreviewMode } from "@/components/preview/types";
import { StepClassification } from "@/components/documents/wizard/steps/StepClassification";
import { StepConfirmation } from "@/components/documents/wizard/steps/StepConfirmation";
import { StepDocument } from "@/components/documents/wizard/steps/StepDocument";
import { StepStructure } from "@/components/documents/wizard/steps/StepStructure";
import { filterDisciplinesForDocumentNiveau } from "@/lib/documents/filter-disciplines-by-niveau";
import { refIdsEqual } from "@/lib/documents/ref-id";
import {
  AUTONOMOUS_DOCUMENT_WIZARD_DRAFT_KEY,
  type AutonomousDocumentWizardDraftPayload,
} from "@/lib/documents/document-wizard-draft";
import type { DisciplineOption, NiveauOption } from "@/lib/queries/document-ref-data";
import {
  autonomousDocumentFormSchema,
  type AutonomousDocumentFormValues,
} from "@/lib/schemas/autonomous-document";
import { createEmptyElement } from "@/lib/documents/document-element-defaults";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { initialAspects } from "@/lib/tache/redaction-helpers";
import {
  DOCUMENT_MODULE_PAGE_TITLE,
  DOCUMENT_MODULE_PAGE_TITLE_EDIT,
  PREVIEW_PANEL_PRINT_LABEL,
  PREVIEW_PANEL_SUMMARY_LABEL,
  DOCUMENT_WIZARD_INTRO,
  TOAST_DOCUMENT_CREATE_AUTH,
  TOAST_DOCUMENT_CREATE_FAILED,
  TOAST_DOCUMENT_CREATE_SUCCESS,
  TOAST_DOCUMENT_EDIT_FORBIDDEN,
  TOAST_DOCUMENT_UPDATE_SUCCESS,
  TOAST_DOCUMENT_WIZARD_DRAFT_SAVED,
  TOAST_DRAFT_SAVE_FAILED,
} from "@/lib/ui/ui-copy";
import { WizardStepper } from "@/components/wizard/WizardStepper";

type Props = {
  niveaux: NiveauOption[];
  disciplines: DisciplineOption[];
  /** Édition `/documents/[id]/edit` — pas de brouillon session, soumission = mise à jour. */
  mode?: "create" | "edit";
  documentId?: string;
  initialValues?: AutonomousDocumentFormValues;
};

function defaultFormValues(): AutonomousDocumentFormValues {
  return {
    // §2.10.1 — aucune structure pré-sélectionnée au démarrage.
    structure: null,
    nb_perspectives: undefined,
    titre: "",
    elements: [createEmptyElement()],
    repere_temporel: "",
    annee_normalisee: null,
    niveau_id: 0,
    discipline_id: 0,
    connaissances_miller: [],
    aspects: { ...initialAspects },
    legal_accepted: false,
  };
}

export function AutonomousDocumentWizard({
  niveaux,
  disciplines,
  mode = "create",
  documentId,
  initialValues,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<DocumentWizardStepIndex>(0);
  const [draftSaving, setDraftSaving] = useState(false);
  const draftHydrated = useRef(false);

  const form = useForm<AutonomousDocumentFormValues>({
    resolver: zodResolver(autonomousDocumentFormSchema) as Resolver<AutonomousDocumentFormValues>,
    defaultValues: defaultFormValues(),
    mode: "onSubmit",
  });

  const { handleSubmit, trigger, getValues, reset, watch, setValue, formState } = form;
  const { isSubmitting } = formState;

  const niveauId = watch("niveau_id");
  const legalAccepted = watch("legal_accepted");

  const filteredDisciplines = useMemo(
    () => filterDisciplinesForDocumentNiveau(disciplines, niveaux, niveauId),
    [disciplines, niveaux, niveauId],
  );

  useEffect(() => {
    const d = getValues("discipline_id");
    if (d > 0 && !filteredDisciplines.some((x) => refIdsEqual(x.id, d))) {
      setValue("discipline_id", 0);
      setValue("connaissances_miller", []);
    }
  }, [niveauId, filteredDisciplines, getValues, setValue]);

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({ ...defaultFormValues(), ...initialValues, legal_accepted: true });
      draftHydrated.current = true;
      return;
    }
    if (draftHydrated.current) return;
    draftHydrated.current = true;
    try {
      const raw = sessionStorage.getItem(AUTONOMOUS_DOCUMENT_WIZARD_DRAFT_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as AutonomousDocumentWizardDraftPayload;
      if (p?.v !== 1 || !p.values || typeof p.values !== "object") return;
      const rawDraft = { ...(p.values as Record<string, unknown>) };
      delete rawDraft.connaissances_ids;
      const partial = rawDraft as unknown as Partial<AutonomousDocumentFormValues>;
      const merged: AutonomousDocumentFormValues = {
        ...defaultFormValues(),
        ...partial,
        connaissances_miller: Array.isArray(partial.connaissances_miller)
          ? partial.connaissances_miller
          : [],
      };
      reset(merged);
      if (typeof p.step === "number" && p.step >= 0 && p.step < DOCUMENT_WIZARD_STEP_COUNT) {
        setStep(p.step as DocumentWizardStepIndex);
      }
    } catch {
      /* ignore */
    }
  }, [reset, mode, initialValues]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(AUTONOMOUS_DOCUMENT_WIZARD_DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const saveDraft = useCallback(() => {
    setDraftSaving(true);
    try {
      const payload: AutonomousDocumentWizardDraftPayload = {
        v: 1,
        step,
        values: getValues() as unknown as Record<string, unknown>,
      };
      sessionStorage.setItem(AUTONOMOUS_DOCUMENT_WIZARD_DRAFT_KEY, JSON.stringify(payload));
      toast.success(TOAST_DOCUMENT_WIZARD_DRAFT_SAVED);
    } catch {
      toast.error(TOAST_DRAFT_SAVE_FAILED);
    } finally {
      setDraftSaving(false);
    }
  }, [getValues, step]);

  const validateStep = useCallback(
    async (s: DocumentWizardStepIndex): Promise<boolean> => {
      if (s === 0) {
        // §2.10.1 — la structure doit être choisie explicitement (Zod accepte null côté form).
        const st = getValues("structure");
        if (st == null) return false;
        if (st === "perspectives") {
          const nb = getValues("nb_perspectives");
          if (nb !== 2 && nb !== 3) return false;
        }
        return true;
      }
      if (s === 1) {
        const titreOk = await trigger(["titre"]);
        if (!titreOk) return false;
        // Validation manuelle des éléments (évite le superRefine global)
        const st = getValues("structure");
        const els = getValues("elements");
        for (const el of els) {
          // §2.10.1 — type et source_type doivent être choisis.
          if (el.type == null) return false;
          if (el.source_type == null) return false;
          if (el.type === "textuel" && !htmlHasMeaningfulText(el.contenu ?? "")) return false;
          if (el.type === "textuel" && el.categorie_textuelle == null) return false;
          if (el.type === "iconographique" && !(el.image_url ?? "").trim()) return false;
          if (!htmlHasMeaningfulText(el.source_citation ?? "")) return false;
          if (st === "perspectives" && !(el.auteur ?? "").trim()) return false;
          if (st === "deux_temps" && !(el.repere_temporel ?? "").trim()) return false;
        }
        return true;
      }
      if (s === 2) {
        return trigger(["niveau_id", "discipline_id", "aspects"]);
      }
      return true;
    },
    [getValues, trigger],
  );

  const handleNext = async () => {
    const ok = await validateStep(step);
    if (!ok) {
      toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
      return;
    }
    setStep((prev) =>
      prev < DOCUMENT_WIZARD_STEP_COUNT - 1 ? ((prev + 1) as DocumentWizardStepIndex) : prev,
    );
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 0 ? ((prev - 1) as DocumentWizardStepIndex) : prev));
  };

  const onValid = async (data: AutonomousDocumentFormValues) => {
    if (mode === "edit" && documentId) {
      const r = await updateAutonomousDocumentAction({ ...data, document_id: documentId });
      if (r.ok === false) {
        if (r.code === "auth") toast.error(TOAST_DOCUMENT_CREATE_AUTH);
        else if (r.code === "forbidden") toast.error(TOAST_DOCUMENT_EDIT_FORBIDDEN);
        else if (r.fieldErrors) {
          for (const msg of Object.values(r.fieldErrors)) {
            toast.error(msg);
          }
        } else if (r.code === "db" && r.message) {
          toast.error(r.message);
        } else toast.error(TOAST_DOCUMENT_CREATE_FAILED);
        return;
      }
      toast.success(TOAST_DOCUMENT_UPDATE_SUCCESS);
      router.push(`/documents/${documentId}`);
      router.refresh();
      return;
    }

    const r = await createAutonomousDocumentAction(data);
    if (r.ok === false) {
      if (r.code === "auth") toast.error(TOAST_DOCUMENT_CREATE_AUTH);
      else if (r.fieldErrors) {
        for (const msg of Object.values(r.fieldErrors)) {
          toast.error(msg);
        }
      } else if (r.code === "db" && r.message) {
        toast.error(r.message);
      } else toast.error(TOAST_DOCUMENT_CREATE_FAILED);
      return;
    }
    clearDraft();
    toast.success(TOAST_DOCUMENT_CREATE_SUCCESS);
    router.push(`/documents/${r.documentId}`);
    router.refresh();
  };

  const PREVIEW_MODES: PreviewMode[] = [
    { id: "sommaire", label: PREVIEW_PANEL_SUMMARY_LABEL, icon: "topic" },
    { id: "impression", label: PREVIEW_PANEL_PRINT_LABEL, icon: "print" },
  ];

  const stepMeta = DOCUMENT_WIZARD_STEP_METAS[step];
  const stepDescription = stepMeta.description.trim();

  const canPrev = step > 0;
  const showNext = step < DOCUMENT_WIZARD_STEP_COUNT - 1;

  const handleCompletedStepClick = (index: number) => {
    if (index < step) setStep(index as DocumentWizardStepIndex);
  };

  return (
    <FormProvider {...form}>
      <ActiveFieldProvider>
        <div className="tache-wizard-split-root flex min-h-0 w-full flex-col xl:h-[calc(100dvh-3rem)] xl:max-h-[calc(100dvh-3rem)] xl:flex-row xl:overflow-hidden">
          <div className="tache-wizard-editor-column min-w-0 bg-(--color-panel) px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 xl:w-[42%] xl:max-w-none xl:shrink-0 xl:overflow-y-auto xl:overscroll-y-contain">
            <div>
              <header>
                <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
                  {mode === "edit" ? DOCUMENT_MODULE_PAGE_TITLE_EDIT : DOCUMENT_MODULE_PAGE_TITLE}
                </h1>
                <p className="mt-2 text-sm text-muted md:text-base">{DOCUMENT_WIZARD_INTRO}</p>
              </header>

              <div className="mt-6 border-b border-border pb-5 md:mt-8 md:pb-6">
                <WizardStepper
                  className="px-0 pb-0 pt-0"
                  steps={DOCUMENT_WIZARD_STEPS_FOR_STEPPER}
                  currentStep={step}
                  onCompletedStepClick={handleCompletedStepClick}
                  navAriaLabel="Étapes du formulaire de création de document"
                />
              </div>

              <div className="pt-6 md:pt-8">
                <h2
                  id="document-wizard-step-heading"
                  className="text-xl font-semibold tracking-tight text-deep"
                >
                  {stepMeta.label}
                </h2>
                {stepDescription ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{stepDescription}</p>
                ) : null}

                <div className="mt-6">
                  {step === 0 ? <StepStructure /> : null}
                  {step === 1 ? <StepDocument /> : null}
                  {step === 2 ? (
                    <StepClassification niveaux={niveaux} disciplineOptions={filteredDisciplines} />
                  ) : null}
                  {step === 3 ? <StepConfirmation /> : null}

                  <DocumentWizardNavFooter
                    canPrev={canPrev}
                    onPrev={handlePrev}
                    showNext={showNext}
                    onNext={() => void handleNext()}
                    nextDisabled={false}
                    onSaveDraft={saveDraft}
                    draftSaving={draftSaving}
                    showDraft={mode !== "edit"}
                    onSubmit={() => void handleSubmit(onValid)()}
                    submitDisabled={!legalAccepted}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[min(70vh,36rem)] min-w-0 flex-1 flex-col border-l border-border bg-panel xl:min-h-0 xl:overflow-hidden">
            <PreviewPanel
              modes={PREVIEW_MODES}
              defaultModeId="sommaire"
              topBarClassName="sticky top-0 z-10"
              className="relative min-h-0 flex-1"
            >
              {(modeId, _subModeId, _subSubModeId) =>
                modeId === "impression" ? (
                  <div className="tache-wizard-preview-canvas flex min-h-0 min-w-0 flex-1 justify-center overflow-y-auto overscroll-y-contain p-4 sm:p-6 xl:p-20 xl:pt-16">
                    <aside className="min-w-0 w-full max-w-(--tache-print-sheet-width)">
                      <DocumentWizardPrintPreview />
                    </aside>
                  </div>
                ) : (
                  <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-y-auto overscroll-y-contain bg-panel p-4 sm:p-6 xl:px-12 xl:pt-8">
                    <DocumentWizardPreview
                      step={step}
                      niveaux={niveaux}
                      disciplines={disciplines}
                    />
                  </div>
                )
              }
            </PreviewPanel>
          </div>
        </div>
      </ActiveFieldProvider>
    </FormProvider>
  );
}
