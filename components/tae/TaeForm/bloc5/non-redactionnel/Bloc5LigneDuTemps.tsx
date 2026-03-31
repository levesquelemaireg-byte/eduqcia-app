"use client";

import type { Bloc5Props } from "@/lib/tae/tae-form-state-types";
import {
  BLOC5_NON_REDACTIONNEL_PLACEHOLDER_MESSAGE,
  BLOC5_NON_REDACTIONNEL_PLACEHOLDER_TITRE,
} from "@/lib/ui/ui-copy";

export default function Bloc5LigneDuTemps(_props: Bloc5Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-deep">{BLOC5_NON_REDACTIONNEL_PLACEHOLDER_TITRE}</p>
      <p className="text-sm leading-relaxed text-muted">
        {BLOC5_NON_REDACTIONNEL_PLACEHOLDER_MESSAGE}
      </p>
    </div>
  );
}
