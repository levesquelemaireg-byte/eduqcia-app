import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/admin";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { getDashboardStats, parseSchoolJson } from "@/lib/queries/dashboard";
import {
  CTA_CREER_UNE_TACHE,
  DASHBOARD_INCOMPLETE_DOCUMENTS_COUNT,
  DASHBOARD_INCOMPLETE_DOCUMENTS_EMPTY,
  DASHBOARD_INCOMPLETE_DOCUMENTS_HINT,
  DASHBOARD_INCOMPLETE_DOCUMENTS_TITLE,
} from "@/lib/ui/ui-copy";

function formatConfidence(avg: number | null, voteRows: number): string {
  if (avg == null || voteRows === 0) {
    return "En attente de votes";
  }
  return `${avg.toFixed(1)}/3 — ${voteRows} vote${voteRows > 1 ? "s" : ""}`;
}

export async function DashboardContent({ userId }: { userId: string }) {
  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, school")
    .eq("id", userId)
    .maybeSingle();

  const stats = await getDashboardStats(userId);
  const school = parseSchoolJson(profile?.school ?? null);

  const fullName = profile?.full_name ?? "";
  const ecoleLabel = school.ecole?.trim() || "École non renseignée";
  const cssLabel = school.css?.trim() || "Centre de services non renseigné";

  return (
    <>
      <header className="rounded-xl border border-border bg-panel p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-deep md:text-2xl">{fullName}</h1>
            <p className="mt-1 text-sm text-muted">
              {ecoleLabel}
              <span className="text-border"> · </span>
              {cssLabel}
            </p>
          </div>
          <Link
            href={`/profile/${userId}`}
            className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-border bg-panel px-4 py-2 text-sm font-semibold text-deep hover:bg-panel-alt"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              edit
            </span>
            Modifier mon profil
          </Link>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-panel-alt px-3 py-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Tâches d&apos;apprentissage et d&apos;évaluation publiées
            </dt>
            <dd className="mt-1 text-lg font-semibold text-deep">{stats.taePublished}</dd>
          </div>
          <div className="rounded-lg bg-panel-alt px-3 py-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Épreuves</dt>
            <dd className="mt-1 text-lg font-semibold text-deep">{stats.evaluationsCount}</dd>
          </div>
          <div className="rounded-lg bg-panel-alt px-3 py-2 sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Indice de confiance
            </dt>
            <dd className="mt-1 text-sm font-semibold leading-snug text-deep">
              {formatConfidence(stats.averageConfidence, stats.votesCount)}
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Notifications"
          icon="notifications"
          badge={stats.unreadNotifications}
        >
          {stats.unreadNotifications === 0 ? (
            <p className="text-muted">Aucune notification pour le moment.</p>
          ) : (
            <p className="text-deep">
              {stats.unreadNotifications} notification non lue
              {stats.unreadNotifications > 1 ? "s" : ""}.
            </p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Mes tâches d'apprentissage et d'évaluation" icon="quiz">
          {stats.taePublished === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted">Aucune tâche d&apos;apprentissage et d&apos;évaluation.</p>
              <Link
                href="/questions/new"
                className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                {CTA_CREER_UNE_TACHE}
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          ) : (
            <p className="text-muted">
              {stats.taePublished} tâche{stats.taePublished > 1 ? "s" : ""} d&apos;apprentissage et
              d&apos;évaluation publiée{stats.taePublished > 1 ? "s" : ""}. La liste détaillée
              arrive prochainement.
            </p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Mes épreuves" icon="assignment">
          {stats.evaluationsCount === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted">Aucune épreuve pour le moment.</p>
              <Link
                href="/evaluations/new"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
              >
                Créer une épreuve
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          ) : (
            <p className="text-muted">
              {stats.evaluationsCount} épreuve créée{stats.evaluationsCount > 1 ? "s" : ""}.
            </p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title={DASHBOARD_INCOMPLETE_DOCUMENTS_TITLE}
          icon="history_edu"
          badge={stats.unpublishedDocumentsCount}
        >
          {stats.unpublishedDocumentsCount === 0 ? (
            <p className="text-muted">{DASHBOARD_INCOMPLETE_DOCUMENTS_EMPTY}</p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-deep">
                {DASHBOARD_INCOMPLETE_DOCUMENTS_COUNT(stats.unpublishedDocumentsCount)}
              </p>
              <p className="text-sm text-muted">{DASHBOARD_INCOMPLETE_DOCUMENTS_HINT}</p>
              <Link
                href="/bank?onglet=documents"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
              >
                Banque collaborative — documents
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Mes favoris" icon="bookmark">
          {stats.favoritesCount === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted">Aucun favori pour le moment.</p>
              <Link
                href="/bank"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
              >
                Parcourir la banque
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          ) : (
            <p className="text-muted">
              {stats.favoritesCount} favori{stats.favoritesCount > 1 ? "s" : ""}.
            </p>
          )}
        </DashboardWidget>
      </div>
    </>
  );
}
