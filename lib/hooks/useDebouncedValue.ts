"use client";

import { useEffect, useState } from "react";

/** Valeur retardée — utile pour limiter le travail sur saisie rapide (sommaires, aperçus). */
export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
