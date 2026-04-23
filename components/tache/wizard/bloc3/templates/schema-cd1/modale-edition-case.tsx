"use client";

import { useCallback, useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { Textarea } from "@/components/ui/Textarea";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { obtenirCase, type CleCase } from "@/lib/tache/schema-cd1/types";
import {
  SECTION_B_CHAMP_GUIDAGE_HINT,
  SECTION_B_CHAMP_GUIDAGE_LABEL,
  SECTION_B_CHAMP_GUIDAGE_TOOLTIP,
  SECTION_B_CHAMP_REPONSE_HINT,
  SECTION_B_CHAMP_REPONSE_LABEL,
  SECTION_B_CHAMP_REPONSE_TOOLTIP,
  SECTION_B_POPOVER_ICONE_PRIVE_ENSEIGNANT,
  SECTION_B_POPOVER_ICONE_VISIBLE_ELEVE,
} from "@/lib/ui/ui-copy";
import { titreCaseDetaille } from "./helpers";

type Props = {
  cle: CleCase | null;
  onClose: () => void;
};

function ChampInfoIcon({ title, icone, aria }: { title: string; icone: string; aria: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel-alt text-accent ring-1 ring-border/60"
      title={title}
      aria-label={aria}
    >
      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
        {icone}
      </span>
    </span>
  );
}

export function ModaleEditionCase({ cle, onClose }: Props) {
  const { state, dispatch } = useTacheForm();
  const schema = state.bloc3.schemaCd1;
  const [helpGuidageOpen, setHelpGuidageOpen] = useState(false);
  const [helpReponseOpen, setHelpReponseOpen] = useState(false);

  const donnees = cle && schema ? obtenirCase(schema, cle) : null;

  const setGuidage = useCallback(
    (value: string) => {
      if (!cle) return;
      dispatch({ type: "SET_SCHEMA_CASE", cleCase: cle, champ: "guidage", value });
    },
    [cle, dispatch],
  );

  const setReponse = useCallback(
    (value: string) => {
      if (!cle) return;
      dispatch({ type: "SET_SCHEMA_CASE", cleCase: cle, champ: "reponse", value });
    },
    [cle, dispatch],
  );

  if (!cle || !donnees || !schema) return null;

  const titre = titreCaseDetaille(cle, state.bloc2.aspectA, state.bloc2.aspectB);

  return (
    <SimpleModal open={cle !== null} title={titre} onClose={onClose} panelClassName="max-w-2xl">
      <div className="space-y-5 px-5 py-4">
        {/* Guidage — visible élève */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ChampInfoIcon
              icone="visibility"
              title={SECTION_B_POPOVER_ICONE_VISIBLE_ELEVE}
              aria={SECTION_B_POPOVER_ICONE_VISIBLE_ELEVE}
            />
            <label htmlFor="champ-guidage" className="text-sm font-semibold text-deep">
              {SECTION_B_CHAMP_GUIDAGE_LABEL} <RequiredMark />
            </label>
            <button
              type="button"
              onClick={() => setHelpGuidageOpen(true)}
              className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
              aria-label="Aide — énoncé de guidage"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                info
              </span>
            </button>
          </div>
          <p className="text-xs text-muted">{SECTION_B_CHAMP_GUIDAGE_HINT}</p>
          <RichTextEditor
            id="champ-guidage"
            instanceId={`champ-guidage-${cle}`}
            value={donnees.guidage}
            onChange={setGuidage}
            minHeight={80}
          />
        </div>

        {/* Réponse — privé enseignant */}
        <div className="space-y-2 rounded-md border border-border bg-panel-alt/50 p-3">
          <div className="flex items-center gap-2">
            <ChampInfoIcon
              icone="lock"
              title={SECTION_B_POPOVER_ICONE_PRIVE_ENSEIGNANT}
              aria={SECTION_B_POPOVER_ICONE_PRIVE_ENSEIGNANT}
            />
            <label htmlFor="champ-reponse" className="text-sm font-semibold text-deep">
              {SECTION_B_CHAMP_REPONSE_LABEL} <RequiredMark />
            </label>
            <button
              type="button"
              onClick={() => setHelpReponseOpen(true)}
              className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
              aria-label="Aide — réponse attendue"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                info
              </span>
            </button>
          </div>
          <p className="text-xs text-muted">{SECTION_B_CHAMP_REPONSE_HINT}</p>
          <Textarea
            id="champ-reponse"
            value={donnees.reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={3}
            placeholder="Réponse courte, factuelle, directement repérable dans les documents."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-surface hover:bg-accent/90"
          >
            Fermer
          </button>
        </div>
      </div>

      <SimpleModal
        open={helpGuidageOpen}
        title={SECTION_B_CHAMP_GUIDAGE_LABEL}
        onClose={() => setHelpGuidageOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{SECTION_B_CHAMP_GUIDAGE_TOOLTIP}</p>
      </SimpleModal>
      <SimpleModal
        open={helpReponseOpen}
        title={SECTION_B_CHAMP_REPONSE_LABEL}
        onClose={() => setHelpReponseOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{SECTION_B_CHAMP_REPONSE_TOOLTIP}</p>
      </SimpleModal>
    </SimpleModal>
  );
}
