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
  /** Mapping mode id → contenu à afficher. */
  children: (currentModeId: string) => ReactNode;
  className?: string;
  /** Classes sur le conteneur du switcher. */
  switcherClassName?: string;
};

/**
 * Panneau d'aperçu générique avec switcher de modes.
 *
 * Réutilise `SegmentedControl` comme switcher visuel et `usePreviewModes`
 * pour la logique de state. Le contenu est rendu via render prop —
 * le parent décide quoi afficher pour chaque mode.
 *
 * Usage :
 * ```tsx
 * <PreviewPanel modes={modes} defaultModeId="sommaire">
 *   {(modeId) => modeId === "sommaire" ? <Sommaire /> : <Impression />}
 * </PreviewPanel>
 * ```
 */
export function PreviewPanel({
  modes,
  defaultModeId,
  onModeChange,
  children,
  className,
  switcherClassName,
}: PreviewPanelProps) {
  const { currentModeId, setMode } = usePreviewModes({
    modes,
    defaultModeId,
    onModeChange,
  });

  const segmentedOptions: SegmentedControlOption[] = modes.map((m) => ({
    value: m.id,
    label: m.label,
    icon: m.icon ? (
      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
        {m.icon}
      </span>
    ) : undefined,
  }));

  return (
    <div className={cn("flex flex-col", className)}>
      {modes.length > 1 ? (
        <div className={cn("flex justify-center py-2", switcherClassName)}>
          <SegmentedControl
            options={segmentedOptions}
            value={currentModeId}
            onChange={setMode}
            aria-label="Mode d'aperçu"
          />
        </div>
      ) : null}
      <div className="min-h-0 flex-1">{children(currentModeId)}</div>
    </div>
  );
}
