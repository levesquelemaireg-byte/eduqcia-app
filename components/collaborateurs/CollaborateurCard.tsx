import Link from "next/link";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { getDisplayName, getInitials } from "@/lib/utils/profile-display";
import { pluralize } from "@/lib/utils/pluralize";
import { NIVEAU_LABELS, DISCIPLINE_LABELS } from "@/lib/utils/profile-labels";

type Props = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  cssName: string | null;
  docCount: number;
  taskCount: number;
  evalCount: number;
  disciplines: string[];
  niveaux: string[];
};

/** Carte collaborateur 4 lignes M3 outlined — §12.3. */
export function CollaborateurCard({
  id,
  firstName,
  lastName,
  email,
  role,
  cssName,
  docCount,
  taskCount,
  evalCount,
  disciplines,
  niveaux,
}: Props) {
  const displayName = getDisplayName(firstName, lastName);
  const initials = getInitials(firstName, lastName);
  const totalContributions = docCount + taskCount + evalCount;
  const hasPills = niveaux.length > 0 || disciplines.length > 0;

  return (
    <Link
      href={`/profile/${id}`}
      prefetch={false}
      className="block rounded-xl border border-border bg-panel p-4 transition-all duration-150 hover:border-border hover:shadow-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label={`${displayName}${cssName ? ` — ${cssName}` : ""}`}
    >
      <div className="flex items-start gap-3">
        <AvatarInitials initials={initials} size="md" />

        <div className="min-w-0 flex-1">
          {/* Ligne 1 : Nom + badge rôle */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-deep">{displayName}</span>
            <RoleBadge role={role} className="!h-6 !px-2.5 !text-xs" />
          </div>

          {/* Ligne 2 : École + compteurs */}
          <p className="mt-0.5 text-sm text-muted">
            {cssName && <span>{cssName} · </span>}
            {totalContributions === 0 ? (
              <span className="italic text-muted">Aucune contribution pour le moment</span>
            ) : (
              <>
                {docCount} {pluralize(docCount, "document", "documents")} · {taskCount}{" "}
                {pluralize(taskCount, "tâche", "tâches")} · {evalCount}{" "}
                {pluralize(evalCount, "épreuve", "épreuves")}
              </>
            )}
          </p>

          {/* Ligne 3 : Courriel + copier */}
          <div className="mt-0.5 flex items-center gap-1">
            <span className="truncate text-sm text-muted">{email}</span>
            <CopyButton text={email} className="!h-7 !w-7" />
          </div>

          {/* Ligne 4 : MetaPills niveaux + disciplines */}
          {hasPills && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {niveaux.map((code) => (
                <MetaPill
                  key={code}
                  icon="school"
                  label={NIVEAU_LABELS[code] ?? code}
                  className="!min-h-6 !px-2 !py-0.5 !text-[11px]"
                />
              ))}
              {disciplines.map((code) => (
                <MetaPill
                  key={code}
                  icon="menu_book"
                  label={DISCIPLINE_LABELS[code] ?? code}
                  className="!min-h-6 !px-2 !py-0.5 !text-[11px]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
