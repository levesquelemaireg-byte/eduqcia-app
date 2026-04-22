import Link from "next/link";

/** Lien Retour — hors carte fiche (`/questions/[id]`). */
export function FicheRetourLink() {
  return (
    <Link
      href="/questions"
      className="icon-text mb-6 inline-flex text-sm font-semibold text-steel hover:text-accent"
    >
      <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
        arrow_back
      </span>
      Retour
    </Link>
  );
}
