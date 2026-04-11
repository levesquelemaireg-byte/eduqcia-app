"use client";

import type { ReactNode } from "react";
import { NR_ORDRE_TEMPLATE_LEGEND_GROUP_ARIA } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export type ConsigneTemplateCardProps = {
  body: ReactNode;
  footer: ReactNode;
  legend: ReactNode;
  infoNote: ReactNode;
  /** Si absent, pas de bloc « APERÇU » (ex. aperçu déjà dans la fiche sommaire). */
  preview?: ReactNode;
  className?: string;
};

/**
 * Noyau carte + légende + note + aperçu pour consignes ministérielles à zones éditables (parcours non rédactionnels).
 */
export function ConsigneTemplateCard({
  body,
  footer,
  legend,
  infoNote,
  preview,
  className,
}: ConsigneTemplateCardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="bg-panel px-4 py-4 sm:px-5">{body}</div>
        <div className="border-t border-border bg-panel-alt/50 px-4 py-2.5 text-xs leading-relaxed text-muted sm:px-5">
          {footer}
        </div>
      </div>
      <div
        className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-relaxed text-muted"
        role="group"
        aria-label={NR_ORDRE_TEMPLATE_LEGEND_GROUP_ARIA}
      >
        {legend}
      </div>
      <div className="flex gap-2.5 rounded-lg border border-border bg-panel px-3 py-3 text-sm text-deep sm:px-4">
        <span
          className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-muted"
          aria-hidden
        >
          info
        </span>
        <div className="min-w-0 leading-relaxed text-muted">{infoNote}</div>
      </div>
      {preview != null ? (
        <div className="rounded-lg border border-border bg-surface p-4">{preview}</div>
      ) : null}
    </div>
  );
}
