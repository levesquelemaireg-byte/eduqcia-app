import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { cn } from "@/lib/utils/cn";

const ROLE_LABELS: Record<string, string> = {
  enseignant: "Enseignant",
  conseiller_pedagogique: "Conseiller pédagogique",
  admin: "Administrateur",
};

type Props = {
  role: string;
  className?: string;
};

/** Assist Chip M3 — badge rôle (§5.5). Wrapper MetaPill sans icône. */
export function RoleBadge({ role, className }: Props) {
  return (
    <MetaPill label={ROLE_LABELS[role] ?? role} className={cn("text-sm font-medium", className)} />
  );
}
