"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { SimpleModal } from "@/components/ui/SimpleModal";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DocumentStructure } from "@/lib/types/document-renderer";
import { createElementsForStructure } from "@/lib/documents/document-element-defaults";
import { useFieldFocusHandlers } from "@/components/documents/wizard/active-field-context";
import { iconForDocumentStructure } from "@/lib/ui/icons/document-structure-icon";
import { cn } from "@/lib/utils/cn";
import {
  DOC_STRUCTURE_SIMPLE_TITLE,
  DOC_STRUCTURE_SIMPLE_DESC,
  DOC_STRUCTURE_SIMPLE_MODAL_BODY,
  DOC_STRUCTURE_PERSPECTIVES_TITLE,
  DOC_STRUCTURE_PERSPECTIVES_DESC,
  DOC_STRUCTURE_PERSPECTIVES_MODAL_BODY,
  DOC_STRUCTURE_DEUX_TEMPS_TITLE,
  DOC_STRUCTURE_DEUX_TEMPS_DESC,
  DOC_STRUCTURE_DEUX_TEMPS_MODAL_BODY,
  DOC_STRUCTURE_PERSPECTIVES_2,
  DOC_STRUCTURE_PERSPECTIVES_3,
} from "@/lib/ui/ui-copy";

type StructureOption = {
  value: DocumentStructure;
  title: string;
  description: string;
  modalBody: string;
  oi?: { icon: string; label: string };
  comportements?: string[];
};

const STRUCTURE_OPTIONS: StructureOption[] = [
  {
    value: "simple",
    title: DOC_STRUCTURE_SIMPLE_TITLE,
    description: DOC_STRUCTURE_SIMPLE_DESC,
    modalBody: DOC_STRUCTURE_SIMPLE_MODAL_BODY,
  },
  {
    value: "perspectives",
    title: DOC_STRUCTURE_PERSPECTIVES_TITLE,
    description: DOC_STRUCTURE_PERSPECTIVES_DESC,
    modalBody: DOC_STRUCTURE_PERSPECTIVES_MODAL_BODY,
    oi: { icon: "text_compare", label: "Dégager des différences et des similitudes" },
    comportements: [
      "Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (divergence)",
      "Indiquer le point précis sur lequel des acteurs ou des historiens sont d'accord (convergence)",
      "Montrer des différences et des similitudes par rapport à des points de vue d'acteurs ou à des interprétations d'historiens",
    ],
  },
  {
    value: "deux_temps",
    title: DOC_STRUCTURE_DEUX_TEMPS_TITLE,
    description: DOC_STRUCTURE_DEUX_TEMPS_DESC,
    modalBody: DOC_STRUCTURE_DEUX_TEMPS_MODAL_BODY,
    oi: { icon: "alt_route", label: "Déterminer des changements et des continuités" },
    comportements: ["Montrer qu'une réalité historique se transforme ou se maintient"],
  },
];

