"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

export type OngletId = "sommaire" | "apercu-imprime";

type Props = {
  ongletActif: OngletId;
  surChangerOnglet: (onglet: OngletId) => void;
  /**
   * Slot optionnel rendu à droite de la barre — réservé aux contrôles
   * contextuels de l'onglet actif (ex. navbar modes d'impression sur
   * l'onglet « Aperçu de l'imprimé »). Pattern : pill buttons co-localisés
   * avec les onglets, comme le PreviewPanel du wizard.
   */
  actions?: ReactNode;
};

const ONGLETS: { id: OngletId; icone: string; libelle: string }[] = [
  { id: "sommaire", icone: ICONES_METIER.sommaire, libelle: "Sommaire" },
  { id: "apercu-imprime", icone: "print", libelle: "Aperçu de l'imprimé" },
];

/**
 * Onglets Sommaire / Aperçu de l'imprimé — sous-navbar des vues détaillées.
 * Hauteur 40px, font 13px, underline accent 2px sur l'onglet actif.
 * Le -mb-px fait chevaucher la border-b-2 du bouton actif avec la border-b
 * du wrapper sous-navbar pour un trait teal continu de 2px.
 *
 * Slot `actions` à droite : aligné via `justify-between`. La hauteur de la
 * barre est conservée (h-10) — les actions doivent s'auto-aligner.
 */
export function Onglets({ ongletActif, surChangerOnglet, actions }: Props) {
  return (
    <div className="-mb-px flex h-10 items-center justify-between gap-3">
      <div className="flex h-full" role="tablist">
        {ONGLETS.map((onglet, index) => {
          const estActif = ongletActif === onglet.id;
          return (
            <button
              key={onglet.id}
              type="button"
              role="tab"
              aria-selected={estActif}
              className={cn(
                "inline-flex h-full items-center gap-1.5 border-b-2 text-[13px] transition-colors duration-150 ease-in-out",
                index === 0 ? "pr-5" : "px-5",
                estActif
                  ? "border-accent font-medium text-deep"
                  : "border-transparent text-steel hover:text-deep",
              )}
              onClick={() => surChangerOnglet(onglet.id)}
            >
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                {onglet.icone}
              </span>
              {onglet.libelle}
            </button>
          );
        })}
      </div>
      {actions ? <div className="flex items-center">{actions}</div> : null}
    </div>
  );
}
