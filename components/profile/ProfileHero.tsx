import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ExperienceBadge, type ExperienceLevel } from "@/components/ui/ExperienceBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { getDisplayName, getInitials } from "@/lib/utils/profile-display";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  schoolName: string | null;
  cssName: string | null;
  createdAt: string;
  experienceLabel: ExperienceLevel;
  totalContributions: number;
  isOwner: boolean;
  onEditClick?: () => void;
};

/** Hero card complet — §5.5. */
export function ProfileHero({
  firstName,
  lastName,
  email,
  role,
  schoolName,
  cssName,
  createdAt,
  experienceLabel,
  totalContributions,
  isOwner,
  onEditClick,
}: Props) {
  const displayName = getDisplayName(firstName, lastName);
  const initials = getInitials(firstName, lastName);
  const memberSince = new Date(createdAt).getFullYear();

  return (
    <section
      aria-labelledby="profile-hero-heading"
      className="rounded-xl border border-border bg-panel p-5 md:p-6"
    >
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <AvatarInitials initials={initials} size="lg" />

        <div className="min-w-0 flex-1 text-center md:text-left">
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <h1
              id="profile-hero-heading"
              className="text-2xl font-extrabold tracking-tight text-deep"
            >
              {displayName}
            </h1>
            {isOwner && onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Modifier les informations d'identité"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  edit
                </span>
              </button>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <RoleBadge role={role} />
            <ExperienceBadge level={experienceLabel} totalContributions={totalContributions} />
          </div>

          {(cssName || schoolName) && (
            <p className="mt-2 text-sm text-muted">
              {[cssName, schoolName].filter(Boolean).join(" · ")}
            </p>
          )}

          <div className="mt-1 flex items-center justify-center gap-1 md:justify-start">
            <span className="text-sm text-muted">{email}</span>
            <CopyButton text={email} />
          </div>

          <p className="mt-1 text-sm text-muted">Membre depuis {memberSince}</p>
        </div>
      </div>
    </section>
  );
}
