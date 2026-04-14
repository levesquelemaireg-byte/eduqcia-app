"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchProfileTasks, type ProfileTask } from "@/lib/queries/profile-contributions";
import { pluralize } from "@/lib/utils/pluralize";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

type Props = {
  profileId: string;
  isOwner: boolean;
  totalCount: number;
  initialItems: ProfileTask[];
};

export function ProfileTasksList({ profileId, isOwner, totalCount, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const remaining = totalCount - items.length;

  async function loadMore() {
    setLoading(true);
    const supabase = createClient();
    const more = await fetchProfileTasks(supabase, profileId, items.length);
    setItems((prev) => [...prev, ...more]);
    setLoading(false);
    if (liveRef.current) {
      liveRef.current.textContent = `${more.length} nouveaux résultats chargés`;
    }
  }

  if (totalCount === 0) {
    return (
      <div className="py-8 text-center">
        <span
          className="material-symbols-outlined mb-2 text-[32px] text-slate-400"
          aria-hidden="true"
        >
          quiz
        </span>
        <p className="text-base font-medium text-slate-700">
          {isOwner
            ? "Vous n'avez pas encore publié de tâche."
            : "Cet enseignant n'a pas encore partagé de tâche."}
        </p>
        {isOwner && (
          <Link
            href="/questions/new"
            className="mt-2 inline-block text-sm font-medium text-teal-600 hover:bg-teal-50"
          >
            Créer une tâche →
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div aria-live="polite" ref={liveRef} className="sr-only" />
      <ul className="space-y-3">
        {items.map((task) => {
          const consignePreview = task.consigne
            ? stripHtml(task.consigne).slice(0, 80) +
              (stripHtml(task.consigne).length > 80 ? "…" : "")
            : "—";

          return (
            <li key={task.id}>
              <Link
                href={`/questions/${task.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:border-slate-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <p className="font-medium text-slate-900">{consignePreview}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {task.oiTitre && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {task.oiTitre}
                    </span>
                  )}
                  {task.niveauLabel && <span>{task.niveauLabel}</span>}
                  {task.disciplineLabel && (
                    <>
                      <span>·</span>
                      <span>{task.disciplineLabel}</span>
                    </>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-sm text-slate-500">
                  <span>{new Date(task.createdAt).toLocaleDateString("fr-CA")}</span>
                  {task.usageCount > 0 && (
                    <span className="font-medium text-teal-600">
                      Utilisée {task.usageCount} {pluralize(task.usageCount, "fois", "fois")}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {remaining > 0 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-sm font-medium text-teal-600 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
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
