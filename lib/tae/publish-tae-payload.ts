/**
 * Payload `publish_tae_transaction` — lecture `TaeFormState` via `bloc1`…`bloc7` uniquement
 * (contrat RPC inchangé : `consigne`, `guidage`, `corrige`, `aspects_societe`, documents, etc.).
 */
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
import { buildCollaborateursUserIdsForPayload } from "@/lib/tae/collaborateur-user-ids";
import { getSlotData, isPublicHttpUrl } from "@/lib/tae/document-helpers";
import type { PublishTaeFailureCode, PublishTaeRpcPayload } from "@/lib/tae/publish-tae-types";
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
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { nonRedactionLignePayload, nonRedactionOrdrePayload } from "@/lib/tae/wizard-state-nr";

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

  const consigneTae = ordrePayload
    ? buildOrdreChronologiqueConsigneHtml(ordrePayload)
    : lignePayload
      ? buildLigneDuTempsConsigneHtml(lignePayload)
      : state.bloc3.consigne;
  const guidageTae = ordrePayload
    ? buildOrdreChronologiqueGuidageHtml()
    : lignePayload
      ? buildLigneDuTempsGuidageHtml()
      : state.bloc3.guidage;
  const corrigeTae = ordrePayload
    ? buildOrdreChronologiqueCorrigeHtml(ordrePayload)
    : lignePayload
      ? buildLigneDuTempsCorrigeHtml(lignePayload)
      : state.bloc5.corrige;

  for (const { slotId } of state.bloc2.documentSlots) {
    const slot = getSlotData(state.bloc4.documents, slotId);
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
    },
    documents_new: documentsNew,
    slots,
    collaborateurs_user_ids: collabIds.ids,
  };
}
