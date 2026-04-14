import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { pluralize } from "@/lib/utils/pluralize";

/** Mapping niveaux codes → labels courts pour MetaPill */
const NIVEAU_LABELS: Record<string, string> = {
  sec1: "Sec. 1",
  sec2: "Sec. 2",
  sec3: "Sec. 3",
  sec4: "Sec. 4",
};

/** Mapping disciplines codes → labels courts pour MetaPill */
const DISCIPLINE_LABELS: Record<string, string> = {
  HEC: "Histoire",
  GEO: "Géographie",
  HQC: "Hist. Qc et Canada",
};

type Props = {
  niveaux: string[];
  disciplines: string[];
  yearsExperience: number | null;
  isOwner: boolean;
  onEditClick?: () => void;
};

/** Section infos professionnelles — ordre Niveau → Discipline → Expérience (§5.5). */
export function ProfileProfessionalInfo({
  niveaux,
  disciplines,
  yearsExperience,
  isOwner,
  onEditClick,
}: Props) {
  const hasNiveaux = niveaux.length > 0;
  const hasDisciplines = disciplines.length > 0;
  const hasExperience = yearsExperience != null;

  // En mode visiteur, masquer la section entière si tout est vide
  if (!isOwner && !hasNiveaux && !hasDisciplines && !hasExperience) return null;

  return (
    <section
      aria-labelledby="profile-pro-heading"
      className="rounded-xl border border-border bg-panel p-5 md:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="profile-pro-heading" className="text-lg font-semibold text-deep">
          Informations professionnelles
        </h2>
        {isOwner && onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label="Modifier les informations professionnelles"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              edit
            </span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Niveaux */}
        {(isOwner || hasNiveaux) && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-deep">
              {pluralize(niveaux.length, "Niveau enseigné", "Niveaux enseignés")}
            </p>
            {hasNiveaux ? (
              <div className="flex flex-wrap gap-2">
                {niveaux.map((code) => (
                  <MetaPill key={code} icon="school" label={NIVEAU_LABELS[code] ?? code} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">
                Non renseigné — précisez vos niveaux pour faciliter la collaboration.
              </p>
            )}
          </div>
        )}

        {/* Disciplines */}
        {(isOwner || hasDisciplines) && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-deep">
              {pluralize(disciplines.length, "Discipline enseignée", "Disciplines enseignées")}
            </p>
            {hasDisciplines ? (
              <div className="flex flex-wrap gap-2">
                {disciplines.map((code) => (
                  <MetaPill key={code} icon="menu_book" label={DISCIPLINE_LABELS[code] ?? code} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">
                Non renseigné — ajoutez vos disciplines pour mieux contextualiser vos contenus.
              </p>
            )}
          </div>
        )}

        {/* Expérience */}
        {(isOwner || hasExperience) && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-deep">Expérience</p>
            {hasExperience ? (
              <MetaPill
                icon="schedule"
                label={`${yearsExperience} ${pluralize(yearsExperience, "année", "années")} d'expérience`}
              />
            ) : (
              <p className="text-sm text-muted italic">
                Non renseigné — indiquez vos années d&apos;expérience pour situer votre parcours.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
