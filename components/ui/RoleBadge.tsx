import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { getRoleLabel } from "@/lib/utils/role-label";

type Props = {
  role: string;
  genre?: string | null;
  className?: string;
};

/** Badge rôle — MetaPill sans icône (§5.5). Genre conditionne l'accord. */
export function RoleBadge({ role, genre, className }: Props) {
  return <MetaPill label={getRoleLabel(role, genre)} className={className} />;
}
