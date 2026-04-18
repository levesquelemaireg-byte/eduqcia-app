"use client";

import { useState, useCallback } from "react";

/**
 * Hook pour copier l'URL courante dans le presse-papiers.
 * Retourne `copie: true` pendant 1.8s après la copie.
 */
export function useCopierLien() {
  const [copie, setCopie] = useState(false);

  const copierLien = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopie(true);
      setTimeout(() => setCopie(false), 1800);
    });
  }, []);

  return { copie, copierLien };
}
