"use client";

import { useCallback, useMemo, useState } from "react";
import { useOiData } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import { isComportementSelectable } from "@/lib/tae/blueprint-helpers";
import { getMockTaeFicheForComportement } from "@/lib/fragment-playground/mocks";
import {
  PLAYGROUND_LOCAL_STORAGE_COMPORTEMENT_KEY,
  type PlaygroundDisplayContext,
  type PlaygroundViewMode,
} from "@/lib/fragment-playground/types";
import { playgroundFragmentsForContext } from "@/lib/fragment-playground/playground-fragment-catalog";
import { PlaygroundBehaviorSelector } from "@/components/playground/PlaygroundBehaviorSelector";
import { PlaygroundContextCanvas } from "@/components/playground/PlaygroundContextCanvas";
import { BLOC2_ERROR_OI_FETCH } from "@/lib/ui/ui-copy";

export function FragmentPlayground() {
  const { oiList, error } = useOiData();
  const [context, setContext] = useState<PlaygroundDisplayContext>("sommaire");
  const [overrideComportementId, setOverrideComportementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<PlaygroundViewMode>("full");
  const [debug, setDebug] = useState(false);
  const [fragmentPickByContext, setFragmentPickByContext] = useState<
    Partial<Record<PlaygroundDisplayContext, string>>
  >({});

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

  const fragmentOptions = useMemo(() => playgroundFragmentsForContext(context), [context]);

  const isolatedFragmentId = useMemo(() => {
    const pick = fragmentPickByContext[context];
    if (pick && fragmentOptions.some((f) => f.id === pick)) return pick;
    return fragmentOptions[0]?.id ?? "";
  }, [context, fragmentPickByContext, fragmentOptions]);

  const onIsolatedFragmentIdChange = useCallback(
    (id: string) => {
      setFragmentPickByContext((prev) => ({ ...prev, [context]: id }));
    },
    [context],
  );

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
        <p className="text-sm text-error" role="alert">
          {BLOC2_ERROR_OI_FETCH}
        </p>
      </div>
    );
  }

  if (!oiList) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-muted" role="status">
          Chargement du référentiel OI…
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <PlaygroundBehaviorSelector
        oiList={oiList}
        selectedId={effectiveComportementId}
        onSelect={setComportementPersist}
      />
      <PlaygroundContextCanvas
        context={context}
        onContextChange={setContext}
        mock={mock}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isolatedFragmentId={isolatedFragmentId}
        onIsolatedFragmentIdChange={onIsolatedFragmentIdChange}
        debug={debug}
        onDebugChange={setDebug}
      />
    </div>
  );
}
