"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import {
  BLOC1_COLLAB_SEARCH_ALREADY_ADDED,
  BLOC1_COLLAB_SEARCH_EMPTY,
  BLOC1_COLLAB_SEARCH_LOADING,
  BLOC1_COLLAB_SEARCH_MIN_CHARS,
  BLOC1_COLLAB_SEARCH_PICK_FROM_LIST,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";
import { getDisplayName } from "@/lib/utils/profile-display";
import type { CollaborateurProfileSearchRow } from "@/lib/queries/collaborateur-profile-search";
import { useWizardSession } from "@/components/tache/wizard/WizardSessionContext";
import { useCollaborateurProfileSearch } from "@/components/tache/wizard/useCollaborateurProfileSearch";

const DEBOUNCE_MS = 300;

type Props = {
  /** Rattachement au `<label>` du Bloc 1 (`docs/DESIGN-SYSTEM.md` — formulaires). */
  fieldId: string;
  /** `conception.collaborateurs[].id` — empêcher les doublons. */
  excludeIds: ReadonlySet<string>;
  onPick: (row: CollaborateurProfileSearchRow) => void;
};

function formatProfileSubline(row: CollaborateurProfileSearchRow): string {
  return row.email.trim();
}

export function CollaborateurSearchField({ fieldId, excludeIds, onPick }: Props) {
  const { currentUserId } = useWizardSession();
  const listId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchEnabled = Boolean(currentUserId);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(draft.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [draft]);

  const { rows, pending } = useCollaborateurProfileSearch(debounced, searchEnabled);

  const visibleRows = useMemo(() => rows.filter((r) => !excludeIds.has(r.id)), [rows, excludeIds]);

  const activeIdx =
    visibleRows.length === 0
      ? -1
      : activeIndex < 0
        ? -1
        : Math.min(activeIndex, visibleRows.length - 1);

  const pickRow = useCallback(
    (row: CollaborateurProfileSearchRow | undefined) => {
      if (!row) {
        toast.message(BLOC1_COLLAB_SEARCH_PICK_FROM_LIST);
        return;
      }
      if (excludeIds.has(row.id)) {
        toast.message(BLOC1_COLLAB_SEARCH_ALREADY_ADDED);
        return;
      }
      onPick(row);
      setDraft("");
      setDebounced("");
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [excludeIds, onPick],
  );

  const handleSelectClick = useCallback(() => {
    if (visibleRows.length === 1) {
      pickRow(visibleRows[0]);
      return;
    }
    if (activeIdx >= 0 && activeIdx < visibleRows.length) {
      pickRow(visibleRows[activeIdx]);
      return;
    }
    toast.message(BLOC1_COLLAB_SEARCH_PICK_FROM_LIST);
  }, [activeIdx, pickRow, visibleRows]);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (visibleRows.length === 0) return;
      setActiveIndex((i) => {
        const base = i < 0 ? -1 : Math.min(i, visibleRows.length - 1);
        return base < 0 ? 0 : (base + 1) % visibleRows.length;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (visibleRows.length === 0) return;
      setActiveIndex((i) => {
        if (i < 0) return visibleRows.length - 1;
        const base = Math.min(i, visibleRows.length - 1);
        return base <= 0 ? visibleRows.length - 1 : base - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectClick();
    }
  };

  const showHintMinChars = searchEnabled && draft.trim().length > 0 && draft.trim().length < 2;
  const showList = searchEnabled && debounced.length >= 2 && !pending;
  const showEmpty = showList && visibleRows.length === 0 && !pending && debounced.length >= 2;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div className="min-w-0 flex-1">
          <input
            id={fieldId}
            ref={inputRef}
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Nom, courriel ou établissement…"
            autoComplete="off"
            disabled={!searchEnabled}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={
              activeIdx >= 0 && visibleRows[activeIdx]
                ? `${listId}-opt-${visibleRows[activeIdx].id}`
                : undefined
            }
            className="auth-input min-h-11 w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-deep shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          onClick={handleSelectClick}
          disabled={!searchEnabled}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[9rem]"
        >
          Sélectionner
        </button>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite">
        {pending ? BLOC1_COLLAB_SEARCH_LOADING : ""}
      </p>

      {showHintMinChars ? (
        <p className="text-xs leading-relaxed text-muted sm:text-sm">
          {BLOC1_COLLAB_SEARCH_MIN_CHARS}
        </p>
      ) : null}

      {pending && debounced.length >= 2 ? (
        <p className="text-xs text-muted sm:text-sm" aria-busy="true">
          {BLOC1_COLLAB_SEARCH_LOADING}
        </p>
      ) : null}

      {showEmpty ? (
        <p className="text-xs text-muted sm:text-sm">{BLOC1_COLLAB_SEARCH_EMPTY}</p>
      ) : null}

      {showList && visibleRows.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="max-h-52 overflow-y-auto rounded-lg border border-border bg-panel shadow-sm"
        >
          {visibleRows.map((row, idx) => (
            <li key={row.id} role="presentation">
              <button
                type="button"
                role="option"
                id={`${listId}-opt-${row.id}`}
                aria-selected={idx === activeIdx}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left text-sm last:border-b-0",
                  idx === activeIdx ? "bg-panel-alt" : "hover:bg-panel-alt/80",
                )}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => pickRow(row)}
              >
                <span className="font-medium text-deep">
                  {getDisplayName(row.first_name, row.last_name)}
                </span>
                <span className="text-xs text-muted">{formatProfileSubline(row)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
