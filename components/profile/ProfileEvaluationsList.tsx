"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  fetchProfileEvaluations,
  type ProfileEvaluation,
} from "@/lib/queries/profile-contributions";
import { pluralize } from "@/lib/utils/pluralize";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton";

type Props = {
  profileId: string;
  isOwner: boolean;
  totalCount: number;
  initialItems: ProfileEvaluation[];
};

export function ProfileEvaluationsList({ profileId, isOwner, totalCount, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const remaining = totalCount - items.length;

  async function loadMore() {
    setLoading(true);
    const supabase = createClient();
    const more = await fetchProfileEvaluations(supabase, profileId, items.length);
    setItems((prev) => [...prev, ...more]);
    setLoading(false);
    if (liveRef.current) {
      liveRef.current.textContent = `${more.length} nouveaux résultats chargés`;
    }
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon="assignment"
        message={
          isOwner
            ? "Vous n'avez pas encore publié d'épreuve."
            : "Cet enseignant n'a pas encore partagé d'épreuve."
        }
      >
        {isOwner && (
          <Link
            href="/evaluations/new"
            className="mt-2 inline-block text-sm font-medium text-accent hover:bg-accent/10"
          >
            Créer une épreuve →
          </Link>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div aria-live="polite" ref={liveRef} className="sr-only" />
      <ul className="space-y-3">
        {items.map((evaluation) => (
          <li key={evaluation.id}>
            <Link
              href={`/evaluations/${evaluation.id}`}
              className="block rounded-xl border border-border bg-panel p-4 transition-all duration-150 hover:border-border hover:shadow-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <p className="font-medium text-deep">{evaluation.titre}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                <span>
                  {evaluation.tacheCount} {pluralize(evaluation.tacheCount, "tâche", "tâches")}
                </span>
                <span>·</span>
                <span>{new Date(evaluation.createdAt).toLocaleDateString("fr-CA")}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <LoadMoreButton remaining={remaining} loading={loading} onClick={loadMore} />
      )}
    </>
  );
}
