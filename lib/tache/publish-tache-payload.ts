/**
 * Payload `publish_tae_transaction` — lecture `TacheFormState` via `bloc1`…`bloc7` uniquement
 * (contrat RPC inchangé : `consigne`, `guidage`, `corrige`, `aspects_societe`, documents, etc.).
 */
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import { buildCollaborateursUserIdsForPayload } from "@/lib/tache/collaborateur-user-ids";
import { getSlotData, isPublicHttpUrl } from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import {
  migrateMomentsToSlots,
  migratePerspectivesToSlots,
} from "@/lib/tache/oi-perspectives/perspectives-helpers";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import type {
  PublishTacheFailureCode,
  PublishTacheRpcPayload,
} from "@/lib/tache/publish-tache-types";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
  isAvantApresPayloadConsistentWithDocuments,
  isAvantApresStep3ThemeComplete,
  isAvantApresStep5OptionsComplete,
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
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tache/non-redaction/wizard-variant";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tache/wizard-state-nr";

function aspectsToPgArray(state: TacheFormState): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(state.bloc7.aspects) as [AspectSocieteKey, boolean][]) {
    if (v) out.push(ASPECT_LABEL[k]);
  }
  return out;
}

export function buildPublishPayload(
  auteurId: string,
  state: TacheFormState,
  ctx: {
    niveauId: number;
    disciplineId: number;
    cdId: number | null;
    connIds: number[];
  },
): PublishTacheRpcPayload | { error: PublishTacheFailureCode } {
  const aspectsPg = aspectsToPgArray(state);
  const documentsNew: PublishTacheRpcPayload["documents_new"] = [];
  const slots: PublishTacheRpcPayload["slots"] = [];
  let createIdx = 0;

  const ordreNorm = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
  const ordrePayload = isActiveOrdreChronologiqueVariant(state) && ordreNorm ? ordreNorm : null;
  const ligneNorm = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
  const lignePayload = isActiveLigneDuTempsVariant(state) && ligneNorm ? ligneNorm : null;
  const avantNorm = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
  const avantReady =
    isActiveAvantApresVariant(state) &&
    avantNorm !== null &&
    isAvantApresStep3ThemeComplete(avantNorm) &&
    isAvantApresStep5OptionsComplete(avantNorm) &&
    isAvantApresPayloadConsistentWithDocuments(
      avantNorm,
      state.bloc2.documentSlots.map((s) => s.slotId),
      state.bloc4.documents,
    );

  const consigneTache = avantReady
    ? buildAvantApresConsigneHtml(avantNorm)
    : ordrePayload
      ? buildOrdreChronologiqueConsigneHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsConsigneHtml(lignePayload)
        : state.bloc3.consigne;
  const guidageTache = avantReady
    ? buildAvantApresGuidageHtml()
    : ordrePayload
      ? buildOrdreChronologiqueGuidageHtml()
      : lignePayload
        ? buildLigneDuTempsGuidageHtml()
        : state.bloc3.guidage;
  const corrigeTache = avantReady
    ? buildAvantApresCorrigeHtml(avantNorm)
    : ordrePayload
      ? buildOrdreChronologiqueCorrigeHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsCorrigeHtml(lignePayload)
        : state.bloc5.corrige;

  // Mode groupé (perspectives / moments) : convertir en slots documents à la volée.
  // En mode séparé les données vivent déjà dans state.bloc4.documents.
  const blocConfig = getWizardBlocConfig(state.bloc2.comportementId);
  const isGroupePersp =
    blocConfig?.bloc4.type === "perspectives" && state.bloc3.perspectivesMode === "groupe";
  const isGroupeMoments =
    blocConfig?.bloc4.type === "moments" && state.bloc3.perspectivesMode === "groupe";

  const resolvedDocuments: Partial<Record<DocumentSlotId, DocumentSlotData>> = isGroupePersp
    ? state.bloc4.perspectives
      ? migratePerspectivesToSlots(state.bloc4.perspectives)
      : {}
    : isGroupeMoments
      ? state.bloc4.moments
        ? migrateMomentsToSlots(state.bloc4.moments)
        : {}
      : state.bloc4.documents;

  for (const { slotId } of state.bloc2.documentSlots) {
    const slot = getSlotData(resolvedDocuments, slotId);
    const ordre = slots.length;

    if (slot.mode === "reuse") {
      if (!slot.source_document_id) return { error: "validation" };
      slots.push({
        slot: slotId,
        ordre,
        mode: "reuse",
        document_id: slot.source_document_id,
      });
      continue;
    }

    if (slot.mode === "idle") return { error: "validation" };

    if (slot.type === "iconographique") {
      if (!isPublicHttpUrl(slot.imageUrl)) return { error: "document_image" };
    }

    const st =
      slot.source_type === "primaire" || slot.source_type === "secondaire"
        ? slot.source_type
        : "secondaire";
    const legendTrim = slot.image_legende.trim();
    const contenuPublish: string | null = slot.type === "textuel" ? slot.contenu : null;
    const sourceCitationPublish = slot.source_citation.trim();
    const rt = slot.repere_temporel.trim();
    const annee =
      slot.annee_normalisee != null && Number.isFinite(slot.annee_normalisee)
        ? slot.annee_normalisee
        : null;

    const element: Record<string, unknown> = {
      type: slot.type,
      contenu: contenuPublish,
      image_url: slot.type === "iconographique" ? slot.imageUrl : null,
      source_citation: sourceCitationPublish,
      source_type: st,
    };
    if (slot.type === "iconographique" && legendTrim.length > 0 && slot.image_legende_position) {
      element.image_legende = legendTrim;
      element.image_legende_position = slot.image_legende_position;
    }
    if (slot.type === "iconographique" && slot.type_iconographique != null) {
      element.categorie_iconographique = slot.type_iconographique;
    }
    if (slot.type === "textuel" && slot.categorie_textuelle != null) {
      element.categorie_textuelle = slot.categorie_textuelle;
    }

    documentsNew.push({
      titre: slot.titre.trim(),
      type: slot.type,
      elements: [element],
      niveaux_ids: [ctx.niveauId],
      disciplines_ids: [ctx.disciplineId],
      aspects_societe: aspectsPg,
      connaissances_ids: ctx.connIds,
      repere_temporel: rt.length > 0 ? rt : null,
      annee_normalisee: annee,
    });
    slots.push({
      slot: slotId,
      ordre,
      mode: "create",
      newIndex: createIdx,
    });
    createIdx += 1;
  }

  const collabIds = buildCollaborateursUserIdsForPayload(state, auteurId);
  if (!collabIds.ok) return { error: "validation" };

  return {
    auteur_id: auteurId,
    tae: {
      conception_mode: state.bloc1.modeConception === "equipe" ? "equipe" : "seul",
      oi_id: state.bloc2.oiId,
      comportement_id: state.bloc2.comportementId,
      cd_id: ctx.cdId,
      connaissances_ids: ctx.connIds,
      consigne: consigneTache,
      guidage: guidageTache,
      corrige: corrigeTache,
      /** Aligné sur `oi.json` via `SET_COMPORTEMENT` (`nbLignesFromComportementJson`). */
      nb_lignes: state.bloc2.nbLignes,
      niveau_id: ctx.niveauId,
      discipline_id: ctx.disciplineId,
      aspects_societe: aspectsPg,
      ...(isActiveAvantApresVariant(state)
        ? {
            non_redaction_data:
              avantReady && avantNorm ? { type: "avant-apres" as const, payload: avantNorm } : null,
          }
        : {}),
    },
    documents_new: documentsNew,
    slots,
    collaborateurs_user_ids: collabIds.ids,
  };
}
