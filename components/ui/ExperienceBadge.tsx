import { MetaPill } from "@/components/tache/fiche/MetaPill";

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

/** Badge statut contribution — MetaPill avec icône award_star (§5.5). */
export function ExperienceBadge({ level, totalContributions, className }: Props) {
  const label = LABELS[level];
  if (!label) return null;

  return (
    <MetaPill
      icon="award_star"
      label={label}
      ariaLabel={`${label} — basé sur ${totalContributions} contribution${totalContributions > 1 ? "s" : ""} publiée${totalContributions > 1 ? "s" : ""}`}
      className={className}
    />
  );
}
