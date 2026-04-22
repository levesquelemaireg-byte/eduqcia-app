"use client";

/**
 * Modales d’aide du bloc 3 (consigne, guidage) — titres / corps courts dans `modalCopy.ts` ; consigne : `Bloc3ConsigneHelpModalBody` + `docs/DECISIONS.md`.
 */
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Bloc3ConsigneHelpModalBody } from "@/components/tache/wizard/bloc3/Bloc3ConsigneHelpModalBody";
import {
  BLOC3_MODAL_CONSIGNE_TITLE,
  BLOC3_MODAL_GUIDAGE_BODY,
  BLOC3_MODAL_GUIDAGE_TITLE,
} from "@/components/tache/wizard/bloc3/modalCopy";

type Props = {
  openConsigne: boolean;
  openGuidage: boolean;
  onCloseConsigne: () => void;
  onCloseGuidage: () => void;
};

export function Bloc3InfoModals({
  openConsigne,
  openGuidage,
  onCloseConsigne,
  onCloseGuidage,
}: Props) {
  return (
    <>
      <SimpleModal
        open={openConsigne}
        title={BLOC3_MODAL_CONSIGNE_TITLE}
        onClose={onCloseConsigne}
        titleStyle="info-help"
      >
        <Bloc3ConsigneHelpModalBody />
      </SimpleModal>
      <SimpleModal
        open={openGuidage}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={onCloseGuidage}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC3_MODAL_GUIDAGE_BODY}</p>
      </SimpleModal>
    </>
  );
}
