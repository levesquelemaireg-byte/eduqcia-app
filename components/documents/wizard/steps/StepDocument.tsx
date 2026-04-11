"use client";

import { useId, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FieldLayout } from "@/components/ui/FieldLayout";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { RepereTemporelField } from "@/components/ui/RepereTemporelField";
import { DocumentElementFields } from "@/components/documents/wizard/steps/DocumentElementFields";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { cn } from "@/lib/utils/cn";
import {
  DOCUMENT_MODULE_TITRE_LABEL,
  DOCUMENT_WIZARD_STEP1_HELP_REPERE_BODY,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_REPERE,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_TITRE,
  REPERE_TEMPOREL_LABEL,
  REPERE_TEMPOREL_MODAL_TITLE,
} from "@/lib/ui/ui-copy";

// ---------------------------------------------------------------------------
// Labels accordéon
// ---------------------------------------------------------------------------

const PERSPECTIVE_LABELS = ["Perspective A", "Perspective B", "Perspective C"];
const DEUX_TEMPS_LABELS = ["Temps 1", "Temps 2"];

function accordionLabel(structure: string, index: number): string {
  if (structure === "perspectives") return PERSPECTIVE_LABELS[index] ?? `Perspective ${index + 1}`;
  if (structure === "deux_temps") return DEUX_TEMPS_LABELS[index] ?? `Temps ${index + 1}`;
  return `Élément ${index + 1}`;
}

type ElementStatus = "locked" | "available" | "complete";

function statusIcon(status: ElementStatus): { icon: string; cls: string } {
  switch (status) {
    case "locked":
      return { icon: "lock", cls: "text-muted" };
    case "available":
      return { icon: "lock_open_right", cls: "text-warning" };
    case "complete":
      return { icon: "check", cls: "text-success" };
  }
}

function statusLabel(status: ElementStatus): string {
  switch (status) {
    case "locked":
      return "Verrouillé";
    case "available":
      return "À compléter";
    case "complete":
      return "Complété";
  }
}

/**
 * Étape 2 « Document » — affiche le formulaire simple ou les accordéons
 * selon la structure choisie à l'étape 1.
 */
