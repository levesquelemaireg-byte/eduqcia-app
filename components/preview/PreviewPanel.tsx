"use client";

import type { ReactNode } from "react";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui/SegmentedControl";
import { usePreviewModes } from "@/components/preview/usePreviewModes";
import type { PreviewMode } from "@/components/preview/types";
import { cn } from "@/lib/utils/cn";

type PreviewPanelProps = {
  modes: PreviewMode[];
  defaultModeId?: string;
  onModeChange?: (modeId: string) => void;
  /** Reçoit `(modeId, subModeId)` — `subModeId` est `null` si pas de sous-modes. */
  children: (currentModeId: string, currentSubModeId: string | null) => ReactNode;
  className?: string;
  /** Classes sur le conteneur du switcher flottant. */
  switcherClassName?: string;
};

function modeToSegmentedOption(m: PreviewMode): SegmentedControlOption {
  return {
    value: m.id,
    label: m.label,
    icon: m.icon ? (
      <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
        {m.icon}
      </span>
    ) : undefined,
  };
}

/**
 * Panneau d'aperçu générique avec modes et sous-modes optionnels.
 *
 * Niveau 1 : Sommaire / Aperçu impression (ou autre).
 * Niveau 2 : sous-modes du mode actif (ex. Dossier doc / Questionnaire).
 *
 * Les deux niveaux utilisent `SegmentedControl`. Le sous-switcher
 * n'apparaît que si le mode actif a des `subModes`.
 */
export function PreviewPanel({
  modes,
  defaultModeId,
  onModeChange,
  children,
  className,
  switcherClassName,
}: PreviewPanelProps) {
  const { currentModeId, setMode, currentSubModeId, currentSubModes, setSubMode } = usePreviewModes(
    {
      modes,
      defaultModeId,
      onModeChange,
    },
  );

  const primaryOptions = modes.map(modeToSegmentedOption);
  const subOptions = currentSubModes.map(modeToSegmentedOption);

  return (
    <div className={cn("flex flex-col", className)}>
      {modes.length > 1 ? (
        <div className={cn("flex flex-col items-center gap-2 py-2", switcherClassName)}>
          <SegmentedControl
            options={primaryOptions}
            value={currentModeId}
            onChange={setMode}
            aria-label="Mode d'aperçu"
          />
          {subOptions.length > 1 && currentSubModeId ? (
            <SegmentedControl
              options={subOptions}
              value={currentSubModeId}
              onChange={setSubMode}
              aria-label="Sous-mode d'aperçu"
            />
          ) : null}
        </div>
      ) : null}
      <div className="min-h-0 flex-1">{children(currentModeId, currentSubModeId)}</div>
    </div>
  );
}
