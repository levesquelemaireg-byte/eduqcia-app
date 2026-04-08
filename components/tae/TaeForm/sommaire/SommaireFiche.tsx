"use client";

import { useMemo } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { SommaireFicheAspects } from "@/components/tae/TaeForm/sommaire/SommaireFicheAspects";
import { SommaireFicheCd } from "@/components/tae/TaeForm/sommaire/SommaireFicheCd";
import { SommaireFicheConnaissances } from "@/components/tae/TaeForm/sommaire/SommaireFicheConnaissances";
import { SommaireFicheConsigne } from "@/components/tae/TaeForm/sommaire/SommaireFicheConsigne";
import { SommaireFicheCorrige } from "@/components/tae/TaeForm/sommaire/SommaireFicheCorrige";
import { SommaireFicheDocuments } from "@/components/tae/TaeForm/sommaire/SommaireFicheDocuments";
import { SommaireFicheGuidage } from "@/components/tae/TaeForm/sommaire/SommaireFicheGuidage";
import { getRedactionSliceForPreview, useTaeForm } from "@/components/tae/TaeForm/FormState";
import { cdSelectionToFicheSlice } from "@/lib/tae/cd-helpers";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
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
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tae/wizard-state-nr";

export function SommaireFiche() {
  const { state, dispatch } = useTaeForm();
  const redactionPreview = useMemo(() => getRedactionSliceForPreview(state), [state]);
  const r = useDebouncedValue(redactionPreview, 300);
  const documentsDebounced = useDebouncedValue(state.bloc4.documents, 300);
  const cdSlice = cdSelectionToFicheSlice(state.bloc6.cd.selection);
  const disc = state.bloc2.discipline as DisciplineCode;

  const selectedAspectLabels = (Object.entries(r.aspects) as [AspectSocieteKey, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => ASPECT_LABEL[k]);

  const ordreNorm = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
  const ordrePayload = isActiveOrdreChronologiqueVariant(state) && ordreNorm ? ordreNorm : null;
  const ligneNorm = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
  const lignePayload = isActiveLigneDuTempsVariant(state) && ligneNorm ? ligneNorm : null;
  const avantNorm = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
  const avantPayload = isActiveAvantApresVariant(state) && avantNorm ? avantNorm : null;

  const consigneHtml = avantPayload
    ? buildAvantApresConsigneHtml(avantPayload)
    : ordrePayload
      ? buildOrdreChronologiqueConsigneHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsConsigneHtml(lignePayload)
        : r.consigne;
  const corrigeHtml = avantPayload
    ? buildAvantApresCorrigeHtml(avantPayload)
    : ordrePayload
      ? buildOrdreChronologiqueCorrigeHtml(ordrePayload)
      : lignePayload
        ? buildLigneDuTempsCorrigeHtml(lignePayload)
        : r.corrige;
  const guidageHtml = avantPayload
    ? buildAvantApresGuidageHtml()
    : ordrePayload
      ? buildOrdreChronologiqueGuidageHtml()
      : lignePayload
        ? buildLigneDuTempsGuidageHtml()
        : r.guidage;

  return (
    <div className="mt-6 space-y-6 border-t border-border pt-6">
      <SommaireFicheConsigne
        consigneHtml={consigneHtml}
        documentSlotCount={state.bloc2.documentSlots.length}
      />
      <SommaireFicheAspects selectedLabels={selectedAspectLabels} />
      <SommaireFicheCorrige corrigeHtml={corrigeHtml} />
      <SommaireFicheGuidage guidageHtml={guidageHtml} />
      <SommaireFicheDocuments
        documentSlotCount={state.bloc2.documentSlots.length}
        debouncedDocuments={documentsDebounced}
      />
      <SommaireFicheCd discipline={disc} cdSlice={cdSlice} />
      <SommaireFicheConnaissances
        discipline={disc}
        items={state.bloc7.connaissances}
        onRemoveRow={(rowId) => dispatch({ type: "REMOVE_CONNAISSANCE_BY_ROW_ID", rowId })}
      />
    </div>
  );
}
