import { pluralize } from "@/lib/utils/pluralize";

type Props = {
  remaining: number;
  loading: boolean;
  onClick: () => void;
};

/** Bouton « Voir plus » avec compteur restant — listes paginées (§11). */
export function LoadMoreButton({ remaining, loading, onClick }: Props) {
  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="text-sm font-medium text-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {loading
          ? "Chargement…"
          : `Voir plus (${remaining} ${pluralize(remaining, "restant", "restants")})`}
      </button>
    </div>
  );
}
