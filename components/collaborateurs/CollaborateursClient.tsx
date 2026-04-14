"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CollaborateurCard } from "@/components/collaborateurs/CollaborateurCard";
import { pluralize } from "@/lib/utils/pluralize";
import type { CollaborateurListRow } from "@/lib/queries/collaborateurs-list";

type Props = {
  currentUserId: string;
  initialItems: CollaborateurListRow[];
  initialTotal: number;
};

export function CollaborateursClient({ currentUserId, initialItems, initialTotal }: Props) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isSearchMode = query.trim().length > 0;
  const remaining = total - items.length;

  // Recherche hybride : filtre local + server sync
  useEffect(() => {
    if (!isSearchMode) {
      // Reset vers les données initiales
      setItems(initialItems);
      setTotal(initialTotal);
      setIsSyncing(false);
      return;
    }

    // Filtre local instantané
    const term = query.toLowerCase();
    const localFiltered = initialItems.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.cssName ?? "").toLowerCase().includes(term),
    );
    setItems(localFiltered);

    // Server sync avec debounce
    setIsSyncing(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/collaborateurs/search?q=${encodeURIComponent(query.trim())}&userId=${currentUserId}`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
          if (liveRef.current) {
            liveRef.current.textContent = `${data.total} ${pluralize(data.total, "résultat trouvé", "résultats trouvés")} pour « ${query.trim()} »`;
          }
        }
      } catch {
        // AbortError — ignoré
      } finally {
        setIsSyncing(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, currentUserId, initialItems, initialTotal, isSearchMode]);

  // Scroll infini — Intersection Observer (désactivé en mode recherche)
  const loadMore = useCallback(async () => {
    if (isSearchMode || remaining <= 0 || loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await fetch(
        `/api/collaborateurs/search?q=&userId=${currentUserId}&offset=${items.length}`,
      );
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [...prev, ...data.items]);
        if (liveRef.current) {
          liveRef.current.textContent = `${data.items.length} nouveaux résultats chargés`;
        }
      }
    } catch {
      // Network error
    } finally {
      setLoadingMore(false);
    }
  }, [isSearchMode, remaining, loadingMore, currentUserId, items.length]);

  useEffect(() => {
    if (isSearchMode || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isSearchMode, loadMore]);

  return (
    <div>
      {/* Titre et sous-titre */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
          Enseignants collaborateurs
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isSearchMode
            ? `${total} ${pluralize(total, "résultat trouvé", "résultats trouvés")} pour « ${query.trim()} »`
            : `${total} ${pluralize(total, "enseignant inscrit", "enseignants inscrits")} sur la plateforme`}
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <span className="material-symbols-outlined text-[20px] text-muted" aria-hidden="true">
            search
          </span>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un enseignant…"
          className="auth-input w-full rounded-xl border border-border bg-panel py-3 pr-4 pl-10 text-sm text-deep shadow-sm"
          aria-label="Rechercher un enseignant"
        />
      </div>

      {isSyncing && <p className="mb-3 text-xs text-muted">Mise à jour des résultats…</p>}

      <div aria-live="polite" ref={liveRef} className="sr-only" />

      {/* Grille de cartes */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((c) => (
            <CollaborateurCard
              key={c.id}
              id={c.id}
              firstName={c.firstName}
              lastName={c.lastName}
              email={c.email}
              role={c.role}
              cssName={c.cssName}
              docCount={c.docCount}
              taskCount={c.taskCount}
              evalCount={c.evalCount}
              disciplines={c.disciplines}
              niveaux={c.niveaux}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          {isSearchMode ? (
            <>
              <p className="text-base font-medium text-deep">
                Aucun enseignant trouvé pour « {query.trim()} ».
              </p>
              <p className="mt-1 text-sm text-muted">
                Vérifiez l&apos;orthographe ou essayez un autre terme.
              </p>
            </>
          ) : (
            <p className="text-base font-medium text-deep">
              Aucun collaborateur inscrit pour le moment.
            </p>
          )}
        </div>
      )}

      {/* Scroll infini sentinelle + bouton "Voir plus" fallback */}
      {!isSearchMode && remaining > 0 && (
        <>
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm font-medium text-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
            >
              {loadingMore
                ? "Chargement…"
                : `Voir plus (${remaining} ${pluralize(remaining, "restant", "restants")})`}
            </button>
          </div>
        </>
      )}

      {!isSearchMode && remaining <= 0 && items.length > 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Vous avez vu tous les enseignants inscrits.
        </p>
      )}

      {isSearchMode && total > 50 && (
        <p className="mt-4 text-center text-sm text-muted">
          Affinez votre recherche pour voir plus de résultats.
        </p>
      )}
    </div>
  );
}
