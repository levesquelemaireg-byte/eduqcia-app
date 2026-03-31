"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { createAutonomousDocumentAction } from "@/lib/actions/create-autonomous-document";
import {
  DOCUMENT_WIZARD_STEP_METAS,
  DOCUMENT_WIZARD_STEPS_FOR_STEPPER,
  DOCUMENT_WIZARD_STEP_COUNT,
  type DocumentWizardStepIndex,
} from "@/components/documents/document-wizard-step-meta";
import { DocumentWizardNavFooter } from "@/components/documents/wizard/DocumentWizardNavFooter";
import { DocumentWizardPrintModal } from "@/components/documents/wizard/DocumentWizardPrintModal";
import { DocumentWizardPreview } from "@/components/documents/wizard/DocumentWizardPreview";
import { StepClassification } from "@/components/documents/wizard/steps/StepClassification";
import { StepConfirmation } from "@/components/documents/wizard/steps/StepConfirmation";
import { StepDocument } from "@/components/documents/wizard/steps/StepDocument";
import { WizardPreviewToolbar } from "@/components/tae/TaeForm/preview/WizardPreviewToolbar";
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
import { initialAspects } from "@/lib/tae/redaction-helpers";
import {
  DOCUMENT_MODULE_PAGE_TITLE,
  DOCUMENT_WIZARD_INTRO,
  DOCUMENT_WIZARD_PREVIEW_HEADING,
  TOAST_DOCUMENT_CREATE_AUTH,
  TOAST_DOCUMENT_CREATE_FAILED,
  TOAST_DOCUMENT_CREATE_DEGRADED,
  TOAST_DOCUMENT_CREATE_SUCCESS,
  TOAST_DOCUMENT_WIZARD_DRAFT_SAVED,
  TOAST_DRAFT_SAVE_FAILED,
} from "@/lib/ui/ui-copy";
import { WizardStepper } from "@/components/wizard/WizardStepper";

type Props = {
  niveaux: NiveauOption[];
  disciplines: DisciplineOption[];
};

function defaultFormValues(): AutonomousDocumentFormValues {
  return {
    titre: "",
    doc_type: "textuel",
    contenu: "",
    image_url: "",
    image_intrinsic_width: undefined,
    image_intrinsic_height: undefined,
    source_citation: "",
    source_type: "secondaire",
    niveau_id: 0,
    discipline_id: 0,
    connaissances_miller: [],
    aspects: { ...initialAspects },
    image_legende: "",
    image_legende_position: null,
    repere_temporel: "",
    annee_normalisee: null,
    legal_accepted: false,
  };
}

export function AutonomousDocumentWizard({ niveaux, disciplines }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<DocumentWizardStepIndex>(0);
  const [printOpen, setPrintOpen] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const draftHydrated = useRef(false);

  const form = useForm<AutonomousDocumentFormValues>({
    resolver: zodResolver(autonomousDocumentFormSchema) as Resolver<AutonomousDocumentFormValues>,
    defaultValues: defaultFormValues(),
    mode: "onBlur",
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
  }, [reset]);

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
        const base = await trigger(["titre", "doc_type", "source_citation", "source_type"]);
        if (!base) return false;
        const dt = getValues("doc_type");
        if (dt === "textuel") return trigger(["contenu"]);
        return trigger(["image_url", "image_legende", "image_legende_position"]);
      }
      if (s === 1) {
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
    if (r.degraded) {
      toast.warning(TOAST_DOCUMENT_CREATE_DEGRADED);
    } else {
      toast.success(TOAST_DOCUMENT_CREATE_SUCCESS);
    }
    router.push(`/documents/${r.documentId}`);
    router.refresh();
  };

  const stepMeta = DOCUMENT_WIZARD_STEP_METAS[step];
  const stepDescription = stepMeta.description.trim();

  const canPrev = step > 0;
  const showNext = step < DOCUMENT_WIZARD_STEP_COUNT - 1;
  const showSubmit = step === DOCUMENT_WIZARD_STEP_COUNT - 1;

  const handleCompletedStepClick = (index: number) => {
    if (index < step) setStep(index as DocumentWizardStepIndex);
  };

  return (
    <FormProvider {...form}>
      <div className="tae-wizard-split-root flex min-h-0 w-full flex-col xl:h-[calc(100dvh-3rem)] xl:max-h-[calc(100dvh-3rem)] xl:flex-row xl:overflow-hidden">
        <div className="tae-wizard-editor-column min-w-0 bg-[var(--color-panel)] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 xl:w-[42%] xl:max-w-none xl:shrink-0 xl:overflow-y-auto xl:overscroll-y-contain">
          <header className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
              {DOCUMENT_MODULE_PAGE_TITLE}
            </h1>
            <p className="mt-2 max-w-none text-sm text-muted md:text-base">
              {DOCUMENT_WIZARD_INTRO}
            </p>
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
              <p className="mt-2 max-w-none text-sm leading-relaxed text-muted">
                {stepDescription}
              </p>
            ) : null}

            <div className="mt-6 max-w-2xl">
              {step === 0 ? <StepDocument /> : null}
              {step === 1 ? (
                <StepClassification niveaux={niveaux} disciplineOptions={filteredDisciplines} />
              ) : null}
              {step === 2 ? <StepConfirmation /> : null}
            </div>

            <DocumentWizardNavFooter
              canPrev={canPrev}
              onPrev={handlePrev}
              showNext={showNext}
              onNext={() => void handleNext()}
              nextDisabled={false}
              onSaveDraft={saveDraft}
              draftSaving={draftSaving}
              showSubmit={showSubmit}
              onSubmit={() => void handleSubmit(onValid)()}
              submitDisabled={!legalAccepted}
              isSubmitting={isSubmitting}
            />

            <section
              className="mt-10 border-t border-border pt-6 xl:hidden"
              aria-labelledby="document-wizard-mobile-preview-title"
            >
              <h3
                id="document-wizard-mobile-preview-title"
                className="text-base font-semibold text-deep"
              >
                {DOCUMENT_WIZARD_PREVIEW_HEADING}
              </h3>
              <div className="mt-4 max-h-[min(55vh,28rem)] overflow-y-auto rounded-xl border border-border/60 bg-steel/10 p-4">
                <DocumentWizardPreview compact />
              </div>
            </section>
          </div>
        </div>

        <div className="tae-wizard-preview-canvas relative hidden min-h-0 min-w-0 flex-1 flex-col xl:flex xl:min-h-0 xl:overflow-hidden">
          <WizardPreviewToolbar onOpenPrintPreview={() => setPrintOpen(true)} />
          <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain p-[80px]">
            <aside className="min-w-0 w-full">
              <DocumentWizardPreview />
            </aside>
          </div>
        </div>
      </div>

      <DocumentWizardPrintModal open={printOpen} onClose={() => setPrintOpen(false)}>
        <DocumentWizardPreview />
      </DocumentWizardPrintModal>
    </FormProvider>
  );
}
