"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Contexte partagé entre le formulaire wizard (panneau gauche) et le sommaire
 * détaillé (panneau droit) — identifie le champ actuellement focus pour que
 * l'élément correspondant du sommaire pulse (§2.10.6).
 *
 * Clés canoniques (voir tableau §2.10.6) :
 *   structure · type · titre · contenu · image · image_legende ·
 *   source_citation · source_type · categorie · repere_temporel ·
 *   niveaux · disciplines · aspects_societe · connaissances
 */
export type ActiveFieldKey = string;

type ActiveFieldContextValue = {
  activeField: ActiveFieldKey | null;
  setActiveField: (field: ActiveFieldKey | null) => void;
  /** Handlers focus/blur prêts à poser sur un conteneur (via *Capture). */
  focusHandlers: (field: ActiveFieldKey) => {
    onFocusCapture: () => void;
    onBlurCapture: () => void;
  };
};

const ActiveFieldContext = createContext<ActiveFieldContextValue | null>(null);

export function ActiveFieldProvider({ children }: { children: ReactNode }) {
  const [activeField, setActiveFieldState] = useState<ActiveFieldKey | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setActiveField = useCallback((field: ActiveFieldKey | null) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (field === null) {
      // Petit délai avant reset — évite le clignotement lors du Tab entre deux champs.
      timeoutRef.current = setTimeout(() => setActiveFieldState(null), 80);
    } else {
      setActiveFieldState(field);
    }
  }, []);

  const focusHandlers = useCallback(
    (field: ActiveFieldKey) => ({
      onFocusCapture: () => setActiveField(field),
      onBlurCapture: () => setActiveField(null),
    }),
    [setActiveField],
  );

  const value = useMemo(
    () => ({ activeField, setActiveField, focusHandlers }),
    [activeField, setActiveField, focusHandlers],
  );

  return <ActiveFieldContext.Provider value={value}>{children}</ActiveFieldContext.Provider>;
}

/** Accès au state — `null` si appelé hors provider (pas d'erreur, dégradation silencieuse). */
export function useActiveField() {
  return useContext(ActiveFieldContext);
}

/** Raccourci : `true` si la clé passée correspond au champ en focus. */
export function useIsFieldActive(field: ActiveFieldKey | null | undefined): boolean {
  const ctx = useContext(ActiveFieldContext);
  if (!ctx || !field) return false;
  return ctx.activeField === field;
}

/** Raccourci : handlers focus/blur prêts à poser sur un wrapper. */
export function useFieldFocusHandlers(field: ActiveFieldKey) {
  const ctx = useContext(ActiveFieldContext);
  return useMemo(() => {
    if (!ctx) return { onFocusCapture: undefined, onBlurCapture: undefined };
    return ctx.focusHandlers(field);
  }, [ctx, field]);
}
