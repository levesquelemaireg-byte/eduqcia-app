import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ExperienceBadge, type ExperienceLevel } from "@/components/ui/ExperienceBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { IconButton } from "@/components/ui/IconButton";
import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { getDisplayName, getInitials } from "@/lib/utils/profile-display";
import { pluralize } from "@/lib/utils/pluralize";
import { NIVEAU_LABELS, DISCIPLINE_LABELS } from "@/lib/utils/profile-labels";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  genre: string | null;
  schoolName: string | null;
  cssName: string | null;
  createdAt: string;
  experienceLabel: ExperienceLevel;
  totalContributions: number;
  niveaux: string[];
  disciplines: string[];
  yearsExperience: number | null;
  isOwner: boolean;
  onEditClick?: () => void;
};

/** Carte profil unifiée — identité + infos professionnelles. */
export function ProfileHero({
  firstName,
  lastName,
  email,
  role,
  genre,
  schoolName,
  cssName,
  createdAt,
  experienceLabel,
  totalContributions,
  niveaux,
  disciplines,
  yearsExperience,
  isOwner,
  onEditClick,
}: Props) {
  const displayName = getDisplayName(firstName, lastName);
  const initials = getInitials(firstName, lastName);
  const memberSince = new Date(createdAt).getFullYear();

  // École avant CSS — l'école est plus importante
  const locationParts = [schoolName, cssName].filter(Boolean);

  const hasNiveaux = niveaux.length > 0;
  const hasDisciplines = disciplines.length > 0;
  const hasExperience = yearsExperience != null;
  const hasProfessionalInfo = hasNiveaux || hasDisciplines || hasExperience;

  return (
    <section
      aria-labelledby="profile-hero-heading"
      className="relative rounded-xl border border-border bg-panel p-5 md:p-6"
    >
      {/* Bouton modifier — position top-right */}
      {isOwner && onEditClick && (
        <IconButton
          icon="edit"
          aria-label="Modifier le profil"
          onClick={onEditClick}
          className="absolute top-3 right-3"
        />
      )}

      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <AvatarInitials initials={initials} size="lg" />

        <div className="min-w-0 flex-1 text-center md:text-left">
          {/* Nom */}
          <h1
            id="profile-hero-heading"
            className="text-2xl font-extrabold tracking-tight text-deep"
          >
            {displayName}
          </h1>

          {/* Rôle + statut contribution */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <RoleBadge role={role} genre={genre} />
            <ExperienceBadge level={experienceLabel} totalContributions={totalContributions} />
          </div>

          {/* École · CSS */}
          {locationParts.length > 0 && (
            <p className="mt-2 text-sm text-muted">{locationParts.join(" · ")}</p>
          )}

          {/* Email + copier (collés ensemble) */}
          <div className="mt-1 inline-flex items-center gap-[0.35em] text-sm text-muted">
            <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
              mail
            </span>
            <span>{email}</span>
            <CopyButton text={email} />
          </div>

          <p className="mt-1 text-sm text-muted">Membre depuis {memberSince}</p>

          {/* Infos professionnelles — pills sans titres ni sous-titres */}
          {(isOwner || hasProfessionalInfo) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
              {niveaux.map((code) => (
                <MetaPill key={code} icon="school" label={NIVEAU_LABELS[code] ?? code} />
              ))}
              {disciplines.map((code) => (
                <MetaPill key={code} icon="menu_book" label={DISCIPLINE_LABELS[code] ?? code} />
              ))}
              {hasExperience && (
                <MetaPill
                  icon="work_history"
                  label={`${yearsExperience} ${pluralize(yearsExperience, "année", "années")} d'expérience`}
                />
              )}
              {isOwner && !hasProfessionalInfo && (
                <p className="text-sm text-muted italic">
                  Précisez vos informations professionnelles pour faciliter la collaboration.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
