"use client";

import { useEffect, useRef } from "react";

/** Titre minimal pour l’en-tête optionnel Chrome/Edge (« En-têtes et pieds de page »). */
const PRINT_PLACEHOLDER_TITLE = "\u200B";

/**
 * Pendant la boîte d’impression, remplace brièvement `document.title` pour atténuer la ligne « titre »
 * dans le bandeau navigateur. **Ne supprime pas** date, URL ni pagination — seul le décochage
 * « En-têtes et pieds de page » le permet (non pilotable par CSS).
 */
export function useClearDocumentTitleForPrint(enabled: boolean) {
  const savedTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const restore = () => {
      if (savedTitleRef.current != null) {
        document.title = savedTitleRef.current;
        savedTitleRef.current = null;
      }
    };

    const onBeforePrint = () => {
      savedTitleRef.current = document.title;
      document.title = PRINT_PLACEHOLDER_TITLE;
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", restore);
      restore();
    };
  }, [enabled]);
}
