"use client";

import { useCallback, useState } from "react";
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
};

/**
 * Hook de gestion des modes d'aperçu.
 *
 * Logique pure de switching — pas d'UI, pas de persistance.
 * Consommé par `PreviewPanel` ou directement quand le switcher
 * et le conteneur sont dans des endroits séparés du layout.
 */
export function usePreviewModes({
  modes,
  defaultModeId,
  onModeChange,
}: UsePreviewModesOptions): UsePreviewModesResult {
  const initialId = defaultModeId ?? modes[0]?.id ?? "";
  const [currentModeId, setCurrentModeId] = useState(initialId);

  const setMode = useCallback(
    (modeId: string) => {
      const exists = modes.some((m) => m.id === modeId && !m.disabled);
      if (!exists) return;
      setCurrentModeId(modeId);
      onModeChange?.(modeId);
    },
    [modes, onModeChange],
  );

  const currentMode = modes.find((m) => m.id === currentModeId) ?? modes[0];

  return { currentMode, currentModeId, setMode, modes };
}
