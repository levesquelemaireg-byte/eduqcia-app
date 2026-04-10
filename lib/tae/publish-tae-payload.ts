/**
 * Payload `publish_tae_transaction` — lecture `TaeFormState` via `bloc1`…`bloc7` uniquement
 * (contrat RPC inchangé : `consigne`, `guidage`, `corrige`, `aspects_societe`, documents, etc.).
 */
import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
import { buildCollaborateursUserIdsForPayload } from "@/lib/tae/collaborateur-user-ids";
import { getSlotData, isPublicHttpUrl } from "@/lib/tae/document-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";
import {
  migrateMomentsToSlots,
  migratePerspectivesToSlots,
} from "@/lib/tae/oi-perspectives/perspectives-helpers";
import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";

type DocumentTypeIconoSlug = DocumentCategorieIconographiqueId;
import type { PublishTaeFailureCode, PublishTaeRpcPayload } from "@/lib/tae/publish-tae-types";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
  isAvantApresPayloadConsistentWithDocuments,
  isAvantApresStep3ThemeComplete,
  isAvantApresStep5OptionsComplete,
  normalizeAvantApresPayload,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsCorrigeHtml,
  buildLigneDuTempsGuidageHtml,
  normalizeLigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import {
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueCorrigeHtml,
  buildOrdreChronologiqueGuidageHtml,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tae/wizard-state-nr";

function aspectsToPgArray(state: TaeFormState): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(state.bloc7.aspects) as [AspectSocieteKey, boolean][]) {
    if (v) out.push(ASPECT_LABEL[k]);
  }
  return out;
}

export function buildPublishPayload(
  auteurId: string,
  state: TaeFormState,
  ctx: {
    niveauId: number;
    disciplineId: number;
    cdId: number | null;
    connIds: number[];
  },
): PublishTaeRpcPayload | { error: PublishTaeFailureCode } {
  const aspectsPg = aspectsToPgArray(state);
  const documentsNew: PublishTaeRpcPayload["documents_new"] = [];
  const slots: PublishTaeRpcPayload["slots"] = [];
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

  const consigneTae = avantReady
    ? buildAvantApresConsigneHtml(avantNorm)
    : ordrePayload
      ? buildOrdreChronologiqueConsigneHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsConsigneHtml(lignePayload)
        : state.bloc3.consigne;
  const guidageTae = avantReady
    ? buildAvantApresGuidageHtml()
    : ordrePayload
      ? buildOrdreChronologiqueGuidageHtml()
      : lignePayload
        ? buildLigneDuTempsGuidageHtml()
        : state.bloc3.guidage;
  const corrigeTae = avantReady
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
    const legendPayload =
      slot.type === "iconographique" && legendTrim.length > 0 && slot.image_legende_position
        ? { image_legende: legendTrim, image_legende_position: slot.image_legende_position }
        : {};
    const contenuPublish: string | null = slot.type === "textuel" ? slot.contenu : null;
    const sourceCitationPublish = slot.source_citation.trim();
    const rt = slot.repere_temporel.trim();
    const annee =
      slot.annee_normalisee != null && Number.isFinite(slot.annee_normalisee)
        ? slot.annee_normalisee
        : null;
    const typeIconoPayload: { type_iconographique?: DocumentTypeIconoSlug | null } =
      slot.type === "iconographique" && slot.type_iconographique != null
        ? { type_iconographique: slot.type_iconographique }
        : {};
    const categorieTextuellePayload: { categorie_textuelle?: CategorieTextuelleValue | null } =
      slot.type === "textuel" && slot.categorie_textuelle != null
        ? { categorie_textuelle: slot.categorie_textuelle }
        : {};
    documentsNew.push({
      titre: slot.titre.trim(),
      type: slot.type,
      contenu: contenuPublish,
      image_url: slot.type === "iconographique" ? slot.imageUrl : null,
      source_citation: sourceCitationPublish,
      source_type: st,
      ...legendPayload,
      niveaux_ids: [ctx.niveauId],
      disciplines_ids: [ctx.disciplineId],
      aspects_societe: aspectsPg,
      connaissances_ids: ctx.connIds,
      repere_temporel: rt.length > 0 ? rt : null,
      annee_normalisee: annee,
      ...typeIconoPayload,
      ...categorieTextuellePayload,
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
      consigne: consigneTae,
      guidage: guidageTae,
      corrige: corrigeTae,
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
