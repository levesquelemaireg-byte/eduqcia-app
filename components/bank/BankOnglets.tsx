import Link from "next/link";
import type { BankOnglet } from "@/lib/queries/bank-tasks";
import {
  PAGE_BANK_TAB_DOCUMENTS,
  PAGE_BANK_TAB_EVALUATIONS,
  PAGE_BANK_TAB_TASKS,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  actif: BankOnglet;
};

const tabs: { id: BankOnglet; href: string; label: string }[] = [
  { id: "taches", href: "/bank", label: PAGE_BANK_TAB_TASKS },
  { id: "documents", href: "/bank?onglet=documents", label: PAGE_BANK_TAB_DOCUMENTS },
  { id: "evaluations", href: "/bank?onglet=evaluations", label: PAGE_BANK_TAB_EVALUATIONS },
];

export function BankOnglets({ actif }: Props) {
  return (
    <nav
      className="mt-6 flex flex-wrap gap-2 border-b border-border pb-1"
      aria-label="Sections de la banque collaborative"
    >
      {tabs.map((t) => {
        const isActive = actif === t.id;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={cn(
              "inline-flex min-h-11 items-center rounded-t-lg border border-transparent px-4 text-sm font-semibold transition-colors",
              isActive
                ? "border-border border-b-panel bg-panel text-deep shadow-sm"
                : "text-muted hover:bg-panel-alt/80 hover:text-deep",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
