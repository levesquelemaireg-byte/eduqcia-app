"use client";

import { cn } from "@/lib/utils/cn";

export type OngletId = "sommaire" | "apercu-imprime";

type Props = {
  ongletActif: OngletId;
  surChangerOnglet: (onglet: OngletId) => void;
};

const ONGLETS: { id: OngletId; icone: string; libelle: string }[] = [
  { id: "sommaire", icone: "list", libelle: "Sommaire" },
  { id: "apercu-imprime", icone: "print", libelle: "Aperçu de l'imprimé" },
];

/**
 * Onglets Sommaire / Aperçu de l'imprimé — partagés par les 3 entités.
 */
export function Onglets({ ongletActif, surChangerOnglet }: Props) {
  return (
    <div className="flex border-b border-border" role="tablist">
      {ONGLETS.map((onglet) => {
        const estActif = ongletActif === onglet.id;
        return (
          <button
            key={onglet.id}
            type="button"
            role="tab"
            aria-selected={estActif}
            className={cn(
              "mr-5 inline-flex items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-sm transition-colors",
              estActif
                ? "border-deep font-medium text-deep"
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
  );
}
