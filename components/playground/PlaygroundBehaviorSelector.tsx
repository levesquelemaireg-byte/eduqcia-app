"use client";

import type { OiEntryJson, ComportementAttenduJson } from "@/lib/types/oi";
import { isComportementSelectable } from "@/lib/tae/blueprint-helpers";
import { getMockTaeFicheForComportement } from "@/lib/fragment-playground/mocks";
import { BLOC2_OI_COMING_SOON } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  oiList: OiEntryJson[];
  selectedId: string | null;
  onSelect: (comportementId: string) => void;
};

function comportementRowDisabled(c: ComportementAttenduJson): boolean {
  if (!isComportementSelectable(c)) return true;
  return getMockTaeFicheForComportement(c.id) === null;
}

export function PlaygroundBehaviorSelector({ oiList, selectedId, onSelect }: Props) {
  return (
    <aside className="flex w-[22rem] shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Comportement attendu
        </h2>
        <p className="mt-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
          Source <span className="font-mono">/data/oi.json</span> — mocks{" "}
          <span className="font-mono">TaeFicheData</span>.
        </p>
      </div>
      <nav
        className="flex-1 overflow-y-auto px-2 py-3"
        aria-label="Comportements par opération intellectuelle"
      >
        {oiList.map((oi) => (
          <div key={oi.id} className="mb-4">
            <div className="flex flex-wrap items-center gap-2 px-2 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {oi.titre}
              </p>
              {oi.status === "coming_soon" ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {BLOC2_OI_COMING_SOON}
                </span>
              ) : null}
            </div>
            <ul className="space-y-0.5">
              {oi.comportements_attendus.map((c) => {
                const disabled = comportementRowDisabled(c);
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "w-full rounded-lg px-2 py-2 text-left text-xs transition-colors",
                        disabled
                          ? "cursor-not-allowed opacity-60"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        active && !disabled
                          ? "bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-200"
                          : "text-zinc-700 dark:text-zinc-300",
                      )}
                    >
                      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                        {c.id}
                      </span>
                      <span className="mt-0.5 block leading-snug">{c.enonce}</span>
                      {!isComportementSelectable(c) ? (
                        <span className="mt-1 inline-block rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                          {BLOC2_OI_COMING_SOON}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
