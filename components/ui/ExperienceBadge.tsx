import { cn } from "@/lib/utils/cn";

export type ExperienceLevel = "nouveau" | "neutre" | "actif" | "experimente";

export function getExperienceLevel(totalContributions: number): ExperienceLevel {
  if (totalContributions === 0) return "nouveau";
  if (totalContributions < 10) return "neutre";
  if (totalContributions < 50) return "actif";
  return "experimente";
}

const LABELS: Record<ExperienceLevel, string | null> = {
  nouveau: "Nouveau membre",
  neutre: null,
  actif: "Contributeur actif",
  experimente: "Contributeur expérimenté",
};

type Props = {
  level: ExperienceLevel;
  totalContributions: number;
  className?: string;
};

/** Indicateur d'expérience neutre — affiché à côté du badge rôle (§5.5). */
export function ExperienceBadge({ level, totalContributions, className }: Props) {
  const label = LABELS[level];
  if (!label) return null;

  return (
    <span
      className={cn("text-sm font-medium text-slate-500", className)}
      aria-label={`${label} — basé sur ${totalContributions} contribution${totalContributions > 1 ? "s" : ""} publiée${totalContributions > 1 ? "s" : ""}`}
    >
      {label}
    </span>
  );
}
