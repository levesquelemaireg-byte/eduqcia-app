/**
 * Mapper officiel wizard → DonneesTache (print-engine v2.1 §4.5).
 *
 * Fonction pure. Remplace `formStateToTache()` (dépréciée) pour la chaîne d'impression.
 * Les selectors de `lib/fiche/selectors/` restent pour le sommaire wizard.
 *
 * D0 partiel : coexiste avec l'ancien code — aucun consommateur n'est modifié.
 */

import { DISCIPLINE_LABEL, NIVEAUX } from "@/components/tache/wizard/bloc2/constants";
import { getSlotData } from "@/lib/tache/document-helpers";
import type { NiveauCode, DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import {
  getRedactionSliceForPreview,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";
import { cdSelectionToFicheSlice } from "@/lib/tache/cd-helpers";
import { connaissancesToFicheSlice } from "@/lib/tache/connaissances-selection";
import { sortAuteursByFamilyName, splitDisplayName } from "@/lib/tache/auteur-display-sort";
import type { OiEntryJson } from "@/lib/types/oi";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveNonRedactionVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tache/non-redaction/wizard-variant";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tache/wizard-state-nr";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
  normalizeAvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsCorrigeHtml,
  buildLigneDuTempsGuidageHtml,
  normalizeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueCorrigeHtml,
  buildOrdreChronologiqueGuidageHtml,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";

import type { RendererDocument, DocumentElement } from "@/lib/types/document-renderer";

import type { DonneesTache, EspaceProduction, Guidage, OutilEvaluation, Critere } from "./donnees";

/* -------------------------------------------------------------------------- */
/*  Types d'entrée                                                            */
/* -------------------------------------------------------------------------- */

/** Entrée minimale de `grilles-evaluation.json` nécessaire à la résolution. */
export type GrilleEvaluationEntree = {
  id: string;
  oi: string;
  comportement_enonce: string;
  bareme: {
    echelle: { points: number; label: string; description: string }[];
  };
};

/** Métadonnées affichées dans le pied de fiche (auteur, date). */
export type MetaApercu = {
  authorFullName: string;
  draftStartedAtIso: string;
};

/* -------------------------------------------------------------------------- */
/*  Helpers internes                                                          */
/* -------------------------------------------------------------------------- */

/** Supprime les ancres HTML `<!--eduqcia:...-->` des consignes NR. */
function supprimerAncres(html: string): string {
  return html.replace(/<!--eduqcia:[^>]+-->/g, "");
}

/** Résout l'outil d'évaluation depuis les grilles JSON. */
export function resoudreOutilEvaluation(
  outilId: string | null,
  grilles: GrilleEvaluationEntree[],
): OutilEvaluation {
  if (!outilId) {
    return { oi: "redactionnel", criteres: [] };
  }

  const grille = grilles.find((g) => g.id === outilId);
  if (!grille) {
    return { oi: "redactionnel", criteres: [] };
  }

  const critere: Critere = {
    libelle: grille.comportement_enonce,
    descripteurs: grille.bareme.echelle.map((e) => ({
      niveau: e.label,
      description: e.description,
      points: e.points,
    })),
  };

  const oi = grille.oi as OutilEvaluation["oi"];
  return { oi, criteres: [critere] };
}

/** Déduit l'espace de production depuis l'état du wizard. */
function deduireEspaceProduction(state: TacheFormState): EspaceProduction {
  if (isActiveOrdreChronologiqueVariant(state)) {
    return { type: "cases", options: ["A", "B", "C", "D"] };
  }
  if (isActiveLigneDuTempsVariant(state) || isActiveAvantApresVariant(state)) {
    return { type: "libre" };
  }
  return { type: "lignes", nbLignes: state.bloc2.nbLignes ?? 5 };
}

/** Construit le guidage structuré. */
function construireGuidage(state: TacheFormState): Guidage {
  if (isActiveNonRedactionVariant(state)) {
    const ordreNorm = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
    if (isActiveOrdreChronologiqueVariant(state) && ordreNorm) {
      const html = buildOrdreChronologiqueGuidageHtml();
      return html ? { content: html } : null;
    }
    const ligneNorm = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
    if (isActiveLigneDuTempsVariant(state) && ligneNorm) {
      const html = buildLigneDuTempsGuidageHtml();
      return html ? { content: html } : null;
    }
    const avantNorm = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
    if (isActiveAvantApresVariant(state) && avantNorm) {
      const html = buildAvantApresGuidageHtml();
      return html ? { content: html } : null;
    }
    return null;
  }

  const guidageText = state.bloc3.guidage.trim();
  return guidageText ? { content: guidageText } : null;
}

/** Construit la consigne (HTML propre, sans ancre). */
function construireConsigne(state: TacheFormState): string {
  const ordreNorm = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
  if (isActiveOrdreChronologiqueVariant(state) && ordreNorm) {
    return supprimerAncres(buildOrdreChronologiqueConsigneHtml(ordreNorm));
  }
  const ligneNorm = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
  if (isActiveLigneDuTempsVariant(state) && ligneNorm) {
    return supprimerAncres(buildLigneDuTempsConsigneHtml(ligneNorm));
  }
  const avantNorm = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
  if (isActiveAvantApresVariant(state) && avantNorm) {
    return supprimerAncres(buildAvantApresConsigneHtml(avantNorm));
  }
  return getRedactionSliceForPreview(state).consigne;
}

/** Construit le corrigé. */
function construireCorrige(state: TacheFormState): string {
  const ordreNorm = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
  if (isActiveOrdreChronologiqueVariant(state) && ordreNorm) {
    return buildOrdreChronologiqueCorrigeHtml(ordreNorm);
  }
  const ligneNorm = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
  if (isActiveLigneDuTempsVariant(state) && ligneNorm) {
    return buildLigneDuTempsCorrigeHtml(ligneNorm);
  }
  const avantNorm = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
  if (isActiveAvantApresVariant(state) && avantNorm) {
    return buildAvantApresCorrigeHtml(avantNorm);
  }
  return getRedactionSliceForPreview(state).corrige;
}

/** Mappe les slots document vers `RendererDocument[]`. */
function construireDocuments(state: TacheFormState): RendererDocument[] {
  return state.bloc2.documentSlots.map(({ slotId }) => {
    const slot = getSlotData(state.bloc4.documents, slotId);

    // Chemin canonique : le slot transporte deja un RendererDocument complet.
    if (slot.rendererDocument) {
      return slot.rendererDocument;
    }

    // Fallback defensif : reconstruction legacy depuis les champs du slot.
    if (slot.mode !== "idle") {
      console.warn(`[construireDocuments] Slot ${slotId} sans rendererDocument - fallback`);
    }

    const baseElement = {
      id: slotId,
      source: slot.source_citation || "",
      sourceType: (slot.source_type ?? "primaire") as "primaire" | "secondaire",
    };

    let element: DocumentElement;
    if (slot.type === "iconographique") {
      element = {
        ...baseElement,
        type: "iconographique" as const,
        imageUrl: slot.imageUrl ?? "",
        legende: slot.image_legende || undefined,
        legendePosition: slot.image_legende_position ?? undefined,
        categorieIconographique: slot.type_iconographique ?? "autre",
        ...(slot.imagePixelWidth != null && slot.imagePixelHeight != null
          ? { imagePixelWidth: slot.imagePixelWidth, imagePixelHeight: slot.imagePixelHeight }
          : {}),
      };
    } else {
      element = {
        ...baseElement,
        type: "textuel" as const,
        contenu: slot.contenu,
        categorieTextuelle: slot.categorie_textuelle ?? "autre",
      };
    }

    return {
      id: slotId,
      titre: slot.titre,
      structure: "simple" as const,
      elements: [element],
      ...(slot.repere_temporel ? { repereTemporelDocument: slot.repere_temporel } : {}),
    };
  });
}

/** Construit la liste des auteurs triés par nom de famille. */
function construireAuteurs(
  state: TacheFormState,
  meta?: MetaApercu | null,
): { id: string; first_name: string; last_name: string }[] {
  const fallbackAuthor = meta?.authorFullName?.trim() || "—";
  const principalSplit = splitDisplayName(fallbackAuthor);
  const auteurPrincipal = { id: "draft-local", ...principalSplit };

  const auteursRaw =
    state.bloc1.modeConception === "equipe"
      ? [
          auteurPrincipal,
          ...state.bloc1.collaborateurs.map((c) => ({
            id: c.id,
            ...splitDisplayName(c.displayName),
          })),
        ]
      : [auteurPrincipal];

  return sortAuteursByFamilyName(auteursRaw);
}

/* -------------------------------------------------------------------------- */
/*  Mapper principal                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Transforme l'état du wizard en `DonneesTache` structuré.
 *
 * Fonction pure — toutes les données de référence sont passées en paramètre.
 * Le résultat est prêt pour la chaîne d'impression (consigne propre, guidage
 * structuré, outilEvaluation résolu, espaceProduction déduit).
 */
export function etatWizardVersTache(
  etat: TacheFormState,
  oiList: OiEntryJson[],
  grilles: GrilleEvaluationEntree[],
  meta?: MetaApercu | null,
): DonneesTache {
  const oiEntry = oiList.find((o) => o.id === etat.bloc2.oiId);
  const comportement = oiEntry?.comportements_attendus.find(
    (c) => c.id === etat.bloc2.comportementId,
  );

  const redaction = getRedactionSliceForPreview(etat);
  const aspectsSociete = (Object.entries(redaction.aspects) as [AspectSocieteKey, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => ASPECT_LABEL[k]);

  const niveauLabel =
    NIVEAUX.find((n) => n.value === (etat.bloc2.niveau as NiveauCode))?.label ?? "";
  const disc = etat.bloc2.discipline;
  const disciplineLabel =
    disc && disc in DISCIPLINE_LABEL ? DISCIPLINE_LABEL[disc as DisciplineCode] : "";

  return {
    id: "draft",
    auteur_id: "draft-local",
    auteurs: construireAuteurs(etat, meta),

    titre: comportement?.enonce ?? "",
    consigne: construireConsigne(etat),
    guidage: construireGuidage(etat),
    documents: construireDocuments(etat),
    espaceProduction: deduireEspaceProduction(etat),
    outilEvaluation: resoudreOutilEvaluation(etat.bloc2.outilEvaluation, grilles),
    corrige: construireCorrige(etat),

    aspects_societe: aspectsSociete,
    nb_lignes: etat.bloc2.nbLignes ?? 5,
    niveau: { label: niveauLabel },
    discipline: { label: disciplineLabel },
    oi: {
      id: etat.bloc2.oiId,
      titre: oiEntry?.titre ?? "",
      icone: oiEntry?.icone ?? "cognition",
    },
    comportement: {
      id: etat.bloc2.comportementId,
      enonce: comportement?.enonce ?? "",
    },
    cd: cdSelectionToFicheSlice(etat.bloc6.cd.selection),
    connaissances: connaissancesToFicheSlice(etat.bloc7.connaissances),

    version: 1,
    version_updated_at: null,
    is_published: false,
    created_at: meta?.draftStartedAtIso ?? "",
    updated_at: meta?.draftStartedAtIso ?? "",
  };
}
