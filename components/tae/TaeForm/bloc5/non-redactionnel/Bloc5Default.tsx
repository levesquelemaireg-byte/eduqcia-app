"use client";

import type { Bloc5Props } from "@/lib/tae/tae-form-state-types";
import { BLOC5_COMPORTEMENT_INCONNU } from "@/lib/ui/ui-copy";

export default function Bloc5Default(_props: Bloc5Props) {
  return (
    <p className="text-sm leading-relaxed text-muted" role="status">
      {BLOC5_COMPORTEMENT_INCONNU}
    </p>
  );
}
