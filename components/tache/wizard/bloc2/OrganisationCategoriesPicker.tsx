"use client";

import { useId, useMemo } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { useManifestationsPayloadBootstrap } from "@/components/tache/non-redaction/manifestations/useManifestationsPayloadBootstrap";
import { ListboxField } from "@/components/ui/ListboxField";
import { RequiredMark } from "@/components/ui/RequiredMark";
import {
  initialManifestationsPayload,
  isManifestationsComportementId,
  normalizeManifestationsPayload,
  type OrganisationCategories,
} from "@/lib/tache/non-redaction/manifestations-payload";
import { nonRedactionManifestationsPayload } from "@/lib/tache/wizard-state-nr";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import {
  BLOC2_ORGANISATION_CATEGORIES_HELP,
  BLOC2_ORGANISATION_CATEGORIES_LABEL,
  BLOC2_ORGANISATION_CATEGORIES_OPTION_2,
  BLOC2_ORGANISATION_CATEGORIES_OPTION_4,
} from "@/lib/ui/ui-copy";

const ORGANISATION_OPTIONS = [
  { value: "2-categories", label: BLOC2_ORGANISATION_CATEGORIES_OPTION_2 },
  { value: "4-categories", label: BLOC2_ORGANISATION_CATEGORIES_OPTION_4 },
];

/**
 * Sélecteur Bloc 2 — visible uniquement pour le comportement 5.2 (OI5).
 * Bascule entre `2-categories` (2 catégories × 2 docs) et `4-categories`
 * (4 catégories × 1 doc). Le reducer gère la migration des catégories saisies
 * (préservation des 2 premières) et le reset des associations.
 */
export function OrganisationCategoriesPicker() {
  const { state, dispatch } = useTacheForm();
  const id = useId();
  const helpId = useId();

  // Bootstrap pour s'assurer que le payload `manifestations` existe avant
  // qu'on dispatch un patch dessus (filet de sécurité au cas où l'enseignant
  // aurait sélectionné 5.2 puis quitté/repris le wizard).
  useManifestationsPayloadBootstrap();

  const current = useMemo<OrganisationCategories>(() => {
    const cid = isManifestationsComportementId(state.bloc2.comportementId)
      ? state.bloc2.comportementId
      : "5.1";
    const p =
      normalizeManifestationsPayload(nonRedactionManifestationsPayload(state)) ??
      initialManifestationsPayload(cid);
    return p.organisationCategories;
  }, [state]);

  const handleChange = (value: string) => {
    if (value !== "2-categories" && value !== "4-categories") return;
    if (value === current) return;
    dispatch({
      type: "NON_REDACTION_PATCH_MANIFESTATIONS",
      patch: { organisationCategories: value as OrganisationCategories },
    });
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="icon-text text-sm font-semibold text-deep">
        <span
          className="material-symbols-outlined text-accent"
          aria-hidden="true"
          title={materialIconTooltip(ICONES_METIER.comportement) ?? undefined}
        >
          dataset
        </span>
        <span>
          {BLOC2_ORGANISATION_CATEGORIES_LABEL} <RequiredMark />
        </span>
      </label>
      <p id={helpId} className="text-sm leading-relaxed text-muted">
        {BLOC2_ORGANISATION_CATEGORIES_HELP}
      </p>
      <ListboxField
        id={id}
        value={current}
        onChange={handleChange}
        className="w-full max-w-md"
        options={ORGANISATION_OPTIONS}
        aria-describedby={helpId}
      />
    </div>
  );
}

/** Libellé court de l'organisation courante pour l'affichage verrouillé. */
export function organisationLabelFromValue(value: OrganisationCategories): string {
  return value === "4-categories"
    ? BLOC2_ORGANISATION_CATEGORIES_OPTION_4
    : BLOC2_ORGANISATION_CATEGORIES_OPTION_2;
}
