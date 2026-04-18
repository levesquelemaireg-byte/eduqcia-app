"use client";

import { useCallback, useMemo, useState } from "react";
import type { PreviewMode } from "@/components/preview/types";

type UsePreviewModesOptions = {
  modes: PreviewMode[];
  defaultModeId?: string;
  initialSubModeId?: string;
  initialSubSubModeId?: string;
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
  /** Sous-sous-mode actif (si le sous-mode courant a des `subModes`). */
  currentSubSubModeId: string | null;
  /** Sous-sous-modes du sous-mode courant (vide si aucun). */
  currentSubSubModes: PreviewMode[];
  setSubSubMode: (subSubModeId: string) => void;
};

function modeActifParId(
  modes: PreviewMode[] | undefined,
  modeId: string | null,
): PreviewMode | null {
  if (!modes || !modeId) return null;
  return modes.find((mode) => mode.id === modeId && !mode.disabled) ?? null;
}

function premierModeActif(modes: PreviewMode[] | undefined): PreviewMode | null {
  if (!modes || modes.length === 0) return null;
  return modes.find((mode) => !mode.disabled) ?? null;
}

function premierIdActif(modes: PreviewMode[] | undefined): string | null {
  return premierModeActif(modes)?.id ?? null;
}

function resoudreSousModeId(mode: PreviewMode | null, modeIdPrefere: string | null): string | null {
  if (!mode) return null;
  return modeActifParId(mode.subModes, modeIdPrefere)?.id ?? premierIdActif(mode.subModes);
}

function resoudreSousSousModeId(
  subMode: PreviewMode | null,
  modeIdPrefere: string | null,
): string | null {
  if (!subMode) return null;
  return modeActifParId(subMode.subModes, modeIdPrefere)?.id ?? premierIdActif(subMode.subModes);
}

function cleSousSousMode(modeId: string, subModeId: string): string {
  return `${modeId}::${subModeId}`;
}

/**
 * Hook de gestion des modes d'aperçu avec sous-modes optionnels.
 *
 * Le hook mémorise les sélections secondaires par mode principal afin de
 * restaurer automatiquement le dernier choix quand on repasse d'un mode à l'autre.
 */
