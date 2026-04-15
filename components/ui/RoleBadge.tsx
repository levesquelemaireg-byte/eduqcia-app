import { MetaPill } from "@/components/tae/fiche/MetaPill";

const ROLE_LABELS: Record<string, string> = {
  enseignant: "Enseignant",
  conseiller_pedagogique: "Conseiller pédagogique",
  admin: "Administrateur",
};

type Props = {
  role: string;
  className?: string;
};

/** Badge rôle — MetaPill sans icône (§5.5). */
export function RoleBadge({ role, className }: Props) {
  return <MetaPill label={ROLE_LABELS[role] ?? role} className={className} />;
}
