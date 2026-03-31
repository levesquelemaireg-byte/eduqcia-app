import Link from "next/link";
import type { MyTaeListFiltre } from "@/lib/queries/user-content";
import { cn } from "@/lib/utils/cn";

const ITEMS: { filtre: MyTaeListFiltre; label: string; href: string }[] = [
  { filtre: "toutes", label: "Toutes", href: "/questions" },
  { filtre: "brouillons", label: "Brouillons", href: "/questions?filtre=brouillons" },
  { filtre: "publiees", label: "Publiées", href: "/questions?filtre=publiees" },
];

type Props = {
  actif: MyTaeListFiltre;
};

export function MesQuestionsFiltres({ actif }: Props) {
  return (
    <nav aria-label="Filtrer la liste des tâches" className="mt-4 flex flex-wrap gap-2">
      {ITEMS.map(({ filtre, label, href }) => {
        const isActif = actif === filtre;
        return (
          <Link
            key={filtre}
            href={href}
            aria-current={isActif ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors",
              isActif
                ? "bg-accent text-white shadow-sm"
                : "border border-border bg-panel text-deep shadow-sm hover:bg-panel-alt",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
