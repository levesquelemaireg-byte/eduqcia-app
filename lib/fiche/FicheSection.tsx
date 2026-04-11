"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { cn } from "@/lib/utils/cn";

type Props = {
  isActive: boolean;
  sectionId: string;
  children: ReactNode;
};

/**
 * Wrapper section fiche — highlight du bloc actif + error boundary.
 * `data-section` pour scroll-to et debug.
 */
export function FicheSection({ isActive, sectionId, children }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div data-section={sectionId} className="px-5 py-4 text-xs text-error">
          Erreur d&apos;affichage de la section « {sectionId} ».
        </div>
      }
    >
      <div
        data-section={sectionId}
        className={cn("transition-colors duration-200", isActive && "bg-accent/[0.04]")}
      >
        {children}
      </div>
    </ErrorBoundary>
  );
}
