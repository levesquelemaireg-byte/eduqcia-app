"use client";

/**
 * Bloc 3 — template structuré (OI3 · 3.3, 3.4).
 * Radio type de perspectives + contexte + aperçu consigne temps réel.
 * Remplace le TipTap consigne — pas de saisie libre pour la consigne.
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § OI3 · 3.3 et 3.4
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BLOC3_MODAL_GUIDAGE_BODY,
  BLOC3_MODAL_GUIDAGE_TITLE,
} from "@/components/tache/wizard/bloc3/modalCopy";
import { SectionGuidage } from "@/components/tache/wizard/bloc3/SectionGuidage";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  perspectiveTypePartitif,
  perspectiveTypePluriel,
} from "@/lib/tache/oi-perspectives/perspectives-helpers";
import {
  BLOC3_GATE_BLUEPRINT,
  PERSP_BLOC3_STRUCTURE_LABEL,
  PERSP_BLOC3_STRUCTURE_GROUPE,
  PERSP_BLOC3_STRUCTURE_SEPARE,
  PERSP_BLOC3_TYPE_LABEL,
  PERSP_BLOC3_TYPE_ACTEURS,
  PERSP_BLOC3_TYPE_HISTORIENS,
  PERSP_BLOC3_CONTEXTE_LABEL,
  PERSP_BLOC3_CONTEXTE_PLACEHOLDER_COMPARE,
  PERSP_BLOC3_CONTEXTE_HINT,
  BLOC3_MODAL_CONSIGNE_33_TITLE,
  BLOC3_MODAL_CONSIGNE_33_BODY,
  BLOC3_MODAL_CONSIGNE_34_TITLE,
  BLOC3_MODAL_CONSIGNE_34_BODY,
} from "@/lib/ui/ui-copy";

export default function Bloc3TemplateStructure() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;

  const modeStructure = state.bloc3.perspectivesMode ?? "groupe";
  const typePerspectives = state.bloc3.perspectivesType;
  const contexte = state.bloc3.perspectivesContexte;

  const [modalConsigne, setModalConsigne] = useState(false);
  const [modalGuidage, setModalGuidage] = useState(false);

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const setGuidage = useCallback(
    (html: string) => dispatch({ type: "SET_GUIDAGE", value: html }),
    [dispatch],
  );

  const isDesaccord = b.comportementId === "3.3";
  const accordLabel = isDesaccord ? "en désaccord" : "d'accord";
  const consigneModalTitle = isDesaccord
    ? BLOC3_MODAL_CONSIGNE_33_TITLE
    : BLOC3_MODAL_CONSIGNE_34_TITLE;
  const consigneModalBody = isDesaccord
    ? BLOC3_MODAL_CONSIGNE_33_BODY
    : BLOC3_MODAL_CONSIGNE_34_BODY;

  const preview = useMemo(() => {
    const partitif = perspectiveTypePartitif(typePerspectives);
    const pluriel = perspectiveTypePluriel(typePerspectives);
    const ctx = contexte.trim() ? ` ${contexte.trim()}` : "";
    return (
      `Le document {{doc_A}} présente deux points de vue ${partitif}${ctx}. ` +
      `Sur quel point précis ces ${pluriel} sont-ils ${accordLabel}\u00a0?`
    );
  }, [typePerspectives, contexte, accordLabel]);

  // Sync consigne HTML avec l'aperçu
  useEffect(() => {
    dispatch({ type: "SET_CONSIGNE", value: `<p>${preview}</p>` });
  }, [dispatch, preview]);

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC3_GATE_BLUEPRINT}</p>;
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-deep">
            <span
              className="material-symbols-outlined text-accent text-[1em]"
              aria-hidden="true"
              title={materialIconTooltip(BLOC3_SECTION_ICON.consigne)}
            >
              {BLOC3_SECTION_ICON.consigne}
            </span>
            Consigne <RequiredMark />
          </label>
          <button
            type="button"
            onClick={() => setModalConsigne(true)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
            aria-label="Informations"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              info
            </span>
          </button>
        </div>

        {/* Structure du document */}
        <RadioCardGroup
          name="modeStructure"
          label={PERSP_BLOC3_STRUCTURE_LABEL}
          required
          options={[
            { value: "groupe", label: PERSP_BLOC3_STRUCTURE_GROUPE },
            { value: "separe", label: PERSP_BLOC3_STRUCTURE_SEPARE },
          ]}
          value={modeStructure}
          onChange={(v) =>
            dispatch({
              type: "SET_PERSPECTIVES_MODE_WITH_MIGRATION",
              value: v as "groupe" | "separe",
              count: 2,
            })
          }
        />

        {/* Type de perspectives */}
        <RadioCardGroup
          name="typePerspectives"
          label={PERSP_BLOC3_TYPE_LABEL}
          required
          options={[
            { value: "acteurs", label: PERSP_BLOC3_TYPE_ACTEURS, description: "Source primaire" },
            {
              value: "historiens",
              label: PERSP_BLOC3_TYPE_HISTORIENS,
              description: "Source secondaire",
            },
          ]}
          value={typePerspectives}
          onChange={(v) =>
            dispatch({ type: "SET_PERSPECTIVES_TYPE", value: v as "acteurs" | "historiens" })
          }
        />

        {/* Contexte */}
        <div className="space-y-1">
          <label htmlFor="persp-contexte" className="text-sm font-medium text-deep">
            {PERSP_BLOC3_CONTEXTE_LABEL} <RequiredMark />
          </label>
          <textarea
            id="persp-contexte"
            value={contexte}
            onChange={(e) => dispatch({ type: "SET_PERSPECTIVES_CONTEXTE", value: e.target.value })}
            placeholder={PERSP_BLOC3_CONTEXTE_PLACEHOLDER_COMPARE}
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-deep placeholder:text-muted focus:border-accent focus:outline-none"
            required
          />
          <p className="text-xs text-muted">{PERSP_BLOC3_CONTEXTE_HINT}</p>
        </div>

        {/* Aperçu consigne */}
        <div className="rounded-md border border-border bg-panel px-4 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Aperçu de la consigne
          </p>
          <p className="text-sm leading-relaxed text-deep">{preview}</p>
        </div>
      </section>

      <SectionGuidage
        value={state.bloc3.guidage}
        onChange={setGuidage}
        onInfoClick={() => setModalGuidage(true)}
      />

      <SimpleModal
        open={modalConsigne}
        title={consigneModalTitle}
        onClose={() => setModalConsigne(false)}
        titleStyle="info-help"
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-deep">{consigneModalBody}</p>
      </SimpleModal>
      <SimpleModal
        open={modalGuidage}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={() => setModalGuidage(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC3_MODAL_GUIDAGE_BODY}</p>
      </SimpleModal>
    </div>
  );
}
