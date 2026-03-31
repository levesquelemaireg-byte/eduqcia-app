import Link from "next/link";
import { DOCUMENT_FICHE_RETOUR } from "@/lib/ui/ui-copy";

/** Retour banque — onglet documents ; même pattern que `FicheRetourLink` (fiche tâche). */
export function DocumentFicheRetourLink() {
  return (
    <Link
      href="/bank?onglet=documents"
      className="icon-text mb-6 inline-flex text-sm font-semibold text-steel hover:text-accent"
    >
      <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
        arrow_back
      </span>
      {DOCUMENT_FICHE_RETOUR}
    </Link>
  );
}
