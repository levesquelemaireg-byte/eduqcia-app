"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Controls de navigation exposés par `CarrouselFeuillet` (interne au
 * `CarrouselApercu`) pour que la modale parente puisse rendre les boutons
 * prev/next dans son footer plutôt qu'à côté de l'image.
 */
export type CarrouselNavControls = {
  scrollPrev: () => void;
  scrollNext: () => void;
  indexPageGlobal: number;
  totalPagesGlobal: number;
  peutPrecedent: boolean;
  peutSuivant: boolean;
} | null;

type Ctx = {
  controls: CarrouselNavControls;
  setControls: (c: CarrouselNavControls) => void;
};

const CarrouselNavCtx = createContext<Ctx | null>(null);

export function CarrouselNavProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<CarrouselNavControls>(null);
  return (
    <CarrouselNavCtx.Provider value={{ controls, setControls }}>
      {children}
    </CarrouselNavCtx.Provider>
  );
}

/**
 * Lit / écrit les controls depuis le sous-composant carrousel.
 * Retourne `null` si appelé hors du Provider — le carrousel reste alors
 * rendable seul (sans modale englobante), mais la nav ne sera pas exposée.
 */
export function useCarrouselNav(): Ctx | null {
  return useContext(CarrouselNavCtx);
}
