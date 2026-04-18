"use client";

import { useMemo } from "react";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";

type Props = {
  rang: number;
  donnees: DonneesTache;
  surClic: () => void;
};

/**
 * Carte compacte d'une tâche dans la pile d'épreuve.
 * Affiche rang, consigne tronquée, pills OI/comportement/connaissance, footer.
 */
export function TacheMiniatureEpreuve({ rang, donnees, surClic }: Props) {
  const consigneTexte = useMemo(() => stripHtml(donnees.consigne), [donnees.consigne]);
  const maxPoints = useMemo(() => calculerMaxPoints(donnees), [donnees]);
  const auteurNom = donnees.auteurs[0]
    ? `${donnees.auteurs[0].first_name} ${donnees.auteurs[0].last_name}`
    : "";
  const derniereConnaissance = donnees.connaissances.at(-1)?.enonce ?? null;

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-start gap-3 rounded-md border border-border p-3 transition-colors duration-150 hover:border-accent hover:bg-accent/5 cursor-pointer"
      onClick={surClic}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          surClic();
        }
      }}
    >
      {/* Numéro du rang */}
      <span className="flex w-9 shrink-0 items-center justify-center text-xl font-medium text-muted">
        {rang}
      </span>

      {/* Contenu principal */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Consigne tronquée */}
        <p className="line-clamp-2 text-xs leading-relaxed text-deep">{consigneTexte}</p>

        {/* Pills */}
        <div className="flex flex-wrap items-stretch gap-2">
          <MetaChip icon={donnees.oi.icone} label={donnees.oi.titre} mode="sommaire" />
          <MetaChip icon="table" label={donnees.comportement.enonce} mode="sommaire" />
          {derniereConnaissance && (
            <MetaChip icon="lightbulb" label={derniereConnaissance} mode="sommaire" />
          )}
        </div>

        {/* Séparateur + footer */}
        <div className="border-t border-border/50 pt-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted">
              {donnees.documents.length} document{donnees.documents.length !== 1 ? "s" : ""}
              {auteurNom ? ` · ${auteurNom}` : ""}
            </span>
            <span className="font-medium text-deep">{maxPoints} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Retire les balises HTML et décode les entités courantes. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Calcule le total max de points depuis l'outil d'évaluation résolu. */
function calculerMaxPoints(donnees: DonneesTache): number {
  return donnees.outilEvaluation.criteres.reduce((somme, critere) => {
    const maxCritere = Math.max(0, ...critere.descripteurs.map((d) => d.points));
    return somme + maxCritere;
  }, 0);
}
