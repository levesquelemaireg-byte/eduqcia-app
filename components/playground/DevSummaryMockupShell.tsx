"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DevBankSummaryMockupCard } from "@/components/playground/DevBankSummaryMockupCard";
import { DevBankThumbnailMockupCard } from "@/components/playground/DevBankThumbnailMockupCard";
import { PlaygroundBehaviorSelector } from "@/components/playground/PlaygroundBehaviorSelector";
import { useOiData } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { isComportementSelectable } from "@/lib/tae/blueprint-helpers";
import { getMockTaeFicheForComportement } from "@/lib/fragment-playground/mocks";
import { PLAYGROUND_LOCAL_STORAGE_COMPORTEMENT_KEY } from "@/lib/fragment-playground/types";
import { BLOC2_ERROR_OI_FETCH } from "@/lib/ui/ui-copy";

const DEV_SUMMARY_MOCKUP_VIEW_KEY = "eduqcia-dev-summary-mockup-view";

type SummaryMockupView = "thumbnail" | "full";

function readStoredView(): SummaryMockupView {
  if (typeof window === "undefined") return "thumbnail";
  try {
    const v = localStorage.getItem(DEV_SUMMARY_MOCKUP_VIEW_KEY);
    if (v === "full" || v === "thumbnail") return v;
  } catch {
    /* ignore */
  }
  return "thumbnail";
}

/** Page DEV — maquettes banque (miniature + fiche sommaire) ; mêmes mocks que `/dev/fragments`. */
export function DevSummaryMockupShell() {
  const { oiList, error } = useOiData();
  const [overrideComportementId, setOverrideComportementId] = useState<string | null>(null);
  const [view, setView] = useState<SummaryMockupView>("thumbnail");

  useEffect(() => {
    setView(readStoredView());
  }, []);

  const firstSelectableWithMock = useMemo(() => {
    if (!oiList) return null;
    for (const oi of oiList) {
      for (const c of oi.comportements_attendus) {
        if (!isComportementSelectable(c)) continue;
        if (getMockTaeFicheForComportement(c.id)) return c.id;
      }
    }
    return null;
  }, [oiList]);

  const defaultComportementId = useMemo(() => {
    if (!oiList || firstSelectableWithMock === null) return null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(PLAYGROUND_LOCAL_STORAGE_COMPORTEMENT_KEY);
        if (raw && getMockTaeFicheForComportement(raw)) return raw;
      } catch {
        /* storage indisponible */
      }
    }
    return firstSelectableWithMock;
  }, [oiList, firstSelectableWithMock]);

  const effectiveComportementId = overrideComportementId ?? defaultComportementId;

  const setComportementPersist = useCallback((id: string) => {
    setOverrideComportementId(id);
    try {
      localStorage.setItem(PLAYGROUND_LOCAL_STORAGE_COMPORTEMENT_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const mock = effectiveComportementId
    ? getMockTaeFicheForComportement(effectiveComportementId)
    : null;

  const setViewPersist = useCallback((next: SummaryMockupView) => {
    setView(next);
    try {
      localStorage.setItem(DEV_SUMMARY_MOCKUP_VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
        <p className="text-sm text-error" role="alert">
          {BLOC2_ERROR_OI_FETCH}
        </p>
      </div>
    );
  }

  if (!oiList) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-muted" role="status">
          Chargement du référentiel OI…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <PlaygroundBehaviorSelector
        oiList={oiList}
        selectedId={effectiveComportementId}
        onSelect={setComportementPersist}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Maquette — banque collaborative (DEV)
              </h1>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                Miniature (liste) et fiche sommaire complète —{" "}
                <span className="font-mono">TaeFicheData</span> via{" "}
                <span className="font-mono">mocks.ts</span> +{" "}
                <span className="font-mono">oi.json</span>.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <SegmentedControl
                aria-label="Type de maquette affichée"
                options={[
                  { value: "thumbnail", label: "Miniature banque" },
                  { value: "full", label: "Fiche sommaire" },
                ]}
                value={view}
                onChange={(v) => setViewPersist(v as SummaryMockupView)}
              />
              <Link
                href="/dev/fragments"
                className="text-xs font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
              >
                Fragment Playground
              </Link>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {mock ? (
            view === "thumbnail" ? (
              <DevBankThumbnailMockupCard tae={mock} />
            ) : (
              <DevBankSummaryMockupCard tae={mock} />
            )
          ) : (
            <p className="text-sm text-muted">Aucun mock pour ce comportement.</p>
          )}
        </div>
      </div>
    </div>
  );
}
