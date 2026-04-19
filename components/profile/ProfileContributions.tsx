"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { pluralize } from "@/lib/utils/pluralize";
import { ProfileDocumentsList } from "@/components/profile/ProfileDocumentsList";
import { ProfileTasksList } from "@/components/profile/ProfileTasksList";
import { ProfileEvaluationsList } from "@/components/profile/ProfileEvaluationsList";
import type { ProfileTask, ProfileEvaluation } from "@/lib/queries/profile-contributions";
import type { DocumentEnrichedRow } from "@/lib/types/document-enriched";

type TabId = "documents" | "taches" | "epreuves";

const TABS: { id: TabId; singularLabel: string; pluralLabel: string }[] = [
  { id: "documents", singularLabel: "Document", pluralLabel: "Documents" },
  { id: "taches", singularLabel: "Tâche", pluralLabel: "Tâches" },
  { id: "epreuves", singularLabel: "Épreuve", pluralLabel: "Épreuves" },
];

type Props = {
  profileId: string;
  isOwner: boolean;
  counts: { documents: number; tasks: number; evaluations: number };
  initialDocuments: DocumentEnrichedRow[];
  initialTasks: ProfileTask[];
  initialEvaluations: ProfileEvaluation[];
};

/** Section contributions avec 3 onglets M3 — ordre Documents → Tâches → Épreuves (§11). */
export function ProfileContributions({
  profileId,
  isOwner,
  counts,
  initialDocuments,
  initialTasks,
  initialEvaluations,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("documents");

  const countMap: Record<TabId, number> = {
    documents: counts.documents,
    taches: counts.tasks,
    epreuves: counts.evaluations,
  };

  return (
    <section aria-labelledby="profile-contributions-heading">
      <h2 id="profile-contributions-heading" className="sr-only">
        Contributions publiées
      </h2>

      {/* Tabs M3 */}
      <div
        role="tablist"
        aria-label="Contributions publiées"
        className="flex border-b border-border"
      >
        {TABS.map((tab) => {
          const count = countMap[tab.id];
          const isActive = activeTab === tab.id;
          const label = pluralize(count, tab.singularLabel, tab.pluralLabel);

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => {
                const idx = TABS.findIndex((t) => t.id === tab.id);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  const next = TABS[(idx + 1) % TABS.length];
                  setActiveTab(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
                  setActiveTab(prev.id);
                  document.getElementById(`tab-${prev.id}`)?.focus();
                }
              }}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "relative min-h-[48px] flex-1 px-4 py-3 text-center text-sm font-medium transition-colors duration-150",
                isActive ? "text-accent font-semibold" : "text-muted hover:text-deep",
              )}
              aria-label={`${count} ${label} ${pluralize(count, "publiée", "publiées")}`}
            >
              {label} ({count})
              {isActive && (
                <span className="absolute right-0 bottom-0 left-0 h-[3px] rounded-t-sm bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="pt-4"
      >
        {activeTab === "documents" && (
          <ProfileDocumentsList
            profileId={profileId}
            isOwner={isOwner}
            totalCount={counts.documents}
            initialItems={initialDocuments}
          />
        )}
        {activeTab === "taches" && (
          <ProfileTasksList
            profileId={profileId}
            isOwner={isOwner}
            totalCount={counts.tasks}
            initialItems={initialTasks}
          />
        )}
        {activeTab === "epreuves" && (
          <ProfileEvaluationsList
            profileId={profileId}
            isOwner={isOwner}
            totalCount={counts.evaluations}
            initialItems={initialEvaluations}
          />
        )}
      </div>
    </section>
  );
}
