"use client";

import { useMemo } from "react";
import { ApercuImpression } from "@/components/epreuve/impression";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { useGrilles, useOiData } from "@/components/tache/wizard/bloc2/useBloc2Data";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { mesurerBlocImpression } from "@/lib/impression/mesure-estimation";
import {
  etatWizardVersTache,
  type GrilleEvaluationEntree,
} from "@/lib/tache/contrats/etat-wizard-vers-tache";
import type { WizardFichePreviewMeta } from "@/lib/tache/fiche-helpers";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import styles from "./apercu-imprime-live.module.css";

type Props = {
  previewMeta: WizardFichePreviewMeta;
  mode: ModeImpression;
  estCorrige: boolean;
};

/**
 * Aperçu impression temps réel — wizard tâche (contexte 1).
 *
 * Transforme l'état du wizard en `RenduImprimable` via le même pipeline que
 * Puppeteer (`etatWizardVersTache` → `tacheVersImprimable`), puis délègue à
 * `ApercuImpression` (composant canonique partagé avec la route SSR
 * `/apercu/[token]`). Réactif au changement de mode via les props.
 */
export function ApercuImprimeLiveTache({ previewMeta, mode, estCorrige }: Props) {
  const { state } = useTacheForm();
  const { oiList } = useOiData();
  const grilles = useGrilles();

  const rendu = useMemo(() => {
    if (!oiList || oiList.length === 0) return null;
    if (!grilles) return null;

    const grillesEntrees: GrilleEvaluationEntree[] = grilles.map((g) => ({
      id: g.id,
      oi: g.operation,
      comportement_enonce: g.comportement_enonce,
      bareme: g.bareme,
    }));

    const donnees = etatWizardVersTache(state, oiList, grillesEntrees, previewMeta);
    return tacheVersImprimable(donnees, { mode, estCorrige }, mesurerBlocImpression);
  }, [state, oiList, grilles, previewMeta, mode, estCorrige]);

  return (
    <div className={styles.canvas}>{rendu?.ok ? <ApercuImpression rendu={rendu} /> : null}</div>
  );
}
