"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { ManifestationsConsigneTemplate } from "@/components/tache/non-redaction/consigne-template/ManifestationsConsigneTemplate";
import { useManifestationsPayloadBootstrap } from "@/components/tache/non-redaction/manifestations/useManifestationsPayloadBootstrap";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { LimitCounterPill } from "@/components/ui/LimitCounterPill";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tache/wizard/bloc3/modalCopy";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { getCategoryCount } from "@/lib/tache/non-redaction/manifestations-helpers";
import {
  initialManifestationsPayload,
  isManifestationsComportementId,
  MANIFESTATIONS_LIMITS,
  normalizeManifestationsPayload,
  type ManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import { nonRedactionManifestationsPayload } from "@/lib/tache/wizard-state-nr";
import {
  BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT,
  NR_MANIFESTATIONS_CATEGORIES_SECTION_HINT,
  NR_MANIFESTATIONS_CATEGORIES_SECTION_TITLE,
  NR_MANIFESTATIONS_CATEGORIE_ARIA_PREFIX,
  NR_MANIFESTATIONS_CATEGORIE_LABEL_PREFIX,
  NR_MANIFESTATIONS_CATEGORIE_PLACEHOLDER,
  NR_MANIFESTATIONS_CONSIGNE_HELP_51,
  NR_MANIFESTATIONS_CONSIGNE_HELP_52,
  NR_MANIFESTATIONS_CONSIGNE_INFO_MODAL_BODY,
  NR_MANIFESTATIONS_CONSIGNE_LABEL,
  NR_MANIFESTATIONS_GATE_BLOC3,
  NR_MANIFESTATIONS_GUIDAGE_INFO_MODAL_BODY,
  NR_MANIFESTATIONS_SUJET_LABEL,
} from "@/lib/ui/ui-copy";

export function Bloc3Manifestations() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const consigneId = useId();
  const consigneHelpDescId = useId();
  const [consigneHelpOpen, setConsigneHelpOpen] = useState(false);
  const [guidageHelpOpen, setGuidageHelpOpen] = useState(false);

  useManifestationsPayloadBootstrap();

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p: ManifestationsPayload = useMemo(() => {
    const cid = isManifestationsComportementId(b.comportementId) ? b.comportementId : "5.1";
    return (
      normalizeManifestationsPayload(nonRedactionManifestationsPayload(state)) ??
      initialManifestationsPayload(cid)
    );
  }, [state, b.comportementId]);

  const onConsigneSujetChange = useCallback(
    (next: string) => {
      dispatch({
        type: "NON_REDACTION_PATCH_MANIFESTATIONS",
        patch: { consigneSujet: next },
      });
    },
    [dispatch],
  );

  const onCategoryChange = useCallback(
    (index: number, next: string) => {
      const updated = [...p.categories];
      updated[index] = next;
      dispatch({
        type: "NON_REDACTION_PATCH_MANIFESTATIONS",
        patch: { categories: updated },
      });
    },
    [dispatch, p.categories],
  );

  const onGuidageChange = useCallback(
    (html: string) => {
      dispatch({ type: "SET_GUIDAGE", value: html });
    },
    [dispatch],
  );

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_MANIFESTATIONS_GATE_BLOC3}</p>;
  }

  const consigneHelp =
    p.comportementId === "5.1"
      ? NR_MANIFESTATIONS_CONSIGNE_HELP_51
      : NR_MANIFESTATIONS_CONSIGNE_HELP_52;
  const expectedCategoryCount = getCategoryCount(p.comportementId, p.organisationCategories);

  return (
    <div className="space-y-6">
      <SimpleModal
        open={consigneHelpOpen}
        title={NR_MANIFESTATIONS_CONSIGNE_LABEL}
        onClose={() => setConsigneHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {NR_MANIFESTATIONS_CONSIGNE_INFO_MODAL_BODY}
        </p>
      </SimpleModal>

      <SimpleModal
        open={guidageHelpOpen}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={() => setGuidageHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {NR_MANIFESTATIONS_GUIDAGE_INFO_MODAL_BODY}
        </p>
      </SimpleModal>

      {/* Section consigne ministérielle */}
      <section aria-labelledby={consigneId} className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 id={consigneId} className="text-sm font-semibold text-deep">
            {NR_MANIFESTATIONS_SUJET_LABEL} <RequiredMark />
          </h3>
          <FieldHelpModalButton onClick={() => setConsigneHelpOpen(true)} />
        </div>
        <p id={consigneHelpDescId} className="text-sm leading-relaxed text-muted">
          {consigneHelp}
        </p>
        <ManifestationsConsigneTemplate
          comportementId={p.comportementId}
          consigneSujet={p.consigneSujet}
          onConsigneSujetChange={onConsigneSujetChange}
          describedByIds={consigneHelpDescId}
          inputId={`${consigneId}-input`}
        />
      </section>

      {/* Section catégories */}
      <CategoriesSection
        categories={p.categories}
        expectedCount={expectedCategoryCount}
        onCategoryChange={onCategoryChange}
      />

      {/* Section guidage */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-deep">Guidage complémentaire</h3>
          <FieldHelpModalButton onClick={() => setGuidageHelpOpen(true)} />
        </div>
        <p className="text-xs leading-relaxed text-muted">{BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT}</p>
        <RichTextEditor
          instanceId="manifestations-guidage"
          value={state.bloc3.guidage}
          onChange={onGuidageChange}
          minHeight={100}
          toolbarAriaLabel="Mise en forme — guidage complémentaire"
        />
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section catégories — N champs texte avec compteur                          */
/* -------------------------------------------------------------------------- */

function CategoriesSection({
  categories,
  expectedCount,
  onCategoryChange,
}: {
  categories: string[];
  expectedCount: number;
  onCategoryChange: (index: number, next: string) => void;
}) {
  const limit = MANIFESTATIONS_LIMITS.categorie;
  // Le state reducer normalise déjà la longueur ; on s'aligne ici en cas de désynchro transitoire.
  const slots = Array.from({ length: expectedCount }, (_, i) => categories[i] ?? "");

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-deep">
          {NR_MANIFESTATIONS_CATEGORIES_SECTION_TITLE} <RequiredMark />
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {NR_MANIFESTATIONS_CATEGORIES_SECTION_HINT}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {slots.map((value, i) => (
          <CategoryField
            key={i}
            index={i}
            value={value}
            max={limit.max}
            warn={limit.warn}
            onChange={(v) => onCategoryChange(i, v)}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryField({
  index,
  value,
  max,
  warn,
  onChange,
}: {
  index: number;
  value: string;
  max: number;
  warn: number;
  onChange: (v: string) => void;
}) {
  const inputId = useId();
  const label = `${NR_MANIFESTATIONS_CATEGORIE_LABEL_PREFIX}${index + 1}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-xs font-medium text-deep">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        maxLength={max}
        placeholder={NR_MANIFESTATIONS_CATEGORIE_PLACEHOLDER}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${NR_MANIFESTATIONS_CATEGORIE_ARIA_PREFIX}${index + 1}`}
        className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted"
      />
      <div className="flex justify-end">
        <LimitCounterPill
          current={value.length}
          max={max}
          warningAfter={warn}
          unit="characters"
          showDangerAtMax={false}
        />
      </div>
    </div>
  );
}
