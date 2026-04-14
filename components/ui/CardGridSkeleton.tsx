/**
 * Squelette animé pour une grille de cartes (2 colonnes sur desktop).
 * Réutilisé par les fichiers loading.tsx des routes grille (tâches, banque, dashboard widgets).
 */
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-panel p-4 shadow-sm">
      <div className="h-5 w-3/4 rounded bg-border" />
      <div className="mt-3 h-3.5 w-full rounded bg-border" />
      <div className="mt-2 h-3.5 w-2/3 rounded bg-border" />
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-5 w-20 rounded-full bg-border" />
        <div className="h-5 w-16 rounded-full bg-border" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4, cols = 2 }: { count?: number; cols?: 1 | 2 }) {
  const gridClass = cols === 2 ? "grid gap-4 sm:grid-cols-2" : "grid gap-4";
  return (
    <div className={gridClass}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
