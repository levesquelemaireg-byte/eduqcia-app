"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ApercuImpression } from "@/components/epreuve/impression";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { useGrilles, useOiData } from "@/components/tache/wizard/bloc2/useBloc2Data";
import { parseCategorieTextuelle } from "@/lib/documents/categorie-textuelle";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { documentVersImprimable } from "@/lib/document/impression/document-vers-imprimable";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { mesurerBlocImpression } from "@/lib/impression/mesure-estimation";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import {
  etatWizardVersTache,
  type GrilleEvaluationEntree,
} from "@/lib/tache/contrats/etat-wizard-vers-tache";
import { parseDocumentLegendPosition } from "@/lib/tache/document-helpers";
import type { WizardFichePreviewMeta } from "@/lib/tache/fiche-helpers";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import type { DocumentElement, RendererDocument } from "@/lib/types/document-renderer";
import styles from "./apercu-imprime-live.module.css";

type TacheProps = {
  previewMeta: WizardFichePreviewMeta;
  mode: ModeImpression;
  estCorrige: boolean;
};

/**
 * Aperçu impression temps réel — wizard tâche (contexte 1).
 *
 * FormState tâche → `etatWizardVersTache` → `tacheVersImprimable` →
 * `ApercuImpression` (composant canonique partagé avec Puppeteer SSR).
 * Rendu dans le `.canvas` scrollable, enfant direct du tabpanel.
 */
export function ApercuImprimeLiveTache({ previewMeta, mode, estCorrige }: TacheProps) {
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

/**
 * Aperçu impression temps réel — wizard document autonome (contexte 1).
 *
 * FormState document (via `useFormContext` + `useWatch`) → `RendererDocument` →
 * `documentVersImprimable` → `ApercuImpression`. Mêmes pipeline et rendu que
 * Puppeteer via la route SSR `/apercu/[token]`. Doit être un enfant direct du
 * tabpanel (pas de wrapper qui intercepte le scroll).
 */
export function ApercuImprimeLiveDocument() {
  const { control } = useFormContext<AutonomousDocumentFormValues>();
  const titre = useWatch({ control, name: "titre" });
  const structure = useWatch({ control, name: "structure" });
  const elements = useWatch({ control, name: "elements" });

  const rendu = useMemo(() => {
    const els: DocumentElement[] = (elements ?? []).map((el, i) => {
      const base = {
        id: el.id ?? `el_${i}`,
        auteur: el.auteur || undefined,
        repereTemporel: el.repere_temporel || undefined,
        sousTitre: el.sous_titre || undefined,
        source: el.source_citation ?? "",
        sourceType: (el.source_type === "primaire" ? "primaire" : "secondaire") as
          | "primaire"
          | "secondaire",
      };

      if (el.type === "iconographique") {
        return {
          ...base,
          type: "iconographique" as const,
          imageUrl: el.image_url ?? "",
          legende: el.image_legende || undefined,
          legendePosition: parseDocumentLegendPosition(el.image_legende_position) ?? undefined,
          categorieIconographique: parseTypeIconographique(el.type_iconographique) ?? "autre",
        };
      }

      return {
        ...base,
        type: "textuel" as const,
        contenu: el.contenu ?? "",
        categorieTextuelle: parseCategorieTextuelle(el.categorie_textuelle) ?? "autre",
      };
    });

    const rendererDoc: RendererDocument = {
      id: "wizard-preview",
      titre: titre ?? "",
      structure: structure ?? "simple",
      elements: els,
    };

    return documentVersImprimable(rendererDoc, mesurerBlocImpression);
  }, [titre, structure, elements]);

  return (
    <div className={styles.canvas}>{rendu?.ok ? <ApercuImpression rendu={rendu} /> : null}</div>
  );
}
