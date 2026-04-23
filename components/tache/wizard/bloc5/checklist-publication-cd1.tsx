"use client";

import { useMemo } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import {
  criteresCompletionSchemaCd1,
  stepCibleCritere,
} from "@/lib/tache/schema-cd1/garde-publication";
import { SECTION_B_CHECKLIST_DESCRIPTION, SECTION_B_CHECKLIST_TITRE } from "@/lib/ui/ui-copy";

export function ChecklistPublicationCd1() {
  const { state, dispatch } = useTacheForm();
  const criteres = useMemo(() => criteresCompletionSchemaCd1(state), [state]);
  const totalComplet = criteres.filter((c) => c.complet).length;
  const total = criteres.length;
  const allOk = totalComplet === total;

  return (
    <section
      className={`space-y-3 rounded-lg border p-4 ${allOk ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"}`}
      aria-live="polite"
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-deep">{SECTION_B_CHECKLIST_TITRE}</h4>
          <p className="text-xs text-muted">{SECTION_B_CHECKLIST_DESCRIPTION}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            allOk
              ? "bg-success/15 text-success ring-1 ring-inset ring-success/30"
              : "bg-warning/15 text-warning ring-1 ring-inset ring-warning/30"
          }`}
        >
          {totalComplet}/{total}
        </span>
      </header>

      <ul className="space-y-1.5 text-sm">
        {criteres.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[1.1em] leading-none ${
                c.complet ? "text-success" : "text-warning"
              }`}
              aria-hidden="true"
            >
              {c.complet ? "check_circle" : "radio_button_unchecked"}
            </span>
            {c.complet ? (
              <span className="text-muted line-through">{c.label}</span>
            ) : (
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_STEP", step: stepCibleCritere(c.id) })}
                className="text-deep hover:text-accent hover:underline"
              >
                {c.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