export function StepStructure() {
  const { watch, setValue } = useFormContext<AutonomousDocumentFormValues>();
  const structure = watch("structure");
  const nbPerspectives = watch("nb_perspectives");
  const [modalOpen, setModalOpen] = useState<DocumentStructure | null>(null);

  const handleSelect = (value: DocumentStructure) => {
    setValue("structure", value, { shouldValidate: false });
    if (value !== "perspectives") {
      setValue("nb_perspectives", undefined);
      setValue("elements", createElementsForStructure(value), { shouldValidate: false });
    } else {
      const nb = nbPerspectives ?? 2;
      setValue("nb_perspectives", nb);
      setValue("elements", createElementsForStructure(value, nb), { shouldValidate: false });
    }
  };

  const handlePerspectiveCount = (count: 2 | 3) => {
    setValue("nb_perspectives", count);
    setValue("elements", createElementsForStructure("perspectives", count), {
      shouldValidate: false,
    });
  };

  const modalOption = modalOpen ? STRUCTURE_OPTIONS.find((o) => o.value === modalOpen) : null;
  const structureFocus = useFieldFocusHandlers("structure");

  return (
    <>
      <div
        className="flex flex-col gap-3"
        role="radiogroup"
        aria-label="Structure du document"
        {...structureFocus}
      >
        {STRUCTURE_OPTIONS.map((opt) => {
          const checked = structure === opt.value;
          return (
            <div key={opt.value}>
              <div
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }
                }}
                className={cn(
                  "cursor-pointer rounded-lg bg-panel px-5 py-4 transition-all duration-200",
                  checked
                    ? "border-[1.5px] border-accent shadow-[0_0_0_1px_var(--color-accent)]"
                    : "border border-border hover:border-accent/40",
                )}
              >
                {/* En-tête : radio + icône structure + titre + bouton (i) */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150",
                      checked ? "border-accent bg-accent" : "border-border",
                    )}
                  >
                    {checked ? (
                      <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                        <path
                          d="M2 6.5L4.5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span
                    className="material-symbols-outlined shrink-0 text-[18px] text-muted"
                    aria-hidden="true"
                  >
                    {iconForDocumentStructure(opt.value, nbPerspectives ?? 2)}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-deep">{opt.title}</span>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-panel-alt hover:text-accent"
                    aria-label={`Aide sur ${opt.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpen(opt.value);
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      info
                    </span>
                  </button>
                </div>

                {/* Description courte — toujours visible */}
                <p className="mt-1 pl-13.5 text-xs leading-relaxed text-muted">{opt.description}</p>

                {/* Progressive disclosure — OI + comportements seulement si sélectionné */}
                {checked && opt.oi ? (
                  <div className="mt-3 ml-7.5 rounded-none border-l-2 border-accent/30 bg-accent/5 px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[16px] text-accent"
                        aria-hidden="true"
                        data-oi-glyph={opt.oi.icon}
                      >
                        {opt.oi.icon}
                      </span>
                      <span className="text-xs font-medium text-accent">{opt.oi.label}</span>
                    </div>
                    {opt.comportements ? (
                      <ul className="mt-2 flex flex-col gap-1">
                        {opt.comportements.map((c) => (
                          <li key={c} className="text-[11px] leading-relaxed text-muted">
                            {c}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Sous-choix nombre de perspectives — progressive disclosure */}
              {checked && opt.value === "perspectives" ? (
                <div className="ml-7.5 mt-2 flex flex-col gap-2">
                  <PerspectiveCountRadio
                    count={2}
                    selected={nbPerspectives === 2}
                    onSelect={() => handlePerspectiveCount(2)}
                    description={DOC_STRUCTURE_PERSPECTIVES_2}
                  />
                  <PerspectiveCountRadio
                    count={3}
                    selected={nbPerspectives === 3}
                    onSelect={() => handlePerspectiveCount(3)}
                    description={DOC_STRUCTURE_PERSPECTIVES_3}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {modalOption ? (
        <SimpleModal
          open={modalOpen !== null}
          onClose={() => setModalOpen(null)}
          title={modalOption.title}
          titleStyle="info-help"
        >
          <div className="space-y-3 text-sm leading-relaxed text-steel">
            {modalOption.modalBody.split("\n\n").map((paragraph, i) =>
              paragraph.startsWith("- ") ? (
                <ul key={i} className="list-disc space-y-1 pl-5">
                  {paragraph.split("\n").map((line, j) => (
                    <li key={j}>{line.replace(/^- /, "")}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{paragraph}</p>
              ),
            )}
          </div>
        </SimpleModal>
      ) : null}
    </>
  );
}

function PerspectiveCountRadio({
  count,
  selected,
  onSelect,
  description,
}: {
  count: 2 | 3;
  selected: boolean;
  onSelect: () => void;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-2.5 rounded-lg bg-panel px-4 py-3 text-left transition-all duration-200",
        selected
          ? "border-[1.5px] border-accent shadow-[0_0_0_1px_var(--color-accent)]"
          : "border border-border hover:border-accent/40",
      )}
    >
      <span
        className={cn(
          "mt-px flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150",
          selected ? "border-accent bg-accent" : "border-border",
        )}
      >
        {selected ? (
          <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
            <path
              d="M2 6.5L4.5 9L10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] font-medium text-deep">{count} perspectives</span>
        <span className="text-xs leading-relaxed text-muted">{description}</span>
      </span>
    </button>
  );
}
