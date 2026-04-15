"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { GrilleData } from "@/lib/fiche/selectors/tache/grille";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import { useGrilles } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import { FICHE_SECTION_TITLE_GRILLE } from "@/lib/ui/ui-copy";

/** Largeur fixe du tableau de grille (définie dans eval-grid.module.css). */
const GRILLE_FIXED_WIDTH = 660;

type Props = { data: GrilleData };

/**
 * Section Outil d'évaluation de la vue détaillée tâche.
 *
 * Le tableau ministériel fait 660px fixe (pixel-perfect, non négociable).
 * Pour qu'il soit toujours entièrement visible, un ResizeObserver mesure
 * la zone de contenu réelle (ref sur un div SANS padding) et applique
 * un `zoom` CSS pour réduire le tableau proportionnellement.
 *
 * `zoom` (vs `transform: scale`) est choisi parce qu'il affecte le layout :
 * l'élément zoomé occupe sa taille visuelle dans le flux, donc pas de
 * débordement ni d'espace fantôme.
 */
export function SectionGrille({ data }: Props) {
  const grilles = useGrilles();
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const entry = useMemo(
    () => grilles?.find((g) => g.id === data.outilEvaluationId) ?? null,
    [grilles, data.outilEvaluationId],
  );

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([e]) => {
      // contentBoxSize donne la largeur réelle du contenu, sans padding ni border
      const width = e.contentBoxSize?.[0]?.inlineSize ?? el.clientWidth;
      setScale(width >= GRILLE_FIXED_WIDTH ? 1 : width / GRILLE_FIXED_WIDTH);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section>
      <SectionLabel icon="table">{FICHE_SECTION_TITLE_GRILLE}</SectionLabel>

      <div className="overflow-hidden rounded-xl border-[0.5px] border-border bg-panel p-4">
        {/* Ref sur ce div sans padding — sa largeur = espace réel pour la grille */}
        <div ref={measureRef}>
          <div style={scale < 1 ? { zoom: scale } : undefined}>
            <GrilleEvalTable
              entry={entry}
              outilEvaluationId={data.outilEvaluationId}
              viewport="comfort"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
