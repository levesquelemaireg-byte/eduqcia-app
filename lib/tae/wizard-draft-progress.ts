import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { getRedactionSliceForPreview, type TaeFormState } from "@/lib/tae/tae-form-state-types";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";

const SLOT_IDS: DocumentSlotId[] = ["doc_A", "doc_B", "doc_C", "doc_D"];

/**
 * Indique si l’état du wizard a avancé au-delà d’un formulaire vierge.
 * Sert à proposer la reprise d’un brouillon local (sessionStorage) sans modal.
 */
export function hasMeaningfulWizardProgress(s: TaeFormState): boolean {
  if (s.currentStep > 0) return true;
  if (s.bloc1.modeConception !== "") return true;
  if (
    s.bloc2.niveau !== "" ||
    s.bloc2.discipline !== "" ||
    s.bloc2.oiId !== "" ||
    s.bloc2.comportementId !== ""
  ) {
    return true;
  }
  if (s.bloc2.blueprintLocked) return true;
  if (s.bloc6.cd.selection !== null) return true;
  if (s.bloc7.connaissances.length > 0) return true;
  if (s.bloc5.nonRedaction != null) return true;
  const rp = getRedactionSliceForPreview(s);
  if (htmlHasMeaningfulText(rp.consigne)) return true;
  if (htmlHasMeaningfulText(rp.guidage)) return true;
  if (htmlHasMeaningfulText(rp.corrige)) return true;
  if (Object.values(rp.aspects).some(Boolean)) return true;

  for (const id of SLOT_IDS) {
    const d = s.bloc4.documents[id];
    if (!d) continue;
    if (d.mode !== "idle") return true;
    if (
      d.titre.trim() !== "" ||
      d.contenu.trim() !== "" ||
      htmlHasMeaningfulText(d.source_citation)
    ) {
      return true;
    }
    if (d.imageUrl) return true;
    if (d.source_document_id) return true;
  }

  return false;
}
