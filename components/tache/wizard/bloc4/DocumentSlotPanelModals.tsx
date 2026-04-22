import { SimpleModal } from "@/components/ui/SimpleModal";
import {
  BanqueDocumentsStub,
  type BanqueDocStub,
} from "@/components/tache/wizard/bloc4/BanqueDocumentsStub";

type Props = {
  changeModeOpen: boolean;
  onCloseChangeMode: () => void;
  onConfirmChangeMode: () => void;
  banqueOpen: boolean;
  onCloseBanque: () => void;
  onSelectBanque: (doc: BanqueDocStub) => void;
};

export function DocumentSlotPanelModals({
  changeModeOpen,
  onCloseChangeMode,
  onConfirmChangeMode,
  banqueOpen,
  onCloseBanque,
  onSelectBanque,
}: Props) {
  return (
    <>
      <SimpleModal
        open={changeModeOpen}
        title="Changer de mode"
        onClose={onCloseChangeMode}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCloseChangeMode}
              className="rounded-lg border border-border bg-panel px-4 py-2 text-sm font-semibold text-deep"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirmChangeMode}
              className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white"
            >
              Continuer
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-deep">
          Les informations saisies pour ce document seront perdues. Souhaitez-vous continuer ?
        </p>
      </SimpleModal>

      <SimpleModal open={banqueOpen} title="Parcourir la banque" onClose={onCloseBanque}>
        <BanqueDocumentsStub onSelect={onSelectBanque} />
      </SimpleModal>
    </>
  );
}
