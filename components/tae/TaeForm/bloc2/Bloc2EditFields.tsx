"use client";

import { BLOC2_STEPPER_ICON } from "@/components/tae/TaeForm/bloc2-stepper-icons";
import {
  Bloc2GrilleAndModals,
  Bloc2VoirGrilleCorrectionCta,
} from "@/components/tae/TaeForm/bloc2/Bloc2GrilleAndModals";
import { Bloc2EspaceProductionReadonly } from "@/components/tae/TaeForm/bloc2/Bloc2EspaceProductionReadonly";
import { ComportementPicker } from "@/components/tae/TaeForm/bloc2/ComportementPicker";
import { DISCIPLINE_LABEL, NIVEAU_SELECT_OPTIONS } from "@/components/tae/TaeForm/bloc2/constants";
import { ListboxField } from "@/components/ui/ListboxField";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import { isDisciplineAutoAssignedForNiveau } from "@/lib/tae/blueprint-helpers";
import { OiPicker } from "@/components/tae/TaeForm/bloc2/OiPicker";
import type { BlueprintSlice } from "@/components/tae/TaeForm/FormState";
import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import type { ComportementAttenduJson, OiEntryJson } from "@/lib/types/oi";
import {
  BLOC2_DISCIPLINE_AUTO_ASSIGNED,
  BLOC2_DISCIPLINE_HELP,
  BLOC2_DISCIPLINE_PREREQ_NIVEAU,
  SELECT_PLACEHOLDER_DISCIPLINE,
  SELECT_PLACEHOLDER_NIVEAU_SCOLAIRE,
} from "@/lib/ui/ui-copy";

type Props = {
  blueprint: BlueprintSlice;
  oiList: OiEntryJson[];
  selectedOi: OiEntryJson | undefined;
  selectedComportement: ComportementAttenduJson | undefined;
  disciplineOptions: DisciplineCode[];
  comportementsSelectable: ComportementAttenduJson[];
  grilleForModal: GrilleEntry | null;
  onSetNiveau: (niveau: string) => void;
  onSetDiscipline: (discipline: string) => void;
  onSetOi: (oiId: string) => void;
  onSetComportement: (c: ComportementAttenduJson) => void;
  grilleModalOpen: boolean;
  onGrilleModalOpenChange: (open: boolean) => void;
  modalOiOpen: boolean;
  onModalOiOpenChange: (open: boolean) => void;
  modalComportementOpen: boolean;
  onModalComportementOpenChange: (open: boolean) => void;
};

export function Bloc2EditFields({
  blueprint: b,
  oiList,
  selectedOi,
  selectedComportement,
  disciplineOptions,
  comportementsSelectable,
  grilleForModal,
  onSetNiveau,
  onSetDiscipline,
  onSetOi,
  onSetComportement,
  grilleModalOpen,
  onGrilleModalOpenChange,
  modalOiOpen,
  onModalOiOpenChange,
  modalComportementOpen,
  onModalComportementOpenChange,
}: Props) {
  const disciplineLocked = isDisciplineAutoAssignedForNiveau(b.niveau);
  const disciplineLabel =
    b.discipline && b.discipline in DISCIPLINE_LABEL
      ? DISCIPLINE_LABEL[b.discipline as DisciplineCode]
      : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="tae-niveau" className="icon-text text-sm font-semibold text-deep">
            <span
              className="material-symbols-outlined text-accent"
              aria-hidden="true"
              title={materialIconTooltip("school")}
            >
              school
            </span>
            <span>
              Niveau scolaire <RequiredMark />
            </span>
          </label>
          <ListboxField
            id="tae-niveau"
            value={b.niveau}
            onChange={onSetNiveau}
            allowEmpty
            placeholder={SELECT_PLACEHOLDER_NIVEAU_SCOLAIRE}
            className="w-full"
            aria-required
            options={NIVEAU_SELECT_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
              disabled: opt.disabled,
            }))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tae-discipline" className="icon-text text-sm font-semibold text-deep">
            <span
              className="material-symbols-outlined text-accent"
              aria-hidden="true"
              title={materialIconTooltip(BLOC2_STEPPER_ICON.discipline)}
            >
              {BLOC2_STEPPER_ICON.discipline}
            </span>
            <span>
              Discipline <RequiredMark />
            </span>
          </label>
          {disciplineLocked && b.discipline ? (
            <div
              id="tae-discipline"
              className="auth-input flex min-h-11 w-full flex-col justify-center rounded-lg border border-border bg-panel px-3 py-2 text-sm text-deep"
            >
              <span className="font-medium text-deep">{disciplineLabel}</span>
              <span className="icon-text mt-1 gap-1 text-xs font-normal text-muted">
                <span
                  className="material-symbols-outlined text-[1em] leading-none text-muted"
                  aria-hidden="true"
                  title={materialIconTooltip("settings")}
                >
                  settings
                </span>
                <span>{BLOC2_DISCIPLINE_AUTO_ASSIGNED}</span>
              </span>
            </div>
          ) : (
            <>
              <ListboxField
                id="tae-discipline"
                value={b.discipline}
                onChange={onSetDiscipline}
                disabled={!b.niveau}
                allowEmpty
                placeholder={SELECT_PLACEHOLDER_DISCIPLINE}
                className="w-full"
                aria-required={Boolean(b.niveau)}
                options={disciplineOptions.map((d) => ({
                  value: d,
                  label: DISCIPLINE_LABEL[d],
                }))}
              />
              <p className="text-sm leading-relaxed text-muted">
                {b.niveau ? BLOC2_DISCIPLINE_HELP : BLOC2_DISCIPLINE_PREREQ_NIVEAU}
              </p>
            </>
          )}
        </div>
      </div>

      <OiPicker
        oiList={oiList}
        oiId={b.oiId}
        disciplineSet={Boolean(b.discipline)}
        selectedOi={selectedOi}
        onSelectOi={onSetOi}
        onInfoClick={() => onModalOiOpenChange(true)}
      />

      <ComportementPicker
        comportements={comportementsSelectable}
        comportementId={b.comportementId}
        disabled={!selectedOi}
        oiSelected={Boolean(selectedOi)}
        onSelectComportement={onSetComportement}
        onInfoClick={() => onModalComportementOpenChange(true)}
      />

      <Bloc2VoirGrilleCorrectionCta
        disabled={!b.outilEvaluation}
        onOpen={() => onGrilleModalOpenChange(true)}
      />

      <Bloc2EspaceProductionReadonly selectedComportement={selectedComportement} />

      <Bloc2GrilleAndModals
        blueprint={b}
        oiList={oiList}
        selectedComportement={selectedComportement}
        grilleForModal={grilleForModal}
        grilleModalOpen={grilleModalOpen}
        onGrilleModalOpenChange={onGrilleModalOpenChange}
        modalOiOpen={modalOiOpen}
        onModalOiOpenChange={onModalOiOpenChange}
        modalComportementOpen={modalComportementOpen}
        onModalComportementOpenChange={onModalComportementOpenChange}
      />

      {b.nbDocuments != null ? (
        <span className="sr-only">
          {b.nbDocuments} document(s) — {b.documentSlots.map((s) => s.slotId).join(", ") || "—"}
        </span>
      ) : null}
    </div>
  );
}
