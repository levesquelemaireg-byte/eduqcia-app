/**
 * FICHE-TACHE.md — prévisualisation fiche, sommaire formulaire, skeleton vs contenu.
 */

import { DISCIPLINE_LABEL, NIVEAUX } from "@/components/tae/TaeForm/bloc2/constants";
import { getSlotData, slotLetter, type DocumentSlotData } from "@/lib/tae/document-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import { getRedactionSliceForPreview, type TaeFormState } from "@/lib/tae/tae-form-state-types";
import { cdSelectionToFicheSlice } from "@/lib/tae/cd-helpers";
import { connaissancesToFicheSlice } from "@/lib/tae/connaissances-helpers";
import type { TaeFicheData, DocumentFiche } from "@/lib/types/fiche";
import type { OiEntryJson } from "@/lib/types/oi";
import type { DisciplineCode, NiveauCode } from "@/lib/tae/blueprint-helpers";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import { sortAuteursByFamilyName } from "@/lib/tae/auteur-display-sort";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
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
  isActiveNonRedactionVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tae/wizard-state-nr";

/**
 * Détermine si une section HTML a du contenu textuel significatif.
 * Si false → afficher le skeleton (FICHE-TACHE.md §15, §20).
 */
export function hasFicheContent(value: string | null | undefined): boolean {
  if (!value) return false;
  const stripped = value.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
}

function documentFicheFromSlot(slotId: DocumentSlotId, slot: DocumentSlotData): DocumentFiche {
  const legendTrim = slot.image_legende.trim();
  const hasLegend = legendTrim.length > 0;
  const pos = slot.image_legende_position;
  return {
    letter: slotLetter(slotId),
    titre: slot.titre,
    contenu: slot.contenu,
    source_citation: slot.source_citation,
    type: slot.type,
    image_url: slot.imageUrl,
    imagePixelWidth: slot.imagePixelWidth,
    imagePixelHeight: slot.imagePixelHeight,
    printImpressionScale: 1,
    imageLegende: hasLegend ? legendTrim : null,
    imageLegendePosition: hasLegend && pos ? pos : null,
  };
}

/** Métadonnées affichées dans le pied de fiche — sommaire wizard (`/questions/new`). */
export type WizardFichePreviewMeta = {
  authorFullName: string;
  draftStartedAtIso: string;
};

/**
 * Construit les données fiche à partir du brouillon formulaire (sommaire temps réel).
 * `oiList` : référentiel `/data/oi.json` (même source que le Bloc 2).
 * `previewMeta` : nom affiché + date d’ouverture (évite « Vous » et « — », aligné chargement page).
 *
 * @deprecated Remplacé par les selectors dans `lib/fiche/selectors/` pour le sommaire wizard
 * et `lib/fiche/selectors/lecture-selectors.ts` pour la lecture.
 * Dernier consommateur : `PrintableFichePreview.tsx` — supprimer après migration impression.
 */
export function formStateToTae(
  state: TaeFormState,
  oiList: OiEntryJson[],
  previewMeta?: WizardFichePreviewMeta | null,
): TaeFicheData {
  const oiEntry = oiList.find((o) => o.id === state.bloc2.oiId);
  const comportement = oiEntry?.comportements_attendus.find(
    (c) => c.id === state.bloc2.comportementId,
  );

  const redactionPreview = getRedactionSliceForPreview(state);
  const aspectsSociete: string[] = (
    Object.entries(redactionPreview.aspects) as [AspectSocieteKey, boolean][]
  )
    .filter(([, v]) => v)
    .map(([k]) => ASPECT_LABEL[k]);

  const documents: DocumentFiche[] = state.bloc2.documentSlots.map(({ slotId }) =>
    documentFicheFromSlot(slotId, getSlotData(state.bloc4.documents, slotId)),
  );

  const fallbackAuthor = previewMeta?.authorFullName?.trim() || "—";
  const auteurPrincipal = { id: "draft-local", full_name: fallbackAuthor };

  const auteursRaw: { id: string; full_name: string }[] =
    state.bloc1.modeConception === "equipe"
      ? [
          auteurPrincipal,
          ...state.bloc1.collaborateurs.map((c) => ({
            id: c.id,
            full_name: c.displayName,
          })),
        ]
      : [auteurPrincipal];

  const auteurs = sortAuteursByFamilyName(auteursRaw);

  const niveauLabel =
    NIVEAUX.find((n) => n.value === (state.bloc2.niveau as NiveauCode))?.label ?? "";
  const disc = state.bloc2.discipline;
  const disciplineLabel =
    disc && disc in DISCIPLINE_LABEL ? DISCIPLINE_LABEL[disc as DisciplineCode] : "";

  const ordreNorm = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
  const ordrePayload = isActiveOrdreChronologiqueVariant(state) && ordreNorm ? ordreNorm : null;
  const ligneNorm = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
  const lignePayload = isActiveLigneDuTempsVariant(state) && ligneNorm ? ligneNorm : null;
  const avantNorm = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
  const avantPayload = isActiveAvantApresVariant(state) && avantNorm ? avantNorm : null;

  const consignePublished = avantPayload
    ? buildAvantApresConsigneHtml(avantPayload)
    : ordrePayload
      ? buildOrdreChronologiqueConsigneHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsConsigneHtml(lignePayload)
        : redactionPreview.consigne;
  const guidagePublished = avantPayload
    ? buildAvantApresGuidageHtml()
    : ordrePayload
      ? buildOrdreChronologiqueGuidageHtml()
      : lignePayload
        ? buildLigneDuTempsGuidageHtml()
        : redactionPreview.guidage;
  const corrigePublished = avantPayload
    ? buildAvantApresCorrigeHtml(avantPayload)
    : ordrePayload
      ? buildOrdreChronologiqueCorrigeHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsCorrigeHtml(lignePayload)
        : redactionPreview.corrige;

  return {
    id: "draft",
    auteur_id: "draft-local",
    auteurs,
    consigne: consignePublished,
    guidage: guidagePublished,
    corrige: corrigePublished,
    aspects_societe: aspectsSociete,
    nb_lignes: state.bloc2.nbLignes ?? 5,
    showStudentAnswerLines: !isActiveNonRedactionVariant(state),
    showGuidageOnStudentSheet: undefined,
    niveau: { label: niveauLabel },
    discipline: { label: disciplineLabel },
    oi: {
      id: state.bloc2.oiId,
      titre: oiEntry?.titre ?? "",
      icone: oiEntry?.icone ?? "cognition",
    },
    comportement: {
      id: state.bloc2.comportementId,
      enonce: comportement?.enonce ?? "",
    },
    outilEvaluation: state.bloc2.outilEvaluation,
    cd: cdSelectionToFicheSlice(state.bloc6.cd.selection),
    connaissances: connaissancesToFicheSlice(state.bloc7.connaissances),
    documents,
    version: 1,
    version_updated_at: null,
    is_published: false,
    created_at: previewMeta?.draftStartedAtIso ?? "",
    updated_at: previewMeta?.draftStartedAtIso ?? "",
  };
}

export function formatFicheDate(iso: string | null | undefined): string {
  return formatDateFrCaMedium(iso);
}