export function StepDocument() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AutonomousDocumentFormValues>();
  const structure = watch("structure");
  const titreId = useId();
  const [repereHelpOpen, setRepereHelpOpen] = useState(false);

  const isMulti = structure === "perspectives" || structure === "deux_temps";

  return (
    <div className="space-y-3">
      {/* Titre du document — toujours visible */}
      <FieldLayout
        label={DOCUMENT_MODULE_TITRE_LABEL}
        htmlFor={titreId}
        required
        error={errors.titre?.message}
      >
        <input
          id={titreId}
          type="text"
          {...register("titre")}
          autoComplete="off"
          placeholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_TITRE}
          aria-invalid={errors.titre ? true : undefined}
          className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
        />
      </FieldLayout>

      {/* Repère temporel global */}
      <FieldLayout
        label={REPERE_TEMPOREL_LABEL}
        htmlFor="doc-repere-global"
        labelExtra={<FieldHelpModalButton onClick={() => setRepereHelpOpen(true)} />}
      >
        <RepereTemporelField
          suppressLabelAndHelp
          repereTemporelValue={watch("repere_temporel")}
          onRepereTemporelChange={(val) => setValue("repere_temporel", val)}
          anneeNormaliseeValue={watch("annee_normalisee")}
          onAnneeNormaliseeChange={(val) => setValue("annee_normalisee", val)}
          errorRepere={errors.repere_temporel?.message}
          errorAnnee={errors.annee_normalisee?.message}
          textInputPlaceholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_REPERE}
        />
      </FieldLayout>

      <SimpleModal
        open={repereHelpOpen}
        title={REPERE_TEMPOREL_MODAL_TITLE}
        onClose={() => setRepereHelpOpen(false)}
        titleStyle="info-help"
        panelClassName="max-w-lg"
      >
        <p className="text-sm leading-relaxed text-deep">
          {DOCUMENT_WIZARD_STEP1_HELP_REPERE_BODY}
        </p>
      </SimpleModal>

      <hr className="border-0 border-t border-border/70" />

      {/* Simple : formulaire direct */}
      {!isMulti ? (
        <DocumentElementFields prefix="elements.0" />
      ) : (
        <MultiElementAccordion structure={structure} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accordéon multi-éléments
// ---------------------------------------------------------------------------

function isElementComplete(
  el: AutonomousDocumentFormValues["elements"][number],
  structure: string,
): boolean {
  const hasContent =
    el.type === "textuel" ? htmlHasMeaningfulText(el.contenu ?? "") : Boolean(el.image_url?.trim());
  const hasCategory = el.type === "textuel" ? el.categorie_textuelle != null : true; // catégorie iconographique optionnelle
  const hasSource = htmlHasMeaningfulText(el.source_citation ?? "");
  const hasAuteur = structure !== "perspectives" || Boolean(el.auteur?.trim());
  const hasRepere = structure !== "deux_temps" || Boolean(el.repere_temporel?.trim());
  return hasContent && hasCategory && hasSource && hasAuteur && hasRepere;
}

function MultiElementAccordion({ structure }: { structure: string }) {
  const { control } = useFormContext<AutonomousDocumentFormValues>();
  const elements = useWatch({ control, name: "elements" });
  const [openIndex, setOpenIndex] = useState(0);

  const statuses: ElementStatus[] = useMemo(() => {
    const completions = elements.map((el) => isElementComplete(el, structure));

    return elements.map((_, i) => {
      if (completions[i]) return "complete";
      if (i === 0 || completions[i - 1]) return "available";
      return "locked";
    });
  }, [elements, structure]);

  return (
    <div className="space-y-2">
      {elements.map((_, i) => {
        const status = statuses[i]!;
        const isOpen = i === openIndex;
        const isLocked = status === "locked";
        const { icon, cls } = statusIcon(status);
        const stCls =
          status === "complete"
            ? "text-success"
            : status === "available"
              ? "text-warning"
              : "text-muted";

        return (
          <div
            key={i}
            className={cn(
              "rounded-lg border bg-panel transition-colors duration-300",
              status === "complete"
                ? "border-success"
                : status === "available"
                  ? "border-warning/40"
                  : "border-border",
            )}
          >
            {/* Header accordéon */}
            <div
              role="button"
              tabIndex={isLocked ? -1 : 0}
              aria-expanded={isOpen}
              aria-disabled={isLocked}
              onClick={() => {
                if (isLocked) {
                  toast.info(
                    structure === "perspectives"
                      ? "Complétez les perspectives précédentes pour débloquer celle-ci."
                      : "Complétez le temps précédent pour débloquer celui-ci.",
                  );
                  return;
                }
                setOpenIndex(i);
              }}
              onKeyDown={(e) => {
                if (!isLocked && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setOpenIndex(i);
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-t-lg px-4 py-3 transition-all duration-300",
                status === "complete"
                  ? "bg-success/10"
                  : status === "available"
                    ? "cursor-pointer bg-warning/5 hover:bg-warning/10"
                    : "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px] transition-all duration-300",
                  cls,
                )}
                aria-hidden="true"
              >
                {icon}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm font-semibold transition-colors duration-300",
                  status === "complete" ? "text-success" : "text-deep",
                )}
              >
                {accordionLabel(structure, i)}
              </span>
              <span className={cn("text-xs font-medium transition-colors duration-300", stCls)}>
                {statusLabel(status)}
              </span>
            </div>

            {/* Contenu accordéon */}
            {isOpen ? (
              <div className="border-t border-border px-4 py-4">
                <DocumentElementFields
                  prefix={`elements.${i}` as `elements.${number}`}
                  showAuteur={structure === "perspectives"}
                  showSousTitre={structure === "deux_temps"}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