export function usePreviewModes({
  modes,
  defaultModeId,
  initialSubModeId,
  initialSubSubModeId,
  onModeChange,
}: UsePreviewModesOptions): UsePreviewModesResult {
  const modeInitial =
    modeActifParId(modes, defaultModeId ?? null) ??
    premierModeActif(modes) ??
    modes[0] ??
    ({ id: "", label: "" } as PreviewMode);

  const [currentModeId, setCurrentModeId] = useState(modeInitial.id);
  const [subModeByModeId, setSubModeByModeId] = useState<Record<string, string | null>>(() => {
    const initialMap: Record<string, string | null> = {};
    for (const mode of modes) {
      initialMap[mode.id] = null;
    }
    initialMap[modeInitial.id] = resoudreSousModeId(modeInitial, initialSubModeId ?? null);
    return initialMap;
  });

  const [subSubModeByKey, setSubSubModeByKey] = useState<Record<string, string | null>>(() => {
    const initialMap: Record<string, string | null> = {};
    const subModeId = resoudreSousModeId(modeInitial, initialSubModeId ?? null);
    if (!subModeId) {
      return initialMap;
    }

    const subMode = modeActifParId(modeInitial.subModes, subModeId);
    if (!subMode) {
      return initialMap;
    }

    initialMap[cleSousSousMode(modeInitial.id, subModeId)] = resoudreSousSousModeId(
      subMode,
      initialSubSubModeId ?? null,
    );
    return initialMap;
  });

  const currentMode = useMemo(
    () =>
      modeActifParId(modes, currentModeId) ??
      premierModeActif(modes) ??
      modes[0] ??
      ({ id: "", label: "" } as PreviewMode),
    [currentModeId, modes],
  );

  const currentSubModes = useMemo(() => currentMode?.subModes ?? [], [currentMode]);

  const currentSubModeId = useMemo(() => {
    if (!currentMode) return null;
    const modeIdMemorise = subModeByModeId[currentMode.id] ?? null;
    return resoudreSousModeId(currentMode, modeIdMemorise);
  }, [currentMode, subModeByModeId]);

  const currentSubMode = useMemo(
    () => modeActifParId(currentSubModes, currentSubModeId),
    [currentSubModeId, currentSubModes],
  );

  const currentSubSubModes = useMemo(() => currentSubMode?.subModes ?? [], [currentSubMode]);

  const currentSubSubModeId = useMemo(() => {
    if (!currentMode || !currentSubMode || !currentSubModeId) return null;
    const key = cleSousSousMode(currentMode.id, currentSubModeId);
    const modeIdMemorise = subSubModeByKey[key] ?? null;
    return resoudreSousSousModeId(currentSubMode, modeIdMemorise);
  }, [currentMode, currentSubMode, currentSubModeId, subSubModeByKey]);

  const setMode = useCallback(
    (modeId: string) => {
      const target = modeActifParId(modes, modeId);
      if (!target) return;

      setCurrentModeId(modeId);

      const prochainSubId = resoudreSousModeId(target, subModeByModeId[modeId] ?? null);
      setSubModeByModeId((previous) => {
        if ((previous[modeId] ?? null) === prochainSubId) {
          return previous;
        }
        return { ...previous, [modeId]: prochainSubId };
      });

      if (prochainSubId) {
        const prochainSub = modeActifParId(target.subModes, prochainSubId);
        const key = cleSousSousMode(modeId, prochainSubId);
        const prochainSubSubId = resoudreSousSousModeId(prochainSub, subSubModeByKey[key] ?? null);
        setSubSubModeByKey((previous) => {
          if ((previous[key] ?? null) === prochainSubSubId) {
            return previous;
          }
          return { ...previous, [key]: prochainSubSubId };
        });
      }

      onModeChange?.(modeId);
    },
    [modes, onModeChange, subModeByModeId, subSubModeByKey],
  );

  const setSubMode = useCallback(
    (subModeId: string) => {
      if (!currentMode) return;

      const prochainSub = modeActifParId(currentSubModes, subModeId);
      if (!prochainSub) return;

      setSubModeByModeId((previous) => {
        if ((previous[currentMode.id] ?? null) === subModeId) {
          return previous;
        }
        return { ...previous, [currentMode.id]: subModeId };
      });

      const key = cleSousSousMode(currentMode.id, subModeId);
      const prochainSubSubId = resoudreSousSousModeId(prochainSub, subSubModeByKey[key] ?? null);
      setSubSubModeByKey((previous) => {
        if ((previous[key] ?? null) === prochainSubSubId) {
          return previous;
        }
        return { ...previous, [key]: prochainSubSubId };
      });
    },
    [currentMode, currentSubModes, subSubModeByKey],
  );

  const setSubSubMode = useCallback(
    (subSubModeId: string) => {
      const exists = currentSubSubModes.some((mode) => mode.id === subSubModeId && !mode.disabled);
      if (!exists || !currentMode || !currentSubModeId) return;

      const key = cleSousSousMode(currentMode.id, currentSubModeId);
      setSubSubModeByKey((previous) => {
        if ((previous[key] ?? null) === subSubModeId) {
          return previous;
        }
        return { ...previous, [key]: subSubModeId };
      });
    },
    [currentMode, currentSubModeId, currentSubSubModes],
  );

  return {
    currentMode,
    currentModeId: currentMode.id,
    setMode,
    modes,
    currentSubModeId: currentSubMode?.id ?? null,
    currentSubModes,
    setSubMode,
    currentSubSubModeId: currentSubSubModeId ?? null,
    currentSubSubModes,
    setSubSubMode,
  };
}
