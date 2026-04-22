"use client";

import { useMemo } from "react";
import { useOiData } from "@/components/tache/wizard/bloc2/useBloc2Data";
import { findOi, findComportement } from "@/lib/tache/blueprint-helpers";

type Props = { comportementId: string; nbDocuments: number | null };

export function ComportementBreadcrumb({ comportementId, nbDocuments }: Props) {
  const { oiList } = useOiData();

  const label = useMemo(() => {
    if (!oiList || !comportementId) return null;
    const oiId = `OI${comportementId.split(".")[0]}`;
    const oi = findOi(oiList, oiId);
    const c = findComportement(oi, comportementId);
    return c?.enonce ?? null;
  }, [oiList, comportementId]);

  if (!label) return null;
  const docLabel = nbDocuments === 1 ? "1 document" : `${nbDocuments} documents`;

  return (
    <p className="text-xs text-muted">
      {label} · {docLabel}
    </p>
  );
}
