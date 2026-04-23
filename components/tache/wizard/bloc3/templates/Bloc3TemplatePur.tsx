"use client";

/**
 * Bloc 3 — template pur (OI3 · 3.5, OI6 · 6.3).
 * Formule ministérielle figée — pas de TipTap consigne.
 *
 * Variante `triple` (3.5) : radio structure + type perspectives + contexte obligatoire.
 * Variante `oi6` (6.3) : champ enjeu uniquement.
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § OI3 · 3.5, § OI6 · 6.3
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BLOC3_MODAL_GUIDAGE_BODY,
  BLOC3_MODAL_GUIDAGE_TITLE,
} from "@/components/tache/wizard/bloc3/modalCopy";
import { SectionConsigne } from "@/components/tache/wizard/bloc3/SectionConsigne";
import { SectionGuidage } from "@/components/tache/wizard/bloc3/SectionGuidage";
import {
  buildAmorceDocumentaire,
  buildAmorceDocumentaireHtml,
  docRefSpan,
} from "@/lib/tache/consigne-helpers";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import {
  perspectiveTypePartitif,
  perspectiveTypeSingulier,
  perspectiveTypeAutres,
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
  PERSP_BLOC3_CONTEXTE_PLACEHOLDER,
  PERSP_BLOC3_CONTEXTE_HINT,
  BLOC3_MODAL_CONSIGNE_35_TITLE,
  BLOC3_MODAL_CONSIGNE_35_BODY,
  BLOC3_OI6_ENJEU_LABEL,
  BLOC3_OI6_ENJEU_PLACEHOLDER,
  BLOC3_OI6_ENJEU_HINT,
  BLOC3_MODAL_CONSIGNE_63_TITLE,
  BLOC3_MODAL_CONSIGNE_63_BODY,
  BLOC4_MOMENTS_STRUCTURE_GROUPE,
  BLOC4_MOMENTS_STRUCTURE_SEPARE,
  BLOC3_OI7_ENJEU_GLOBAL_LABEL,
  BLOC3_OI7_ENJEU_GLOBAL_PLACEHOLDER,
  BLOC3_OI7_ENJEU_GLOBAL_HINT,
  BLOC3_OI7_ELEMENT_LABEL,
  BLOC3_OI7_ELEMENT_PLACEHOLDER_1,
  BLOC3_OI7_ELEMENT_PLACEHOLDER_2,
  BLOC3_OI7_ELEMENT_PLACEHOLDER_3,
  BLOC3_MODAL_CONSIGNE_71_TITLE,
  BLOC3_MODAL_CONSIGNE_71_BODY,
  BLOC3_GABARIT_LABEL,
  BLOC3_CONSIGNE_LIBRE_LABEL,
  BLOC3_REDIGER_LIBREMENT,
  BLOC3_REVENIR_GABARIT,
} from "@/lib/ui/ui-copy";

export default function Bloc3TemplatePur() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;

  const config = getWizardBlocConfig(b.comportementId);
  const variante = config?.bloc3.type === "pur" ? config.bloc3.variante : "triple";

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC3_GATE_BLUEPRINT}</p>;
  }

  switch (variante) {
    case "triple":
      return <VarianteTriple state={state} dispatch={dispatch} />;
    case "oi6":
      return <VarianteOi6 state={state} dispatch={dispatch} />;
    case "oi7":
      return <VarianteOi7 state={state} dispatch={dispatch} />;
  }
}

// ---------------------------------------------------------------------------
// Variante triple (OI3 · 3.5)
// ---------------------------------------------------------------------------

function VarianteTriple({
  state,
  dispatch,
}: {
  state: import("@/lib/tache/tache-form-state-types").TacheFormState;
  dispatch: import("react").Dispatch<import("@/lib/tache/tache-form-state-types").TacheFormAction>;
}) {
  const modeStructure = state.bloc3.perspectivesMode ?? "groupe";
  const typePerspectives = state.bloc3.perspectivesType;
  const contexte = state.bloc3.perspectivesContexte;

  const [modalConsigne, setModalConsigne] = useState(false);
  const [modalGuidage, setModalGuidage] = useState(false);

  const setGuidage = useCallback(
    (html: string) => dispatch({ type: "SET_GUIDAGE", value: html }),
    [dispatch],
  );

  const preview = useMemo(() => {
    const partitif = perspectiveTypePartitif(typePerspectives);
    const singulier = perspectiveTypeSingulier(typePerspectives);
    const autres = perspectiveTypeAutres(typePerspectives);
    const ctx = contexte.trim() ? ` ${contexte.trim()}` : "";
    return (
      `Le document A présente trois points de vue ${partitif}${ctx}. ` +
      `Nommez l'${singulier} qui présente un point de vue différent. ` +
      `Puis, comparez ce point de vue à celui des ${autres}.`
    );
  }, [typePerspectives, contexte]);

  useEffect(() => {
    const partitif = perspectiveTypePartitif(typePerspectives);
    const singulier = perspectiveTypeSingulier(typePerspectives);
    const autres = perspectiveTypeAutres(typePerspectives);
    const ctx = contexte.trim() ? ` ${contexte.trim()}` : "";
    const html =
      `<p>Le document ${docRefSpan(1)} présente trois points de vue ${partitif}${ctx}. ` +
      `Nommez l'${singulier} qui présente un point de vue différent. ` +
      `Puis, comparez ce point de vue à celui des ${autres}.</p>`;
    dispatch({ type: "SET_CONSIGNE", value: html });
  }, [dispatch, typePerspectives, contexte]);

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <ConsigneHeader onInfoClick={() => setModalConsigne(true)} />

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
              count: 3,
            })
          }
        />

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

        <div className="space-y-1">
          <label htmlFor="persp-contexte" className="text-sm font-medium text-deep">
            {PERSP_BLOC3_CONTEXTE_LABEL} <RequiredMark />
          </label>
          <textarea
            id="persp-contexte"
            value={contexte}
            onChange={(e) => dispatch({ type: "SET_PERSPECTIVES_CONTEXTE", value: e.target.value })}
            placeholder={PERSP_BLOC3_CONTEXTE_PLACEHOLDER}
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-deep placeholder:text-muted focus:border-accent focus:outline-none"
            required
          />
          <p className="text-xs text-muted">{PERSP_BLOC3_CONTEXTE_HINT}</p>
        </div>

        <LockedConsignePreview text={preview} />
      </section>

      <SectionGuidage
        value={state.bloc3.guidage}
        onChange={setGuidage}
        onInfoClick={() => setModalGuidage(true)}
      />

      <SimpleModal
        open={modalConsigne}
        title={BLOC3_MODAL_CONSIGNE_35_TITLE}
        onClose={() => setModalConsigne(false)}
        titleStyle="info-help"
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-deep">
          {BLOC3_MODAL_CONSIGNE_35_BODY}
        </p>
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

// ---------------------------------------------------------------------------
// Variante oi6 (OI6 · 6.3)
// ---------------------------------------------------------------------------

function VarianteOi6({
  state,
  dispatch,
}: {
  state: import("@/lib/tache/tache-form-state-types").TacheFormState;
  dispatch: import("react").Dispatch<import("@/lib/tache/tache-form-state-types").TacheFormAction>;
}) {
  const modeStructure = state.bloc3.perspectivesMode ?? "groupe";
  const enjeu = state.bloc3.oi6Enjeu;

  const [modalConsigne, setModalConsigne] = useState(false);
  const [modalGuidage, setModalGuidage] = useState(false);

  const setGuidage = useCallback(
    (html: string) => dispatch({ type: "SET_GUIDAGE", value: html }),
    [dispatch],
  );

  const preview = useMemo(() => {
    const e = enjeu.trim() ? enjeu.trim() : "[enjeu]";
    if (modeStructure === "separe") {
      return (
        `À partir des documents A et B, indiquez s'il y a changement ou continuité quant à ${e}. ` +
        `Justifiez votre réponse. Indiquez un repère de temps.`
      );
    }
    return (
      `À partir du document A, indiquez s'il y a changement ou continuité quant à ${e}. ` +
      `Justifiez votre réponse. Indiquez un repère de temps.`
    );
  }, [enjeu, modeStructure]);

  useEffect(() => {
    const e = enjeu.trim() ? enjeu.trim() : "[enjeu]";
    const html =
      modeStructure === "separe"
        ? `<p>À partir des documents ${docRefSpan(1)} et ${docRefSpan(2)}, indiquez s'il y a changement ou continuité quant à ${e}. ` +
          `Justifiez votre réponse. Indiquez un repère de temps.</p>`
        : `<p>À partir du document ${docRefSpan(1)}, indiquez s'il y a changement ou continuité quant à ${e}. ` +
          `Justifiez votre réponse. Indiquez un repère de temps.</p>`;
    dispatch({ type: "SET_CONSIGNE", value: html });
  }, [dispatch, enjeu, modeStructure]);

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <ConsigneHeader onInfoClick={() => setModalConsigne(true)} />

        {/* Structure documentaire */}
        <RadioCardGroup
          name="modeStructureOi6"
          label={PERSP_BLOC3_STRUCTURE_LABEL}
          required
          options={[
            { value: "groupe", label: BLOC4_MOMENTS_STRUCTURE_GROUPE },
            { value: "separe", label: BLOC4_MOMENTS_STRUCTURE_SEPARE },
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

        <div className="space-y-1">
          <label htmlFor="oi6-enjeu" className="text-sm font-medium text-deep">
            {BLOC3_OI6_ENJEU_LABEL} <RequiredMark />
          </label>
          <textarea
            id="oi6-enjeu"
            value={enjeu}
            onChange={(e) => dispatch({ type: "SET_OI6_ENJEU", value: e.target.value })}
            placeholder={BLOC3_OI6_ENJEU_PLACEHOLDER}
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-deep placeholder:text-muted focus:border-accent focus:outline-none"
            required
          />
          <p className="text-xs text-muted">{BLOC3_OI6_ENJEU_HINT}</p>
        </div>

        <LockedConsignePreview text={preview} />
      </section>

      <SectionGuidage
        value={state.bloc3.guidage}
        onChange={setGuidage}
        onInfoClick={() => setModalGuidage(true)}
      />

      <SimpleModal
        open={modalConsigne}
        title={BLOC3_MODAL_CONSIGNE_63_TITLE}
        onClose={() => setModalConsigne(false)}
        titleStyle="info-help"
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-deep">
          {BLOC3_MODAL_CONSIGNE_63_BODY}
        </p>
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

// ---------------------------------------------------------------------------
// Variante oi7 (OI7 · 7.1) — gabarit / consigne libre
// ---------------------------------------------------------------------------

function VarianteOi7({
  state,
  dispatch,
}: {
  state: import("@/lib/tache/tache-form-state-types").TacheFormState;
  dispatch: import("react").Dispatch<import("@/lib/tache/tache-form-state-types").TacheFormAction>;
}) {
  const b = state.bloc2;
  const mode = state.bloc3.consigneMode;
  const enjeuGlobal = state.bloc3.oi7EnjeuGlobal;
  const el1 = state.bloc3.oi7Element1;
  const el2 = state.bloc3.oi7Element2;
  const el3 = state.bloc3.oi7Element3;
  const isGabarit = mode === "gabarit";

  const [modalConsigne, setModalConsigne] = useState(false);
  const [modalGuidage, setModalGuidage] = useState(false);

  const setGuidage = useCallback(
    (html: string) => dispatch({ type: "SET_GUIDAGE", value: html }),
    [dispatch],
  );
  const setConsigne = useCallback(
    (html: string) => dispatch({ type: "SET_CONSIGNE", value: html }),
    [dispatch],
  );

  // Sync consigne HTML en mode gabarit
  useEffect(() => {
    if (!isGabarit) return;
    const eg = enjeuGlobal.trim() || "[réalité historique]";
    const e1 = el1.trim() || "[Élément 1]";
    const e2 = el2.trim() || "[Élément 2]";
    const e3 = el3.trim() || "[Élément 3]";
    const html =
      `<p>${buildAmorceDocumentaireHtml(3)}. Expliquez comment ${eg}.</p>` +
      `<p>Pour répondre à la question, précisez les éléments ci-dessous et liez-les entre eux.</p>` +
      `<ul><li>${e1}</li><li>${e2}</li><li>${e3}</li></ul>`;
    dispatch({ type: "SET_CONSIGNE", value: html });
  }, [dispatch, isGabarit, enjeuGlobal, el1, el2, el3]);

  const amorce = buildAmorceDocumentaire(3);
  const amorceHtml = buildAmorceDocumentaireHtml(3);

  const handleToggleMode = useCallback(() => {
    if (isGabarit) {
      // Pré-remplir le TipTap avec le HTML structuré du gabarit (docRef spans)
      const eg = enjeuGlobal.trim() || "[réalité historique]";
      const e1v = el1.trim() || "[Élément 1]";
      const e2v = el2.trim() || "[Élément 2]";
      const e3v = el3.trim() || "[Élément 3]";
      const html =
        `<p>${amorceHtml}. Expliquez comment ${eg}.</p>` +
        `<p>Pour répondre à la question, précisez les éléments ci-dessous et liez-les entre eux.</p>` +
        `<ul><li>${e1v}</li><li>${e2v}</li><li>${e3v}</li></ul>`;
      dispatch({ type: "SET_CONSIGNE", value: html });
    }
    dispatch({
      type: "SET_CONSIGNE_MODE",
      value: isGabarit ? "personnalisee" : "gabarit",
    });
  }, [dispatch, isGabarit, amorceHtml, enjeuGlobal, el1, el2, el3]);

  const disabledClass = !isGabarit ? "opacity-50 pointer-events-none" : "";

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        {/* Header consigne */}
        <ConsigneHeader onInfoClick={() => setModalConsigne(true)} />

        {/* Champs composantes */}
        <div className={disabledClass}>
          <div className="space-y-3">
            {/* Réalité historique */}
            <div className="space-y-1">
              <label htmlFor="oi7-enjeu" className="text-sm font-medium text-deep">
                {BLOC3_OI7_ENJEU_GLOBAL_LABEL} <RequiredMark />
              </label>
              <input
                id="oi7-enjeu"
                type="text"
                value={enjeuGlobal}
                onChange={(e) => dispatch({ type: "SET_OI7_ENJEU_GLOBAL", value: e.target.value })}
                placeholder={BLOC3_OI7_ENJEU_GLOBAL_PLACEHOLDER}
                autoComplete="off"
                required={isGabarit}
                disabled={!isGabarit}
                className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted disabled:cursor-not-allowed disabled:bg-panel-alt"
              />
              <p className="text-xs text-muted">{BLOC3_OI7_ENJEU_GLOBAL_HINT}</p>
            </div>

            {/* Éléments 1, 2, 3 */}
            {[
              {
                key: "SET_OI7_ELEMENT_1" as const,
                value: el1,
                n: 1,
                ph: BLOC3_OI7_ELEMENT_PLACEHOLDER_1,
              },
              {
                key: "SET_OI7_ELEMENT_2" as const,
                value: el2,
                n: 2,
                ph: BLOC3_OI7_ELEMENT_PLACEHOLDER_2,
              },
              {
                key: "SET_OI7_ELEMENT_3" as const,
                value: el3,
                n: 3,
                ph: BLOC3_OI7_ELEMENT_PLACEHOLDER_3,
              },
            ].map(({ key, value, n, ph }) => (
              <div key={n} className="space-y-1">
                <label htmlFor={`oi7-el-${n}`} className="text-sm font-medium text-deep">
                  {BLOC3_OI7_ELEMENT_LABEL} {n} <RequiredMark />
                </label>
                <input
                  id={`oi7-el-${n}`}
                  type="text"
                  value={value}
                  onChange={(e) => dispatch({ type: key, value: e.target.value })}
                  placeholder={ph}
                  autoComplete="off"
                  required={isGabarit}
                  disabled={!isGabarit}
                  className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted disabled:cursor-not-allowed disabled:bg-panel-alt"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gabarit ou consigne libre */}
        <div className="rounded-md border border-border bg-panel">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <div className="inline-flex items-center gap-[0.35em] text-xs text-muted">
              <span
                className="material-symbols-outlined text-[1em] leading-none"
                aria-hidden="true"
              >
                {isGabarit ? "settings" : "edit"}
              </span>
              {isGabarit ? BLOC3_GABARIT_LABEL : BLOC3_CONSIGNE_LIBRE_LABEL}
            </div>
            <button
              type="button"
              onClick={handleToggleMode}
              className="inline-flex items-center gap-[0.35em] text-xs font-medium text-accent hover:underline"
            >
              <span
                className="material-symbols-outlined text-[1em] leading-none"
                aria-hidden="true"
              >
                {isGabarit ? "lock_open" : "lock"}
              </span>
              {isGabarit ? BLOC3_REDIGER_LIBREMENT : BLOC3_REVENIR_GABARIT}
            </button>
          </div>
          <div className="border-t border-border px-4 py-3">
            {isGabarit ? (
              <div className="text-sm leading-relaxed text-deep">
                <p>
                  <span className="text-muted">{amorce}</span> Expliquez comment{" "}
                  <span className="pill-field">{enjeuGlobal.trim() || "[réalité historique]"}</span>
                  .
                </p>
                <p className="mt-2">
                  Pour répondre à la question, précisez les éléments ci-dessous et liez-les entre
                  eux.
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
                  <li>
                    <span className="pill-field">{el1.trim() || "[Élément 1]"}</span>
                  </li>
                  <li>
                    <span className="pill-field">{el2.trim() || "[Élément 2]"}</span>
                  </li>
                  <li>
                    <span className="pill-field">{el3.trim() || "[Élément 3]"}</span>
                  </li>
                </ul>
              </div>
            ) : (
              <SectionConsigne
                blueprint={b}
                consigneHtml={state.bloc3.consigne}
                onConsigneChange={setConsigne}
                onInfoClick={() => setModalConsigne(true)}
              />
            )}
          </div>
        </div>
      </section>

      <SectionGuidage
        value={state.bloc3.guidage}
        onChange={setGuidage}
        onInfoClick={() => setModalGuidage(true)}
      />

      <SimpleModal
        open={modalConsigne}
        title={BLOC3_MODAL_CONSIGNE_71_TITLE}
        onClose={() => setModalConsigne(false)}
        titleStyle="info-help"
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-deep">
          {BLOC3_MODAL_CONSIGNE_71_BODY}
        </p>
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

// ---------------------------------------------------------------------------
// Composants partagés
// ---------------------------------------------------------------------------

function ConsigneHeader({ onInfoClick }: { onInfoClick: () => void }) {
  return (
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
        onClick={onInfoClick}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
        aria-label="Informations"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          info
        </span>
      </button>
    </div>
  );
}

function LockedConsignePreview({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-border bg-panel px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-muted text-[14px]" aria-hidden="true">
          lock
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Consigne ministérielle
        </p>
      </div>
      <p className="text-sm leading-relaxed text-deep">{text}</p>
    </div>
  );
}
