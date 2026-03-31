"use client";

import { GrilleCorrectionModal } from "@/components/tae/fiche/GrilleCorrectionModal";
import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { cn } from "@/lib/utils/cn";
import { MODAL_TITRE_OPERATION_INTELLECTUELLE } from "@/components/tae/TaeForm/bloc2/constants";
import type { BlueprintSlice } from "@/components/tae/TaeForm/FormState";
import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import type { ComportementAttenduJson, OiEntryJson } from "@/lib/types/oi";
import {
  BLOC2_MODAL_COMPORTEMENT_INTRO,
  BLOC2_MODAL_COMPORTEMENT_PICK_FIRST,
  BLOC2_MODAL_OI_INTRO,
  BLOC2_OI_COMING_SOON,
  BLOC2_VOIR_GRILLE_CTA,
} from "@/lib/ui/ui-copy";

const MODAL_TITRE_COMPORTEMENT = "Comportement attendu";

type VoirGrilleProps = {
  disabled: boolean;
  onOpen: () => void;
};

export function Bloc2VoirGrilleCorrectionCta({ disabled, onOpen }: VoirGrilleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpen()}
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 text-sm font-semibold text-deep hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          table_eye
        </span>
        {BLOC2_VOIR_GRILLE_CTA}
      </button>
    </div>
  );
}

type ModalsProps = {
  blueprint: BlueprintSlice;
  oiList: OiEntryJson[];
  selectedComportement: ComportementAttenduJson | undefined;
  grilleForModal: GrilleEntry | null;
  grilleModalOpen: boolean;
  onGrilleModalOpenChange: (open: boolean) => void;
  modalOiOpen: boolean;
  onModalOiOpenChange: (open: boolean) => void;
  modalComportementOpen: boolean;
  onModalComportementOpenChange: (open: boolean) => void;
};

export function Bloc2GrilleAndModals({
  blueprint: b,
  oiList,
  selectedComportement,
  grilleForModal,
  grilleModalOpen,
  onGrilleModalOpenChange,
  modalOiOpen,
  onModalOiOpenChange,
  modalComportementOpen,
  onModalComportementOpenChange,
}: ModalsProps) {
  return (
    <>
      <GrilleCorrectionModal
        open={grilleModalOpen}
        onClose={() => onGrilleModalOpenChange(false)}
        outilEvaluation={b.outilEvaluation}
        grilleForModal={grilleForModal}
      />

      <SimpleModal
        open={modalOiOpen}
        title={MODAL_TITRE_OPERATION_INTELLECTUELLE}
        onClose={() => onModalOiOpenChange(false)}
        titleStyle="info-help"
      >
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <p>{BLOC2_MODAL_OI_INTRO}</p>
          <ul className="list-none space-y-2 border-t border-border pt-3">
            {oiList.map((oi) => (
              <li
                key={oi.id}
                className={cn("icon-lead min-w-0 border-b border-border/80 pb-2 last:border-0")}
              >
                <MaterialSymbolOiGlyph
                  glyph={oi.icone}
                  className="shrink-0 text-xl leading-none text-accent"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-deep">{oi.titre}</span>
                  {oi.status === "coming_soon" ? (
                    <span className="block text-xs text-muted">{BLOC2_OI_COMING_SOON}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SimpleModal>
      <SimpleModal
        open={modalComportementOpen}
        title={MODAL_TITRE_COMPORTEMENT}
        onClose={() => onModalComportementOpenChange(false)}
        titleStyle="info-help"
      >
        <div className="space-y-3 text-sm leading-relaxed text-muted">
          <p>{BLOC2_MODAL_COMPORTEMENT_INTRO}</p>
          {selectedComportement ? (
            <p>
              <span className="font-semibold text-deep">Exemple : </span>
              {selectedComportement.enonce}
            </p>
          ) : (
            <p>{BLOC2_MODAL_COMPORTEMENT_PICK_FIRST}</p>
          )}
        </div>
      </SimpleModal>
    </>
  );
}
