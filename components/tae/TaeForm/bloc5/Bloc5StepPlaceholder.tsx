"use client";

import { BLOC5_DESCRIPTION, BLOC5_TITRE } from "@/lib/ui/ui-copy";

/** Remplacé par `Bloc5` (todo B). */
export function Bloc5StepPlaceholder() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-deep">{BLOC5_TITRE}</p>
      <p className="text-sm leading-relaxed text-muted">{BLOC5_DESCRIPTION}</p>
    </div>
  );
}
