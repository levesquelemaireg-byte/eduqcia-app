"use client";

import { FicheTache } from "@/components/tae/FicheTache";
import { TaeCard } from "@/components/tae/TaeCard";
import { PrintableFicheFromTaeData } from "@/components/tae/TaeForm/preview/PrintableFichePreview";
import { PlaygroundFicheRenderer } from "@/components/playground/PlaygroundFicheRenderer";
import { PlaygroundPrintRenderer } from "@/components/playground/PlaygroundPrintRenderer";
import { PlaygroundTaeCardRenderer } from "@/components/playground/PlaygroundTaeCardRenderer";
import { PlaygroundFragmentWrapper } from "@/components/playground/PlaygroundFragmentWrapper";
import type { PlaygroundDisplayContext, PlaygroundViewMode } from "@/lib/fragment-playground/types";
import { PLAYGROUND_CONTEXT_ORDER } from "@/lib/fragment-playground/types";
import { playgroundFragmentsForContext } from "@/lib/fragment-playground/playground-fragment-catalog";
import type { TaeFicheData } from "@/lib/types/fiche";
import { cn } from "@/lib/utils/cn";
import debugStyles from "@/components/playground/playground-debug.module.css";

const TAB_LABELS: Record<PlaygroundDisplayContext, string> = {
  wizard: "Wizard",
  sommaire: "Sommaire",
  lecture: "Lecture",
  thumbnail: "Thumbnail",
  print: "Print",
};

type Props = {
  context: PlaygroundDisplayContext;
  onContextChange: (c: PlaygroundDisplayContext) => void;
  mock: TaeFicheData | null;
  viewMode: PlaygroundViewMode;
  onViewModeChange: (m: PlaygroundViewMode) => void;
  isolatedFragmentId: string;
  onIsolatedFragmentIdChange: (id: string) => void;
  debug: boolean;
  onDebugChange: (v: boolean) => void;
};

export function PlaygroundContextCanvas({
  context,
  onContextChange,
  mock,
  viewMode,
  onViewModeChange,
  isolatedFragmentId,
  onIsolatedFragmentIdChange,
  debug,
  onDebugChange,
}: Props) {
  const fragmentOptions = playgroundFragmentsForContext(context);
  const useFicheMirror =
    context === "sommaire" || context === "lecture"
      ? viewMode === "isolated" || debug
      : false;
  const useThumbnailMirror =
    context === "thumbnail" ? viewMode === "isolated" || debug : false;
  const usePrintMirror = context === "print" ? viewMode === "isolated" || debug : false;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <div className="flex shrink-0 flex-wrap gap-1 border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        {PLAYGROUND_CONTEXT_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onContextChange(id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              context === id
                ? "bg-violet-500 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/80">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Affichage
        </span>
        <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => onViewModeChange("full")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              viewMode === "full"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
            )}
          >
            Vue complète
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("isolated")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              viewMode === "isolated"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
            )}
          >
            Fragment isolé
          </button>
        </div>
        {viewMode === "isolated" && fragmentOptions.length > 0 ? (
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="sr-only">Fragment</span>
            <select
              value={isolatedFragmentId}
              onChange={(e) => onIsolatedFragmentIdChange(e.target.value)}
              className="max-w-[min(100%,20rem)] rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {fragmentOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto p-4 md:p-6",
          debugStyles.preview,
        )}
        data-playground-preview="true"
        data-debug={debug ? "true" : undefined}
      >
        <label
          className={cn(
            "pointer-events-auto absolute right-5 top-5 z-[80] flex items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white/90 px-2 py-1 text-[10px] font-medium text-zinc-500 shadow-sm backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-400",
            mock ? "" : "opacity-50",
          )}
        >
          <input
            type="checkbox"
            checked={debug}
            onChange={(e) => onDebugChange(e.target.checked)}
            className="h-3 w-3 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
            disabled={!mock}
          />
          Debug
        </label>
        {!mock ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Chargement du mock ou sélectionnez un comportement avec jeu de données playground.
          </p>
        ) : context === "wizard" ? (
          <div className="mx-auto max-w-2xl">
            {debug || viewMode === "isolated" ? (
              <PlaygroundFragmentWrapper name="WizardPlaceholder">
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-600 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Wizard (saisie)</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Phase 1 — emplacement réservé. Phase 2 : montage du formulaire réel ou storyboard
                    statique aligné sur les blocs du wizard.
                  </p>
                  <p className="mt-4 font-mono text-[11px] text-zinc-400">
                    Comportement sélectionné : {mock.comportement.id}
                  </p>
                </div>
              </PlaygroundFragmentWrapper>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-600 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Wizard (saisie)</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Phase 1 — emplacement réservé. Phase 2 : montage du formulaire réel ou storyboard
                  statique aligné sur les blocs du wizard.
                </p>
                <p className="mt-4 font-mono text-[11px] text-zinc-400">
                  Comportement sélectionné : {mock.comportement.id}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
            {debug && context === "print" ? (
              <div className={cn(debugStyles.pageBreakGuide)} aria-hidden="true">
                <span className={debugStyles.pageBreakLabel}>saut de page</span>
              </div>
            ) : null}

            <div
              className={cn(
                "w-full",
                viewMode === "isolated" && context !== "print"
                  ? "flex min-h-[min(70vh,36rem)] items-start justify-center py-8"
                  : "",
                viewMode === "isolated" && context === "print" ? "flex justify-center py-6" : "",
              )}
            >
              <div
                className={cn(
                  viewMode === "isolated" && context !== "print" ? "w-full max-w-3xl" : "w-full",
                  viewMode === "isolated" && context === "thumbnail" ? "max-w-xl" : "",
                )}
              >
                {context === "sommaire" ? (
                  useFicheMirror ? (
                    <PlaygroundFicheRenderer
                      tae={mock}
                      mode="sommaire"
                      viewMode={viewMode}
                      isolatedFragmentId={isolatedFragmentId}
                    />
                  ) : (
                    <FicheTache tae={mock} mode="sommaire" />
                  )
                ) : null}

                {context === "lecture" ? (
                  useFicheMirror ? (
                    <PlaygroundFicheRenderer
                      tae={mock}
                      mode="lecture"
                      viewMode={viewMode}
                      isolatedFragmentId={isolatedFragmentId}
                    />
                  ) : (
                    <FicheTache tae={mock} mode="lecture" />
                  )
                ) : null}

                {context === "thumbnail" ? (
                  useThumbnailMirror ? (
                    <PlaygroundTaeCardRenderer
                      tae={mock}
                      viewMode={viewMode}
                      isolatedFragmentId={isolatedFragmentId}
                    />
                  ) : (
                    <div className="max-w-xl">
                      <TaeCard tae={mock} />
                    </div>
                  )
                ) : null}

                {context === "print" ? (
                  <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                    {usePrintMirror ? (
                      <PlaygroundPrintRenderer
                        tae={mock}
                        viewMode={viewMode}
                        isolatedFragmentId={isolatedFragmentId}
                      />
                    ) : (
                      <PrintableFicheFromTaeData tae={mock} />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
