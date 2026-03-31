"use client";

import { useMemo } from "react";
import { FicheTache } from "@/components/tae/FicheTache";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { useOiData } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import { formStateToTae, type WizardFichePreviewMeta } from "@/lib/tae/fiche-helpers";

type Props = {
  previewMeta: WizardFichePreviewMeta;
};

/** Sommaire formulaire — FICHE-TACHE.md mode `sommaire`. */
export function FicheSommaireColumn({ previewMeta }: Props) {
  const { state, dispatch } = useTaeForm();
  const { oiList } = useOiData();

  const tae = useMemo(() => {
    if (!oiList || oiList.length === 0) return null;
    return formStateToTae(state, oiList, previewMeta);
  }, [state, oiList, previewMeta]);

  if (!tae) {
    return <div className="h-48 w-full animate-pulse rounded-xl bg-border/40" aria-hidden="true" />;
  }

  return (
    <FicheTache
      tae={tae}
      mode="sommaire"
      connaissancesSommaire={{
        items: state.bloc7.connaissances,
        onRemoveRow: (rowId) => dispatch({ type: "REMOVE_CONNAISSANCE_BY_ROW_ID", rowId }),
      }}
    />
  );
}
