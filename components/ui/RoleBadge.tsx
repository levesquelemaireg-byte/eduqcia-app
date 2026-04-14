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

/** Assist Chip M3 — badge rôle (§5.5). */
export function RoleBadge({ role, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-700",
        className,
      )}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
