"use client";

/**
 * Modales d’aide du bloc 3 (consigne, aspects, corrigé, guidage) — titres / corps courts dans `modalCopy.ts` ; consigne : `Bloc3ConsigneHelpModalBody` + `docs/DECISIONS.md`.
 * Implémentation : plusieurs `SimpleModal` (une par aide) ; comportement et copy sont la vérité produit.
 */
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Bloc3ConsigneHelpModalBody } from "@/components/tae/TaeForm/bloc3/Bloc3ConsigneHelpModalBody";
import {
  BLOC3_MODAL_ASPECTS_BODY,
  BLOC3_MODAL_ASPECTS_TITLE,
  BLOC3_MODAL_CONSIGNE_TITLE,
  BLOC3_MODAL_CORRIGE_BODY,
  BLOC3_MODAL_CORRIGE_TITLE,
  BLOC3_MODAL_GUIDAGE_BODY,
  BLOC3_MODAL_GUIDAGE_TITLE,
} from "@/components/tae/TaeForm/bloc3/modalCopy";

type Props = {
  openConsigne: boolean;
  openAspects: boolean;
  openCorrige: boolean;
  openGuidage: boolean;
  onCloseConsigne: () => void;
  onCloseAspects: () => void;
  onCloseCorrige: () => void;
  onCloseGuidage: () => void;
};

export function Bloc3InfoModals({
  openConsigne,
  openAspects,
  openCorrige,
  openGuidage,
  onCloseConsigne,
  onCloseAspects,
  onCloseCorrige,
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
        open={openAspects}
        title={BLOC3_MODAL_ASPECTS_TITLE}
        onClose={onCloseAspects}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC3_MODAL_ASPECTS_BODY}</p>
      </SimpleModal>
      <SimpleModal
        open={openCorrige}
        title={BLOC3_MODAL_CORRIGE_TITLE}
        onClose={onCloseCorrige}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC3_MODAL_CORRIGE_BODY}</p>
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
