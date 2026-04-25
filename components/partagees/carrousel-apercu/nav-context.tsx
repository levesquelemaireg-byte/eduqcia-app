"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

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

/*
 * Deux Contexts séparés pour éviter une boucle de re-render :
 * - Un objet Context unique `{ controls, setControls }` aurait sa référence
 *   qui change à chaque mise à jour de `controls`, ce qui invaliderait les
 *   dépendances de tout `useEffect` qui consomme le Context — y compris
 *   celui qui appelle `setControls`. Boucle infinie.
 * - En séparant lecture et écriture, le `setControls` est stable
 *   (`useCallback` sans dépendance) et ne change jamais. Le `useEffect`
 *   qui l'utilise ne re-tire pas. Seul le footer (lecteur des controls)
 *   re-render quand les controls changent — c'est exactement ce qu'on veut.
 */
const ControlsCtx = createContext<CarrouselNavControls>(null);
const SetControlsCtx = createContext<(c: CarrouselNavControls) => void>(() => {});

export function CarrouselNavProvider({ children }: { children: ReactNode }) {
  const [controls, setControlsState] = useState<CarrouselNavControls>(null);
  const setControls = useCallback((c: CarrouselNavControls) => {
    setControlsState(c);
  }, []);

  return (
    <SetControlsCtx.Provider value={setControls}>
      <ControlsCtx.Provider value={controls}>{children}</ControlsCtx.Provider>
    </SetControlsCtx.Provider>
  );
}

/** Lit les controls — déclenche un re-render quand ils changent. */
export function useCarrouselNavControls(): CarrouselNavControls {
  return useContext(ControlsCtx);
}

/**
 * Récupère le setter — référence stable, ne déclenche jamais de re-render.
 * Sans Provider englobant, retourne un no-op (le carrousel reste rendable
 * seul ; la nav ne sera simplement pas exposée).
 */
export function useCarrouselNavSetter(): (c: CarrouselNavControls) => void {
  return useContext(SetControlsCtx);
}
