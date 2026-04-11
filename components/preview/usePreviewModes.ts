"use client";

import { useCallback, useMemo, useState } from "react";
import type { PreviewMode } from "@/components/preview/types";

type UsePreviewModesOptions = {
  modes: PreviewMode[];
  defaultModeId?: string;
  onModeChange?: (modeId: string) => void;
};

type UsePreviewModesResult = {
  currentMode: PreviewMode;
  currentModeId: string;
  setMode: (modeId: string) => void;
  modes: PreviewMode[];
  /** Sous-mode actif (si le mode courant a des `subModes`). */
  currentSubModeId: string | null;
  /** Sous-modes du mode courant (vide si aucun). */
  currentSubModes: PreviewMode[];
  setSubMode: (subModeId: string) => void;
};

/**
 * Hook de gestion des modes d'aperçu avec sous-modes optionnels.
 *
 * Quand le mode parent change, le sous-mode est réinitialisé au premier
 * sous-mode du nouveau mode (ou `null` s'il n'en a pas).
 */
export function usePreviewModes({
  modes,
  defaultModeId,
  onModeChange,
}: UsePreviewModesOptions): UsePreviewModesResult {
  const initialId = defaultModeId ?? modes[0]?.id ?? "";
  const [currentModeId, setCurrentModeId] = useState(initialId);
  const [currentSubModeId, setCurrentSubModeId] = useState<string | null>(() => {
    const initial = modes.find((m) => m.id === initialId);
    return initial?.subModes?.[0]?.id ?? null;
  });

  const currentMode = modes.find((m) => m.id === currentModeId) ?? modes[0];
  const currentSubModes = useMemo(() => currentMode?.subModes ?? [], [currentMode]);

  const setMode = useCallback(
    (modeId: string) => {
      const target = modes.find((m) => m.id === modeId && !m.disabled);
      if (!target) return;
      setCurrentModeId(modeId);
      setCurrentSubModeId(target.subModes?.[0]?.id ?? null);
      onModeChange?.(modeId);
    },
    [modes, onModeChange],
  );

  const setSubMode = useCallback(
    (subModeId: string) => {
      const exists = currentSubModes.some((m) => m.id === subModeId && !m.disabled);
      if (!exists) return;
      setCurrentSubModeId(subModeId);
    },
    [currentSubModes],
  );

  return {
    currentMode,
    currentModeId,
    setMode,
    modes,
    currentSubModeId,
    currentSubModes,
    setSubMode,
  };
}
