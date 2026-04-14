"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  fetchProfileEvaluations,
  type ProfileEvaluation,
} from "@/lib/queries/profile-contributions";
import { pluralize } from "@/lib/utils/pluralize";

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
      <div className="py-8 text-center">
        <span className="material-symbols-outlined mb-2 text-[32px] text-muted" aria-hidden="true">
          assignment
        </span>
        <p className="text-base font-medium text-deep">
          {isOwner
            ? "Vous n'avez pas encore publié d'épreuve."
            : "Cet enseignant n'a pas encore partagé d'épreuve."}
        </p>
        {isOwner && (
          <Link
            href="/evaluations/new"
            className="mt-2 inline-block text-sm font-medium text-accent hover:bg-accent/10"
          >
            Créer une épreuve →
          </Link>
        )}
      </div>
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
                  {evaluation.taeCount} {pluralize(evaluation.taeCount, "tâche", "tâches")}
                </span>
                <span>·</span>
                <span>{new Date(evaluation.createdAt).toLocaleDateString("fr-CA")}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-sm font-medium text-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {loading
              ? "Chargement…"
              : `Voir plus (${remaining} ${pluralize(remaining, "restant", "restants")})`}
          </button>
        </div>
      )}
    </>
  );
}
